import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentPost,
  createPost,
  deletePost,
  getAllPost,
  getFlowPost,
  getLikePost,
  getUserPost,
  likePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPost);
router.get("/flowing", protectRoute, getFlowPost);
router.get("/likePost/:id", protectRoute, getLikePost);
router.get("/user/:username", protectRoute, getUserPost);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/like/:id", protectRoute, likePost);
router.post("/comment/:id", protectRoute, commentPost);

export default router;
