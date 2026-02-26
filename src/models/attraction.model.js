import mongoose from "mongoose";

const attractionSchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "Fort",
        "Palace",
        "Temple",
        "Beach",
        "Museum",
        "Market",
        "Nature",
        "Adventure",
        "Lake",
        "Monument",
      ],
      required: true,
    },
    description: { type: String, required: true },
    imageUrl: { type: String, default: null },
    entryFeeIndian: { type: Number, default: 0 },
    entryFeeForeign: { type: Number, default: 0 },
    entryFeeChild: { type: Number, default: 0 },
    openTime: { type: String, default: null },
    closeTime: { type: String, default: null },
    closedOn: { type: String, default: null },
    visitDurationMins: { type: Number, default: 90 },
    bestTimeToVisit: { type: String, default: null },
    mapLat: { type: Number, default: null },
    mapLng: { type: Number, default: null },
    insiderTip: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

attractionSchema.index({ destinationId: 1 });
attractionSchema.index({ category: 1 });

export default mongoose.model("Attraction", attractionSchema);
