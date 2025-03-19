import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  flowUser,
  getUsernameProfile,
  getUserSuggested,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUsernameProfile);
router.get("/suggested", protectRoute, getUserSuggested);
router.post("/follow/:id", protectRoute, flowUser);
router.post("/update/:id", protectRoute, updateUser);

export default router;
