import cloudinary from "../lib/cloudinary.js";
import { ENV } from "../lib/env.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "all fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "Email already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const isAdmin = email === ENV.ADMIN_EMAIL;
    console.log("admin verification", isAdmin);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: isAdmin ? "admin" : role === "teacher" ? "teacher" : "student",
      isApproved: isAdmin ? true : false,
    });
    if (isAdmin) {
      const savedAdmin = await newUser.save();
      generateToken(savedAdmin._id, res);
      return res.status(201).json(
        {
          message: "Admin account created",
        },
        savedAdmin,
      );
    }
    if (newUser) {
      const savedUser = await newUser.save();
      // generateToken(savedUser._id, res);
      return res.status(201).json(
        {
          message: "Signup Successfull. Await admin approval",
          data: savedUser.isApproved,
        },
        // {
        //   _id: savedUser._id,
        //   fullName: savedUser.fullName,
        //   email: savedUser.email,
        //   profilePic: savedUser.profilePic,
        //   role: savedUser.role,
        // },
      );
    } else {
      return res.status(400).json({ message: "Invalid user" });
    }
  } catch (error) {
    if (error?.code === 1100)
      return res.status(409).json({ message: "Email already exist" });
    console.log("Error in signup controller", signup);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    if (user.role === "admin") {
      generateToken(user._id, res);
      return res.status(201).json({
        message: "welcome admin",
        id: user._id,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      });
    }
    if (!user.isApproved) {
      return res.status(403).json({
        message: "Wait for an admin's approval",
      });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
    });
  } catch (error) {
    console.error("Error in login controllers", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const logout = (_, res) => {
  console.log("This is logout endpoint");
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // expire immediately
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "Profile pic is required" });
    const userId = req.user._id;

    const uploadRes = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadRes.secure_url },
      { new: true },
    ).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in Update profile", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    console.log(user, "From me.com");
    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
