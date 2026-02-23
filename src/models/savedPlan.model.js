import mongoose from 'mongoose';

const savedPlanSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
    note:        { type: String, default: null },
    savedAt:     { type: Date, default: Date.now },
  },
  { timestamps: false }
);

savedPlanSchema.index({ userId: 1, itineraryId: 1 }, { unique: true });

export default mongoose.model('SavedPlan', savedPlanSchema);