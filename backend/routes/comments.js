const express = require("express");
const authMiddleware = require("../middleware/auth");
const db = require("../db");
const router = express.Router();

// 댓글 작성 (로그인한 사용자만 가능)
router.post("/:postId", authMiddleware, async (req, res) => {
    const postId = parseInt(req.params.postId, 10); // postId를 숫자로 변환
    console.log("postId:", postId); // 디버깅용 로그 추가
    const { content } = req.body;
    const userId = req.user.id; // 로그인한 사용자 ID

    if (!content) {
        return res.status(400).json({ message: "Content is required" });
    }

    try {
        // 게시글 존재 여부 확인
        const [posts] = await db.query("SELECT id FROM posts WHERE id = ?", [postId]);
        if (posts.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        // 댓글 저장
        const [result] = await db.query(
            "INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())", 
            [postId, userId, content]
        );

        res.status(201).json({ message: "Comment added successfully", commentId: result.insertId });
    } catch (error) {
        console.error("댓글 작성 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
