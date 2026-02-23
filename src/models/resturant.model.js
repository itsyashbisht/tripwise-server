
import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    name: { type: String, required: true, trim: true },
    cuisineType: { type: String, required: true },
    pricePerPerson: { type: Number, required: true },
    priceRange: { type: String, enum: ['budget', 'mid', 'premium'], required: true },
    isVeg: { type: Boolean, default: true },
    mustTryDishes: { type: String, default: null },
    openTime: { type: String, default: null },
    closeTime: { type: String, default: null },
    rating: { type: Number, default: 4.0, min: 1, max: 5 },
    address: { type: String, default: null },
    mapLat: { type: Number, default: null },
    mapLng: { type: Number, default: null },
    imageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

restaurantSchema.index({ destinationId: 1 });
restaurantSchema.index({ priceRange: 1 });
restaurantSchema.index({ isVeg: 1 });

export default mongoose.model('Restaurant', restaurantSchema);