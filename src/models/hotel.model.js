// models/Hotel.js
import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    name:          { type: String, required: true, trim: true },
    tier:          { type: String, enum: ['economy', 'standard', 'luxury'], required: true },
    starRating:    { type: Number, default: 3, min: 1, max: 5 },
    pricePerNight: { type: Number, required: true },
    description:   { type: String, default: null },
    imageUrl:      { type: String, default: null },
    address:       { type: String, default: null },
    amenities:     { type: [String], default: [] },
    checkInTime:   { type: String, default: '14:00' },
    checkOutTime:  { type: String, default: '12:00' },
    bookingUrl:    { type: String, default: null },
    mapLat:        { type: Number, default: null },
    mapLng:        { type: Number, default: null },
    rating:        { type: Number, default: 4.0, min: 1, max: 5 },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

hotelSchema.index({ destinationId: 1 });
hotelSchema.index({ tier: 1 });
hotelSchema.index({ pricePerNight: 1 });

export default mongoose.model('Hotel', hotelSchema);