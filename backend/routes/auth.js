const express = require("express");
const authMiddleware = require("../middleware/auth"); // authMiddleware 불러오기
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

const router = express.Router();

// 회원가입
router.post("/register", async (req, res) => {
    const { nickname, email, password } = req.body;

    try {
        // 이메일 중복 확인
        const [existingUser] = await db.execute("SELECT * FROM user WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 유저 저장
        await db.execute("INSERT INTO user (nickname, email, password) VALUES (?, ?, ?)", 
            [nickname, email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("회원가입 오류:", error); // 로그 추가
        res.status(500).json({ message: "Server error" });
    }
});

// 로그인
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.execute("SELECT * FROM user WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // JWT 토큰 생성
        const token = jwt.sign({ id: user.id, nickname: user.nickname }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ 
            token, 
            user: { id: user.id, nickname: user.nickname, email: user.email } 
        });
    } catch (error) {
        console.error("로그인 오류:", error); // 로그 추가
        res.status(500).json({ message: "Server error" });
    }
});

// 사용자 정보 조회
router.get("/userinfo", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id; // 로그인한 사용자 ID
  
      const [user] = await db.query("SELECT nickname FROM user WHERE id = ?", [userId]);
      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ nickname: user[0].nickname });
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
