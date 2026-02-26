import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    name: { type: String, required: true, trim: true },

    tier: {
      type: String,
      enum: ["economy", "standard", "luxury"],
      required: true,
      default: "standard",
    },

    starRating: { type: Number, default: 3, min: 1, max: 5 },

    pricePerNight: { type: Number, required: true, default: 2000 },

    description: { type: String, default: "" },

    amenities: { type: [String], default: [] },

    checkInTime: { type: String, default: "12:00 PM" },
    checkOutTime: { type: String, default: "11:00 AM" },

    website: { type: String, default: "" },
    bookingUrl: { type: String, default: "" },

    address: { type: String, default: "" },

    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },

    tag: { type: String, default: "" },

    mapLat: { type: Number, default: null },
    mapLng: { type: Number, default: null },

    imageUrl: { type: String, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

hotelSchema.index({ destination: 1 });
hotelSchema.index({ tier: 1 });
hotelSchema.index({ pricePerNight: 1 });

export default mongoose.model("Hotel", hotelSchema);
