import Hotel from '../models/hotel.model.js';

export const getAllHotels = async (req, res) => {
  try {
    const { destinationId, tier, minPrice, maxPrice, limit = 20, offset = 0 } = req.query;

    const filter = { isActive: true };
    if (destinationId) filter.destinationId = destinationId;
    if (tier) filter.tier = tier;

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    const [hotels, total] = await Promise.all([
      Hotel.find(filter)
        .populate('destinationId', 'name slug state')
        .select('-__v')
        .sort({ pricePerNight: 1 })
        .skip(Number(offset))
        .limit(Number(limit)),
      Hotel.countDocuments(filter),
    ]);

    res.json({ hotels, total });
  } catch (err) {
    console.error('[getAllHotels]', err.message);
    res.status(500).json({ error: 'Failed to fetch hotels.' });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('destinationId', 'name slug state heroImageUrl')
      .select('-__v');

    if (!hotel) return res.status(404).json({ error: 'Hotel not found.' });
    res.json({ hotel });
  } catch (err) {
    console.error('[getHotelById]', err.message);
    res.status(500).json({ error: 'Failed to fetch hotel.' });
  }
};