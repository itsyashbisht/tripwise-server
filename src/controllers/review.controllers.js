import Review from '../models/review.model.js';
import Destination from '../models/destination.model.js';

// ── GET /api/reviews?destinationId=xxx ───────────────────────────────────────
export const getReviews = async (req, res) => {
  try {
    const { destinationId, limit = 20, offset = 0 } = req.query;

    const filter = {};
    if (destinationId) filter.destinationId = destinationId;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'name avatar')
        .populate('destinationId', 'name slug')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(Number(offset))
        .limit(Number(limit)),
      Review.countDocuments(filter),
    ]);

    // Calculate average rating for this destination
    let avgRating = null;
    if (destinationId) {
      const agg = await Review.aggregate([
        { $match: { destinationId: new (await import('mongoose')).default.Types.ObjectId(destinationId) } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      avgRating = agg[0] ? { avg: Math.round(agg[0].avg * 10) / 10, count: agg[0].count } : null;
    }

    res.json({ reviews, total, avgRating });
  } catch (err) {
    console.error('[getReviews]', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};

// ── POST /api/reviews ─────────────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { destinationId, itineraryId, rating, comment, tripDate } = req.body;

    if (!destinationId) return res.status(400).json({ error: 'destinationId is required.' });
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: 'rating must be between 1 and 5.' });

    const destination = await Destination.findById(destinationId);
    if (!destination) return res.status(404).json({ error: 'Destination not found.' });

    const review = await Review.create({
      userId: req.user.userId,
      destinationId,
      itineraryId: itineraryId || null,
      rating: Number(rating),
      comment: comment || null,
      tripDate: tripDate ? new Date(tripDate) : null,
    });

    await review.populate('userId', 'name avatar');
    res.status(201).json({ review });
  } catch (err) {
    console.error('[createReview]', err.message);
    res.status(500).json({ error: 'Failed to create review.' });
  }
};

// ── DELETE /api/reviews/:id ───────────────────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    if (String(review.userId) !== req.user.userId && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not your review.' });

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error('[deleteReview]', err.message);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
};