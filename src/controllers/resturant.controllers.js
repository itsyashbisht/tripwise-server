// src/controllers/restaurantController.js
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/restaurants        — list with filters
// GET /api/restaurants/:id    — single restaurant
//
// Groq AI fallback: when a destination slug has no restaurants in MongoDB,
// Groq generates them and saves them so the next request is instant.
// ─────────────────────────────────────────────────────────────────────────────
import Restaurant from "../models/resturant.model.js";
import Destination from "../models/destination.model.js";
import {
  generateAndSaveRestaurants,
  upsertDestination,
} from "../services/hotelAndResutrant.groq.js";

// ── GET /api/restaurants ──────────────────────────────────────────────────────
export const listRestaurants = async (req, res, next) => {
  try {
    const {
      destinationId,
      slug,
      isVeg,
      priceRange,
      limit = 20,
      offset = 0,
    } = req.query;

    const filter = { isActive: true };

    if (destinationId) {
      filter.destination = destinationId;
    } else if (slug) {
      const dest = await Destination.findOne({
        slug: slug.toLowerCase(),
        isActive: true,
      });
      if (dest) filter.destination = dest._id;
    }

    if (isVeg !== undefined) filter.isVeg = isVeg === "true";
    if (priceRange) filter.priceRange = priceRange;

    const restaurants = await Restaurant.find(filter)
      .populate("destination", "name slug")
      .select("-__v")
      .sort({ rating: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    res.json({ restaurants });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/restaurants/:id ──────────────────────────────────────────────────
export const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "destination",
      "name slug",
    );

    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found." });
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/destinations/:slug/restaurants (called from destinationController)
export const getRestaurantsBySlug = async (req, res, next) => {
  try {
    const slug = (req.params.slug || "").toLowerCase().trim();
    const { isVeg, priceRange } = req.query;

    // 1. Find or create destination
    let destination = await Destination.findOne({ slug, isActive: true });

    if (!destination) {
      const cityName = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      destination = await upsertDestination(cityName);
    }

    // 2. Query DB
    const filter = { destination: destination._id, isActive: true };
    if (isVeg !== undefined) filter.isVeg = isVeg === "true";
    if (priceRange) filter.priceRange = priceRange;

    let restaurants = await Restaurant.find(filter)
      .select("-__v")
      .sort({ rating: -1 });

    // 3. Groq fallback — generate and persist if DB is empty
    if (restaurants.length === 0) {
      console.log(
        `[restaurantController] No restaurants for "${destination.name}" — calling Groq`,
      );
      const all = await generateAndSaveRestaurants(
        destination.name,
        destination,
      );

      // Apply filters to in-memory results
      restaurants = all.filter((r) => {
        const matchVeg = isVeg === undefined || r.isVeg === (isVeg === "true");
        const matchRange = !priceRange || r.priceRange === priceRange;
        return matchVeg && matchRange;
      });
    }

    res.json({ restaurants });
  } catch (err) {
    next(err);
  }
};
