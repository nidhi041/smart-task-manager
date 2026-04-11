import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (u) => ({
  _id:      u._id,
  name:     u.name,
  email:    u.email,
  avatar:   u.avatar,
  bio:      u.bio,
  location: u.location,
  website:  u.website,
  createdAt: u.createdAt,
});

// POST /api/auth/signup
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  if (await User.findOne({ email }))
    return res.status(409).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password });
  res.status(201).json({ ...safeUser(user), token: generateToken(user._id) });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid email or password" });

  res.json({ ...safeUser(user), token: generateToken(user._id) });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(safeUser(user));
};

// PUT /api/auth/profile  — update name, bio, location, website
export const updateProfile = async (req, res) => {
  const { name, bio, location, website } = req.body;
  const user = await User.findById(req.user._id);

  if (name)     user.name     = name.trim();
  if (bio      !== undefined) user.bio      = bio.trim();
  if (location !== undefined) user.location = location.trim();
  if (website  !== undefined) user.website  = website.trim();

  await user.save();
  // Refresh stored user in response so frontend can sync
  res.json(safeUser(user));
};

// PUT /api/auth/avatar  — upload base64 avatar (max ~2MB)
export const updateAvatar = async (req, res) => {
  const { avatar } = req.body;
  if (!avatar) return res.status(400).json({ message: "No avatar provided" });

  // Rough size guard: base64 of 2MB image ≈ 2.7MB string
  if (avatar.length > 3_000_000)
    return res.status(400).json({ message: "Image too large. Max 2MB." });

  const user = await User.findById(req.user._id);
  user.avatar = avatar;
  await user.save();
  res.json({ avatar: user.avatar });
};

// PUT /api/auth/password  — change password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "Both fields are required" });
  if (newPassword.length < 6)
    return res.status(400).json({ message: "New password must be at least 6 characters" });

  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword)))
    return res.status(401).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
};
