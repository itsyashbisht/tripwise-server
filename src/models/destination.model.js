// models/Destination.js
import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema(
  {
    tier: { type: String, enum: ['economy', 'standard', 'luxury'], required: true },
    hotelMinPrice: { type: Number, default: 0 },
    hotelMaxPrice: { type: Number, default: 0 },
    foodCostPerDay: { type: Number, default: 0 },
    transportCostPerDay: { type: Number, default: 0 },
  },
  { _id: false }
);

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    state: { type: String, required: true },
    region: { type: String, default: 'India' },
    category: {
      type: String,
      enum: ['Heritage', 'Beaches', 'Hills', 'Backwaters', 'Wildlife', 'Spiritual', 'Adventure', 'Nature'],
      required: true
    },
    description: { type: String, required: true },
    heroImageUrl: { type: String, required: true },
    mapLat: { type: Number, default: null },
    mapLng: { type: Number, default: null },
    bestSeason: { type: String, default: 'Oct–Mar' },
    avgDurationDays: { type: Number, default: 3 },
    pricing: [pricingSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

destinationSchema.index({ category: 1 });
destinationSchema.index({ name: 'text', state: 'text' });

export default mongoose.model('Destination', destinationSchema);