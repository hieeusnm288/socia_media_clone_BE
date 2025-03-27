import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notiRoutes from "./routes/noti.routes.js";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

dotenv.config();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Cho phép các phương thức
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Cho phép các headers
  next();
});

app.use(
  cors({
    origin: "http://localhost:3000", // Chỉ cho phép frontend này truy cập
    credentials: true, // Bật chế độ gửi cookie & auth token
  })
);

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
