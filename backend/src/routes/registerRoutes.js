import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      confirmPassword, 
      phone, 
      dateOfBirth, 
      gender 
    } = req.body;

    // Check dữ liệu
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // Check mật khẩu nhập lại
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu nhập lại không khớp!" });
    }

    // Check email tồn tại
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Lưu DB
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      dateOfBirth,
      gender
    });

    return res.json({ message: "Đăng ký thành công!", user });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server!" });
  }
});

export default router;
