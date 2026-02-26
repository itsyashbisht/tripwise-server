import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    cuisineType: { type: String, required: true, default: "Indian" },

    pricePerPerson: { type: Number, required: true, default: 400 },
    priceRange: {
      type: String,
      enum: ["budget", "mid", "premium"],
      required: true,
      default: "mid",
    },

    isVeg: { type: Boolean, default: true },

    mustTryDishes: { type: String, default: null },
    description: { type: String, default: null },
    address: { type: String, default: null },

    openTime: { type: String, default: null },
    closeTime: { type: String, default: null },

    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    website: { type: String, default: null },
    zomatoUrl: { type: String, default: null },
    swiggyUrl: { type: String, default: null },
    mapLat: { type: Number, default: null },
    mapLng: { type: Number, default: null },
    imageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

restaurantSchema.index({ destination: 1 });
restaurantSchema.index({ priceRange: 1 });
restaurantSchema.index({ isVeg: 1 });

export default mongoose.model("Restaurant", restaurantSchema);
