import mongoose from 'mongoose';

// ── Slot (single activity inside a day)
const slotSchema = new mongoose.Schema({
  slotOrder: { type: Number, required: true },
  timeLabel: { type: String, default: null },
  type: { type: String, enum: ['attraction', 'food', 'transport', 'hotel', 'free'], default: 'attraction' },
  attractionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attraction', default: null },
  title: { type: String, required: true },
  description: { type: String, default: null },
  durationMins: { type: Number, default: null },
  estimatedCost: { type: Number, default: 0 },
  aiTip: { type: String, default: null },
  mapLat: { type: Number, default: null },
  mapLng: { type: Number, default: null },
}, { _id: true });

// ── Day (contains multiple slots)
const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  date: { type: Date, default: null },
  title: { type: String, required: true },
  summary: { type: String, default: null },
  slots: [slotSchema],
}, { _id: true });

// ── Budget breakdown per tier ──────────────────────────────
const budgetBreakdownSchema = new mongoose.Schema({
  tier: { type: String, enum: ['economy', 'standard', 'luxury'], required: true },
  accommodation: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  transport: { type: Number, default: 0 },
  entryFees: { type: Number, default: 0 },
  miscellaneous: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  perPerson: { type: Number, default: 0 },
}, { _id: false });

// ── Hotel reference inside itinerary ──────────────────────
const itineraryHotelSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  tier: { type: String, enum: ['economy', 'standard', 'luxury'] },
  pricePerNight: { type: Number, default: 0 },
  isSelected: { type: Boolean, default: true },
  checkIn: { type: Date, default: null },
  checkOut: { type: Date, default: null },
}, { _id: false });

// ── Main Itinerary ─────────────────────────────────────────
const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', default: null
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  title: { type: String, required: true },
  originCity: { type: String, required: true },
  totalDays: { type: Number, required: true },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  adults: { type: Number, default: 2 },
  children: { type: Number, default: 0 },
  budgetTier: { type: String, enum: ['economy', 'standard', 'luxury'], required: true },
  interests: { type: [String], default: [] },
  dailyBudgetPerPerson: { type: Number, default: null },
  shareToken: {
    type: String, unique: true, default: () => Math.random().toString(36).slice(2) + Date.now().toString(36)
  },
  status: { type: String, enum: ['draft', 'generated', 'saved', 'shared'], default: 'generated' },
  days: [daySchema],
  hotels: [itineraryHotelSchema],
  budgetBreakdown: [budgetBreakdownSchema],
  travelTips: { type: [String], default: [] },
  bestTimeToVisit: { type: String, default: null },
  localPhrases: { type: [{ phrase: String, meaning: String }], default: [] },
  aiModelUsed: { type: String, default: null },
  generationTimeMs: { type: Number, default: null },
  estimatedCostEconomy: { type: Number, default: null },
  estimatedCostStandard: { type: Number, default: null },
  estimatedCostLuxury: { type: Number, default: null },
}, { timestamps: true });

itinerarySchema.index({ user: 1, createdAt: -1 });
itinerarySchema.index({ destination: 1 });

export default mongoose.model('Itinerary', itinerarySchema);