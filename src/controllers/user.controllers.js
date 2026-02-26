import User from "../models/user.model.js";
import SavedPlan from "../models/savedPlan.model.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (avatar) updates.avatar = avatar.trim();

    if (Object.keys(updates).length === 0)
      return res
        .status(400)
        .json({ error: "Nothing to update. Provide name or avatar." });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword are required." });
    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters." });

    const user = await User.findById(req.user._id).select("+passwordHash");
    const valid = await user.comparePassword(currentPassword);
    if (!valid)
      return res.status(401).json({ error: "Current password is incorrect." });

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
};

export const getSavedPlans = async (req, res, next) => {
  try {
    const saved = await SavedPlan.find({ user: req.user._id })
      .populate({
        path: "itinerary",
        select:
          "title destinationName totalDays budgetTier startDate endDate status shareToken createdAt estimatedCostStandard",
        populate: { path: "destination", select: "name slug heroImageUrl" },
      })
      .sort({ createdAt: -1 });
    res.json({ saved });
  } catch (err) {
    next(err);
  }
};

export const removeSavedPlan = async (req, res, next) => {
  try {
    await SavedPlan.findOneAndDelete({
      user: req.user._id,
      itinerary: req.params.itineraryId,
    });
    res.json({ message: "Removed from saved plans." });
  } catch (err) {
    next(err);
  }
};
