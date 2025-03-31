import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const existingUser = await User.find({ username });
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User is already taken" });
    }
    const checkEmail = await User.find({ email });
    if (checkEmail.length > 0) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      fullname,
      email,
      password: hashedPassword,
    });

    if (user) {
      generateTokenAndSetCookie(user._id, res);
      await user.save();
      return res
        .status(201)
        .json({ message: "User created successfully", user });
    } else {
      return res.status(400).json({ message: "User not created" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Eroor" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const validPassword = await bcrypt.compare(password, user?.password || "");
    if (!user || !validPassword) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    generateTokenAndSetCookie(user._id, res);
    res.json({ message: "Login successful", user });
  } catch (error) {}
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true, // 🔥 Bắt buộc để cookie chỉ có thể bị backend quản lý
      expires: new Date(0), // 🔥 Xóa cookie ngay lập tức
      sameSite: "None", // 🔥 Bắt buộc nếu frontend & backend khác domain
      secure: process.env.NODE_ENV === "production", // 🔥
      maxAge: 0,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
