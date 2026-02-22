import User from "../models/User.js";

export const getPendingUsers = async (req, res) => {
  const users = await User.find({
    isApproved: false,
    isRejected: false,
    role: { $ne: "admin" },
  }).select("-password");
  res.json(users);
};
export const rejectUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      isApproved: false,
      isRejected: true,
    },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({
    message: "User rejected",
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
  });
};
export const approveUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true },
  );

  res.json(
    { message: "User approved" },
    { _id: user._id, fullName: user.fullName, email: user.email },
  );
};
export const getTotalStdTech = async (req, res) => {
  try {
    const approvedStds = await User.countDocuments({
      role: "student",
      isApproved: true,
      isRejected: false,
    });
    const pendingStds = await User.countDocuments({
      role: "student",
      isRejected: false,
    });
    const totalTeacher = await User.countDocuments({
      role: "teacher",
      isApproved: true,
      isRejected: false,
    });
    res.status(200).json({ approvedStds, pendingStds, totalTeacher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};
