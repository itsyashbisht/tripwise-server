// src/controllers/hotelController.js
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/hotels        — list with filters (destinationId, tier, price range)
// GET /api/hotels/:id    — single hotel by MongoDB _id
//
// Groq AI fallback: if a destination slug is provided but has no hotels in DB,
// we call Groq to generate them, save them, and return in the same request.
// The next request for the same slug hits MongoDB directly — zero AI latency.
// ─────────────────────────────────────────────────────────────────────────────
import Hotel from "../models/hotel.model.js";
import Destination from "../models/destination.model.js";
import {
  generateAndSaveHotels,
  upsertDestination,
} from "../services/hotelAndResutrant.groq.js";

// ── GET /api/hotels ───────────────────────────────────────────────────────────
export const listHotels = async (req, res, next) => {
  try {
    const {
      destinationId,
      slug, // ← frontend can pass slug instead of ObjectId
      tier,
      minPrice,
      maxPrice,
      limit = 20,
      offset = 0,
    } = req.query;

    const filter = { isActive: true };

    // ── Resolve destination
    if (destinationId) {
      filter.destination = destinationId;
    } else if (slug) {
      const dest = await Destination.findOne({
        slug: slug.toLowerCase(),
        isActive: true,
      });
      if (dest) filter.destination = dest._id;
    }

    if (tier) filter.tier = tier;
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    const [hotels, total] = await Promise.all([
      Hotel.find(filter)
        .populate("destination", "name slug state")
        .select("-__v")
        .sort({ pricePerNight: 1 })
        .skip(Number(offset))
        .limit(Number(limit)),
      Hotel.countDocuments(filter),
    ]);

    res.json({ hotels, total });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/hotels/:id ───────────────────────────────────────────────────────
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("destination", "name slug state heroImageUrl")
      .select("-__v");

    if (!hotel) return res.status(404).json({ error: "Hotel not found." });
    res.json({ hotel });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/destinations/:slug/hotels  (called from destinationController) ───
// This is the handler that powers HotelsPage — finds by slug, falls back to Groq
export const getHotelsBySlug = async (req, res, next) => {
  try {
    const slug = (req.params.slug || "").toLowerCase().trim();
    const tier = req.query.tier;

    // 1. Find or create the destination document
    let destination = await Destination.findOne({ slug, isActive: true });

    if (!destination) {
      // Slug not in DB at all — create it via Groq
      const cityName = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      destination = await upsertDestination(cityName);
    }

    // 2. Try to find hotels in DB
    const filter = { destination: destination._id, isActive: true };
    if (tier) filter.tier = tier;

    let hotels = await Hotel.find(filter)
      .select("-__v")
      .sort({ pricePerNight: 1 });

    // 3. If DB has nothing → generate via Groq and save
    if (hotels.length === 0) {
      console.log(
        `[hotelController] No hotels for "${destination.name}" — calling Groq`,
      );
      hotels = await generateAndSaveHotels(destination.name, destination);

      // Apply tier filter to the freshly generated set in memory
      if (tier) hotels = hotels.filter((h) => h.tier === tier);
    }

    res.json({ hotels });
  } catch (err) {
    next(err);
  }
};
