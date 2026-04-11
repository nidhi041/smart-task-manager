import express from "express";
import {
  signup, login, getMe,
  updateProfile, updateAvatar, changePassword,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup",   signup);
router.post("/login",    login);
router.get("/me",        protect, getMe);
router.put("/profile",   protect, updateProfile);
router.put("/avatar",    protect, updateAvatar);
router.put("/password",  protect, changePassword);

export default router;
