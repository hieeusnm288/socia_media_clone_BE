import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteNotification,
  getNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotification);
router.delete("/delete", protectRoute, deleteNotification);

export default router;
