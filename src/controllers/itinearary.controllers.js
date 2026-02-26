import Itinerary from "../models/itinearary.model.js";
import SavedPlan from "../models/savedPlan.model.js";

// ── GET /api/itineraries — logged-in user's own itineraries ──────────────────
export const getMyItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user?._id })
      .populate("destinationId", "name slug heroImageUrl state")
      .select("-days.slots -__v") // skip heavy slot data in list view
      .sort({ createdAt: -1 });

    res.json({ itineraries });
  } catch (err) {
    console.error("[getMyItineraries]", err.message);
    res.status(500).json({ error: "Failed to fetch itineraries." });
  }
};

// ── GET /api/itineraries/saved ────────────────────────────────────────────────
export const getSavedItineraries = async (req, res) => {
  try {
    const saved = await SavedPlan.find({ userId: req.user?._id })
      .populate({
        path: "itineraryId",
        select: "-days.slots -__v",
        populate: {
          path: "destinationId",
          select: "name slug heroImageUrl state",
        },
      })
      .sort({ savedAt: -1 });

    res.json({ saved });
  } catch (err) {
    console.error("[getSavedItineraries]", err.message);
    res.status(500).json({ error: "Failed to fetch saved itineraries." });
  }
};

// ── GET /api/itineraries/shared/:token — public, no auth required ─────────────
export const getByShareToken = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ shareToken: req.params.token })
      .populate("destinationId", "name slug heroImageUrl state bestSeason")
      .populate("hotels.hotelId")
      .select("-__v");

    if (!itinerary)
      return res.status(404).json({ error: "Shared itinerary not found." });
    res.json({ itinerary });
  } catch (err) {
    console.error("[getByShareToken]", err.message);
    res.status(500).json({ error: "Failed to fetch shared itinerary." });
  }
};

// ── GET /api/itineraries/:id ──────────────────────────────────────────────────
export const getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate("destinationId", "name slug heroImageUrl state bestSeason")
      .populate("hotels.hotelId")
      .select("-__v");

    if (!itinerary)
      return res.status(404).json({ error: "Itinerary not found." });

    // Only owner or public (generated/shared) can view
    const isOwner = req.user && String(itinerary.userId) === req.user.userId;
    const isPublic = ["generated", "shared"].includes(itinerary.status);
    if (!isOwner && !isPublic)
      return res.status(403).json({ error: "Access denied." });

    res.json({ itinerary });
  } catch (err) {
    console.error("[getItineraryById]", err.message);
    res.status(500).json({ error: "Failed to fetch itinerary." });
  }
};

// ── DELETE /api/itineraries/:id ───────────────────────────────────────────────
export const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary)
      return res.status(404).json({ error: "Itinerary not found." });
    if (String(itinerary.userId) !== req.user.userId)
      return res.status(403).json({ error: "Not your itinerary." });

    await Itinerary.findByIdAndDelete(req.params.id);
    await SavedPlan.deleteMany({ itineraryId: req.params.id });

    res.json({ message: "Itinerary deleted." });
  } catch (err) {
    console.error("[deleteItinerary]", err.message);
    res.status(500).json({ error: "Failed to delete itinerary." });
  }
};

// ── POST /api/itineraries/:id/save ───────────────────────────────────────────
export const saveItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary)
      return res.status(404).json({ error: "Itinerary not found." });

    // Upsert: save it if not already saved
    const saved = await SavedPlan.findOneAndUpdate(
      { userId: req.user.userId, itineraryId: req.params.id },
      {
        userId: req.user.userId,
        itineraryId: req.params.id,
        note: req.body.note || null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await Itinerary.findByIdAndUpdate(req.params.id, { status: "saved" });
    res.json({ saved, message: "Trip saved to your collection." });
  } catch (err) {
    if (err.code === 11000)
      return res.status(200).json({ message: "Already saved." });
    console.error("[saveItinerary]", err.message);
    res.status(500).json({ error: "Failed to save itinerary." });
  }
};

// ── DELETE /api/itineraries/:id/save — unsave a trip ─────────────────────────
export const unsaveItinerary = async (req, res) => {
  try {
    await SavedPlan.findOneAndDelete({
      userId: req.user.userId,
      itineraryId: req.params.id,
    });
    res.json({ message: "Removed from saved trips." });
  } catch (err) {
    console.error("[unsaveItinerary]", err.message);
    res.status(500).json({ error: "Failed to unsave itinerary." });
  }
};

// ── POST /api/itineraries/:id/share — get shareable link ─────────────────────
export const shareItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      { status: "shared" },
      { new: true },
    );
    if (!itinerary)
      return res.status(404).json({ error: "Itinerary not found." });

    const shareUrl = `${process.env.FRONTEND_URL}/trip/${itinerary.shareToken}`;
    res.json({ shareUrl, shareToken: itinerary.shareToken });
  } catch (err) {
    console.error("[shareItinerary]", err.message);
    res.status(500).json({ error: "Failed to create share link." });
  }
};
