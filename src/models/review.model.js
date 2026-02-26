import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    itineraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Itinerary",
      default: null,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null, maxlength: 2000 },
    tripDate: { type: Date, default: null },
  },
  { timestamps: true },
);

reviewSchema.index({ destinationId: 1 });
reviewSchema.index({ userId: 1 });

export default mongoose.model("Review", reviewSchema);
