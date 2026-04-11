import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export default protect;
