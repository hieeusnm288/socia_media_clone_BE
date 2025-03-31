import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, // Ngăn chặn XSS attacks
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
    sameSite: "None", // 🔥 Bắt buộc nếu frontend & backend khác domain
    secure: true, // 🔥 Bắt buộc nếu chạy HTTPS
  });
};
