import Destination from '../models/destination.model.js';
import Attraction from '../models/attraction.model.js';
import Restaurant from '../models/resturant.model.js';
import Hotel from '../models/hotel.model.js';

// ── GET /api/destinations ─────────────────────────────────────────────────────
export const getAllDestinations = async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [destinations, total] = await Promise.all([
      Destination.find(filter)
        .select('-__v')
        .sort({ name: 1 })
        .skip(Number(offset))
        .limit(Number(limit)),
      Destination.countDocuments(filter),
    ]);

    res.json({ destinations, total, limit: Number(limit), offset: Number(offset) });
  } catch (err) {
    console.error('[getAllDestinations]', err.message);
    res.status(500).json({ error: 'Failed to fetch destinations.' });
  }
};

// ── GET /api/destinations/:slug ───────────────────────────────────────────────
export const getDestinationBySlug = async (req, res) => {
  try {
    const destination = await Destination.findOne({ slug: req.params.slug, isActive: true });
    if (!destination) return res.status(404).json({ error: 'Destination not found.' });

    const [attractions, restaurants, hotels] = await Promise.all([
      Attraction.find({ destinationId: destination._id, isActive: true })
        .select('-__v')
        .sort({ visitDurationMins: 1 }),
      Restaurant.find({ destinationId: destination._id, isActive: true })
        .select('-__v')
        .sort({ rating: -1 }),
      Hotel.find({ destinationId: destination._id, isActive: true })
        .select('-__v')
        .sort({ pricePerNight: 1 }),
    ]);

    res.json({ destination, attractions, restaurants, hotels });
  } catch (err) {
    console.error('[getDestinationBySlug]', err.message);
    res.status(500).json({ error: 'Failed to fetch destination.' });
  }
};

// ── GET /api/destinations/:slug/hotels ───────────────────────────────────────
export const getDestinationHotels = async (req, res) => {
  try {
    const destination = await Destination.findOne({ slug: req.params.slug, isActive: true });
    if (!destination) return res.status(404).json({ error: 'Destination not found.' });

    const filter = { destinationId: destination._id, isActive: true };
    if (req.query.tier) filter.tier = req.query.tier;

    const hotels = await Hotel.find(filter).select('-__v').sort({ pricePerNight: 1 });
    res.json({ hotels });
  } catch (err) {
    console.error('[getDestinationHotels]', err.message);
    res.status(500).json({ error: 'Failed to fetch hotels.' });
  }
};

// ── GET /api/destinations/:slug/restaurants ───────────────────────────────────
export const getDestinationRestaurants = async (req, res) => {
  try {
    const destination = await Destination.findOne({ slug: req.params.slug, isActive: true });
    if (!destination) return res.status(404).json({ error: 'Destination not found.' });

    const filter = { destinationId: destination._id, isActive: true };
    if (req.query.isVeg !== undefined) filter.isVeg = req.query.isVeg === 'true';
    if (req.query.priceRange) filter.priceRange = req.query.priceRange;

    const restaurants = await Restaurant.find(filter).select('-__v').sort({ rating: -1 });
    res.json({ restaurants });
  } catch (err) {
    console.error('[getDestinationRestaurants]', err.message);
    res.status(500).json({ error: 'Failed to fetch restaurants.' });
  }
};

// ── GET /api/destinations/:slug/attractions ───────────────────────────────────
export const getDestinationAttractions = async (req, res) => {
  try {
    const destination = await Destination.findOne({ slug: req.params.slug, isActive: true });
    if (!destination) return res.status(404).json({ error: 'Destination not found.' });

    const filter = { destinationId: destination._id, isActive: true };
    if (req.query.category) filter.category = req.query.category;

    const attractions = await Attraction.find(filter).select('-__v').sort({ visitDurationMins: 1 });
    res.json({ attractions });
  } catch (err) {
    console.error('[getDestinationAttractions]', err.message);
    res.status(500).json({ error: 'Failed to fetch attractions.' });
  }
};