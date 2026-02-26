import Destination from "../models/destination.model.js";
import Attraction from "../models/attraction.model.js";
import Restaurant from "../models/resturant.model.js";
import Hotel from "../models/hotel.model.js";
import Itinerary from "../models/itinearary.model.js";
import { generateItineraryAI } from "../services/itinearary.js";

// ── POST /api/generate
export const generateItinerary = async (req, res) => {
  try {
    const {
      destination: destinationName,
      originCity,
      days,
      startDate,
      endDate,
      adults = 2,
      children = 0,
      tier = "standard",
      interests = [],
      dailyBudgetPerPerson = 3000,
    } = req.body;

    // ── Validate
    if (!destinationName)
      return res.status(400).json({ error: "destination is required." });
    if (!originCity)
      return res.status(400).json({ error: "originCity is required." });
    if (!days || Number(days) < 1 || Number(days) > 30)
      return res.status(400).json({ error: "days must be between 1 and 30." });
    if (!["economy", "standard", "luxury"].includes((tier || "").toLowerCase()))
      return res
        .status(400)
        .json({ error: "tier must be economy, standard or luxury." });

    const normalizedTier = tier.toLowerCase();
    const destBaseName = destinationName.split(",")[0].trim();

    // ── 1. Look up destination in DB ────────────────────────────────────────
    const destination = await Destination.findOne({
      isActive: true,
      $or: [
        {
          slug: {
            $regex: destBaseName.toLowerCase().replace(/\s+/g, "-"),
            $options: "i",
          },
        },
        { name: { $regex: destBaseName, $options: "i" } },
      ],
    });

    let destinationId;
    let attractions = [];
    let restaurants = [];
    let hotels = [];

    if (destination) {
      destinationId = destination._id;
      // Load real DB data for this destination — feeds into the AI prompt for accuracy
      [attractions, restaurants, hotels] = await Promise.all([
        Attraction.find({
          destinationId: destination._id,
          isActive: true,
        })
          .limit(15)
          .lean(),
        Restaurant.find({
          destinationId: destination._id,
          isActive: true,
        })
          .sort({ rating: -1 })
          .limit(10)
          .lean(),
        Hotel.find({
          destinationId: destination._id,
          isActive: true,
          tier: normalizedTier,
        })
          .limit(5)
          .lean(),
      ]);
    } else {
      // Unknown destination — auto-create placeholder so FK constraint doesn't break
      destinationId = await createPlaceholderDestination(destinationName);
    }

    // ── 2. Build prompt and call Claude ─────────────────────────────────────
    // callClaude now accepts a params object — builds the full prompt internally
    // and returns { aiData, generationTimeMs, modelUsed }
    const { aiData, generationTimeMs, modelUsed } = await generateItineraryAI({
      destinationName, // full string e.g. "Goa" or "Jaipur, Rajasthan"
      originCity,
      days: Number(days),
      adults: Number(adults),
      children: Number(children),
      tier: normalizedTier,
      interests: Array.isArray(interests) ? interests : [],
      dailyBudgetPerPerson: Number(dailyBudgetPerPerson),
      attractions, // real DB data (may be empty for unknown destinations)
      restaurants,
      hotels,
    });

    // ── 3. Map AI days/slots — preserve suggestions for food slots ───────────
    const mappedDays = (aiData.days || []).map((day) => ({
      dayNumber: day.dayNumber,
      date: startDate
        ? new Date(
            new Date(startDate).getTime() + (day.dayNumber - 1) * 86400000,
          )
        : null,
      title: day.title || `Day ${day.dayNumber}`,
      summary: day.summary || null,
      slots: (day.slots || []).map((slot) => ({
        slotOrder: slot.slotOrder || 1,
        timeLabel: slot.timeLabel || null,
        type: slot.type || "attraction",
        title: slot.title || "Activity",
        description: slot.description || null,
        durationMins: slot.durationMins || null,
        estimatedCost: slot.estimatedCost || 0,
        aiTip: slot.aiTip || null,
        // ← Crucial: food slots carry restaurant suggestions from AI
        suggestions: Array.isArray(slot.suggestions) ? slot.suggestions : [],
      })),
    }));

    // ── 4. Budget breakdown for all 3 tiers ─────────────────────────────────
    const budgetBreakdown = ["economy", "standard", "luxury"].map((t) => {
      const b = aiData.budgetEstimate?.[t] || {};
      return {
        tier: t,
        accommodation: b.accommodation || 0,
        food: b.food || 0,
        transport: b.transport || 0,
        entryFees: b.entryFees || 0,
        miscellaneous: b.misc || 0,
        total: b.total || 0,
        perPerson: b.perPerson || 0,
      };
    });

    // ── 5. Hotel refs from DB (for populated response) ───────────────────────
    const hotelRefs = hotels.slice(0, 3).map((h) => ({
      hotel: h._id,
      tier: normalizedTier,
      pricePerNight: h.pricePerNight || 0,
      isSelected: true,
      checkIn: startDate ? new Date(startDate) : null,
      checkOut: endDate ? new Date(endDate) : null,
    }));

    // ── 6. Save to MongoDB ───────────────────────────────────────────────────
    const itinerary = await Itinerary.create({
      user: req.user?.userId || null,
      destination: destinationId,
      title: aiData.title || `${Number(days)}-Day ${destBaseName} Itinerary`,
      originCity,
      totalDays: Number(days),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      adults: Number(adults),
      children: Number(children),
      budgetTier: normalizedTier,
      interests: Array.isArray(interests) ? interests : [],
      dailyBudgetPerPerson: Number(dailyBudgetPerPerson),
      status: "generated",
      days: mappedDays,
      hotels: hotelRefs,
      budgetBreakdown,
      travelTips: Array.isArray(aiData.travelTips) ? aiData.travelTips : [],
      bestTimeToVisit: aiData.bestTimeToVisit || null,
      localPhrases: Array.isArray(aiData.localPhrases)
        ? aiData.localPhrases
        : [],
      aiModelUsed: modelUsed,
      generationTimeMs,
      estimatedCostEconomy: aiData.budgetEstimate?.economy?.total || null,
      estimatedCostStandard: aiData.budgetEstimate?.standard?.total || null,
      estimatedCostLuxury: aiData.budgetEstimate?.luxury?.total || null,
    });

    // Populate for frontend response
    await itinerary.populate(
      "destination",
      "name slug heroImageUrl state bestSeason",
    );
    await itinerary.populate("hotels.hotel");

    // ── 7. Respond ───────────────────────────────────────────────────────────
    res.status(201).json({
      itinerary,
      shareUrl: `${process.env.FRONTEND_URL}/trip/${itinerary.shareToken}`,
      meta: {
        generationTimeMs,
        modelUsed,
        travelTips: Array.isArray(aiData.travelTips) ? aiData.travelTips : [],
        bestTimeToVisit: aiData.bestTimeToVisit || "",
        localPhrases: Array.isArray(aiData.localPhrases)
          ? aiData.localPhrases
          : [],
        // AI-generated hotel suggestions (richer than DB hotels — always destination-specific)
        hotelSuggestions: Array.isArray(aiData.hotelSuggestions)
          ? aiData.hotelSuggestions
          : [],
      },
    });
  } catch (err) {
    console.error("[generateItinerary] Error:", err.message);
    res.status(500).json({
      error: err.message || "AI generation failed. Please try again.",
    });
  }
};

