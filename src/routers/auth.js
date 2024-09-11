import express from "express";
import { forgotPassword, signin, signup } from "../controllers/auth.js";
// import { requireAuth } from "./middleware/auth.js";
import user from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post(`/auth/signup`, signup);
router.post(`/auth/signin`, signin);
router.post(`/auth/forgot`, forgotPassword);
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.userId; // ID người dùng đã xác thực từ middleware
    const user = await user.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
