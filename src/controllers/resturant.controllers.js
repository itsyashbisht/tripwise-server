import Restaurant from '../models/resturant.model.js';

// ── GET /api/restaurants ──────────────────────────────────────────────────────
export const getAllRestaurants = async (req, res) => {
  try {
    const { destinationId, isVeg, priceRange, limit = 20, offset = 0 } = req.query;

    const filter = { isActive: true };
    if (destinationId)       filter.destinationId = destinationId;
    if (isVeg !== undefined) filter.isVeg         = isVeg === 'true';
    if (priceRange)          filter.priceRange     = priceRange;

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate('destinationId', 'name slug')
        .select('-__v')
        .sort({ rating: -1 })
        .skip(Number(offset))
        .limit(Number(limit)),
      Restaurant.countDocuments(filter),
    ]);

    res.json({ restaurants, total });
  } catch (err) {
    console.error('[getAllRestaurants]', err.message);
    res.status(500).json({ error: 'Failed to fetch restaurants.' });
  }
};

// ── GET /api/restaurants/:id ──────────────────────────────────────────────────
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('destinationId', 'name slug state')
      .select('-__v');

    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });
    res.json({ restaurant });
  } catch (err) {
    console.error('[getRestaurantById]', err.message);
    res.status(500).json({ error: 'Failed to fetch restaurant.' });
  }
};