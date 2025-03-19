import express from "express";
import { login, logout, me, signup } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, me);

export default router;
