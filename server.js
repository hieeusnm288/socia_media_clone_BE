import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notiRoutes from "./routes/noti.routes.js";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

const app = express();
const port = process.env.PORT || 5000;

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOuDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notification", notiRoutes);

console.log(process.env.MONGO_URI);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDB();
});