// ── GET /api/generate/packages — instant math estimates, no AI
export const getPackagePrices = (req, res) => {
  const { days, adults, children = 0, dailyBudget = 3000 } = req.query;

  if (!days || !adults)
    return res.status(400).json({ error: "days and adults are required." });

  const d = Number(days);
  const a = Number(adults);
  const c = Number(children);
  const base = Number(dailyBudget) * d * (a + c * 0.5);

  res.json({
    packages: {
      economy: {
        perPerson: Math.round((base * 0.55) / a),
        total: Math.round(base * 0.55),
        stay: "Budget guesthouses & hostels",
        transport: "Trains, buses & shared cabs",
        food: "Dhabas & street food",
        highlights: [
          "Local guided walks",
          "Street food trail",
          "Budget temple visits",
        ],
      },
      standard: {
        perPerson: Math.round(base / a),
        total: Math.round(base),
        stay: "3–4 star hotels & boutique havelis",
        transport: "Private cab + trains",
        food: "Curated restaurants & local gems",
        highlights: [
          "Guided heritage tours",
          "Curated dining picks",
          "AC private transport",
        ],
      },
      luxury: {
        perPerson: Math.round((base * 2.3) / a),
        total: Math.round(base * 2.3),
        stay: "Heritage palaces & 5-star resorts",
        transport: "Chauffeur-driven luxury SUV",
        food: "Fine dining & private chef",
        highlights: [
          "Private heritage access",
          "Spa & wellness daily",
          "Exclusive local experiences",
        ],
      },
    },
  });
};

// ── Helper ────────────────────────────────────────────────────────────────────
async function createPlaceholderDestination(nameStr) {
  const name = (nameStr || "").split(",")[0].trim();
  const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
  const doc = await Destination.create({
    name,
    slug,
    state: nameStr.split(",")[1]?.trim() || "India",
    category: "Heritage",
    description: `AI-generated destination: ${nameStr}`,
    heroImageUrl:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1920&q=90",
    bestSeason: "Oct–Mar",
  });
  return doc._id;
}
