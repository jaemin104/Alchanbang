const express = require("express");
const authMiddleware = require("../middleware/auth");
const db = require("../db");
const router = express.Router();

// ✅ 내가 쓴 게시글 조회
router.get("/posts", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // 로그인한 사용자 ID
    console.log("📌 요청된 사용자 ID (게시글 조회):", userId);
    const [posts] = await db.query("SELECT id, title FROM posts WHERE user_id = ?", [userId]);
    console.log("📌 조회된 게시글 데이터:", posts); // ✅ SQL 결과 확인
    res.json(posts);
  } catch (error) {
    console.error("내 게시글 조회 오류:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 내가 쓴 댓글 조회
router.get("/comments", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📌 요청된 사용자 ID (댓글 조회):", userId);
    const [comments] = await db.query("SELECT id, post_id, content FROM comments WHERE user_id = ?", [userId]);
    console.log("📌 조회된 댓글 데이터:", comments);
    res.json(comments);
  } catch (error) {
    console.error("내 댓글 조회 오류:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 내가 좋아요한 게시글 조회
router.get("/liked-posts", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📌 요청된 사용자 ID (좋아요 조회):", userId);
    const [likedPosts] = await db.query(`
      SELECT p.id, p.title 
      FROM likes l 
      JOIN posts p ON l.post_id = p.id 
      WHERE l.user_id = ?`, [userId]);
    console.log("📌 조회된 좋아요한 게시글 데이터:", likedPosts);
    res.json(likedPosts);
  } catch (error) {
    console.error("좋아요한 게시글 조회 오류:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
