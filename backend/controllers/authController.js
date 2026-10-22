
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  location: user.location,
  website: user.website,
  createdAt: user.createdAt,
});

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    console.log("SIGNUP: request received");
    console.log("SIGNUP: body fields", Object.keys(req.body || {}));

    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log("SIGNUP: checking existing user");

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.log("SIGNUP: creating user");

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    console.log("SIGNUP: user created");

    const token = generateToken(user._id);

    console.log("SIGNUP: success");

    return res.status(201).json({
      ...safeUser(user),
      token,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error.name, error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      message: "Signup failed. Please try again.",
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.json({
      ...safeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.name, error.message);

    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(safeUser(user));
  } catch (error) {
    console.error("GET ME ERROR:", error.message);

    return res.status(500).json({
      message: "Could not fetch user profile",
    });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, website } = req.body || {};

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();
    if (website !== undefined) user.website = website.trim();

    await user.save();

    return res.json(safeUser(user));
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error.message);

    return res.status(500).json({
      message: "Could not update profile",
    });
  }
};

// PUT /api/auth/avatar
export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body || {};

    if (!avatar) {
      return res.status(400).json({
        message: "No avatar provided",
      });
    }

    if (typeof avatar !== "string" || avatar.length > 3_000_000) {
      return res.status(400).json({
        message: "Invalid image or image too large. Maximum 2MB.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = avatar;
    await user.save();

    return res.json({ avatar: user.avatar });
  } catch (error) {
    console.error("UPDATE AVATAR ERROR:", error.message);

    return res.status(500).json({
      message: "Could not update avatar",
    });
  }
};

// PUT /api/auth/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both fields are required",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error.message);

    return res.status(500).json({
      message: "Could not change password",
    });
  }
};
