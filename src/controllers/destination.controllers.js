// src/controllers/destinationController.js
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/destinations                      — list all
// GET /api/destinations/:slug                — single destination + its data
// GET /api/destinations/:slug/hotels         — delegate to hotelController
// GET /api/destinations/:slug/restaurants    — delegate to restaurantController
// GET /api/destinations/:slug/attractions    — from DB only
// ─────────────────────────────────────────────────────────────────────────────
import Destination from "../models/destination.model.js";
import Attraction from "../models/attraction.model.js";
import Restaurant from "../models/resturant.model.js";
import Hotel from "../models/hotel.model.js";

// Delegate to the controllers that own the Groq fallback logic
import { getHotelsBySlug } from "./hotel.controllers.js";
import { getRestaurantsBySlug } from "./resturant.controllers.js";

// ── GET /api/destinations ─────────────────────────────────────────────────────
export const listDestinations = async (req, res, next) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [destinations, total] = await Promise.all([
      Destination.find(filter)
        .select("-__v")
        .sort({ name: 1 })
        .skip(Number(offset))
        .limit(Number(limit)),
      Destination.countDocuments(filter),
    ]);

    res.json({
      destinations,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/destinations/:slug ───────────────────────────────────────────────
export const getDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findOne({
      slug: req.params.slug,
      isActive: true,
    }).select("-__v");

    if (!destination)
      return res.status(404).json({ error: "Destination not found." });

    // FIX: use `destination` (not `destinationId`) — matches the Mongoose schema
    const [attractions, restaurants, hotels] = await Promise.all([
      Attraction.find({ destination: destination._id, isActive: true })
        .select("-__v")
        .sort({ visitDurationMins: 1 }),
      Restaurant.find({ destination: destination._id, isActive: true })
        .select("-__v")
        .sort({ rating: -1 }),
      Hotel.find({ destination: destination._id, isActive: true })
        .select("-__v")
        .sort({ pricePerNight: 1 }),
    ]);

    res.json({ destination, attractions, restaurants, hotels });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/destinations/:slug/hotels ────────────────────────────────────────
// Delegates to hotelController which owns the Groq fallback
export { getHotelsBySlug as getDestinationHotels };

// ── GET /api/destinations/:slug/restaurants ───────────────────────────────────
export { getRestaurantsBySlug as getDestinationRestaurants };

// ── GET /api/destinations/:slug/attractions ───────────────────────────────────
export const getDestinationAttractions = async (req, res, next) => {
  try {
    const destination = await Destination.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!destination)
      return res.status(404).json({ error: "Destination not found." });

    const filter = { destination: destination._id, isActive: true };
    if (req.query.category) filter.category = req.query.category;

    const attractions = await Attraction.find(filter)
      .select("-__v")
      .sort({ visitDurationMins: 1 });

    res.json({ attractions });
  } catch (err) {
    next(err);
  }
};
