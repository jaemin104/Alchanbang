const express = require("express");
const authMiddleware = require("../middleware/auth");
const db = require("../db");
const router = express.Router();

// 게시글 작성 (로그인한 사용자만 가능)
router.post("/", authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id; // 미들웨어에서 설정한 사용자 정보

    try {
        console.log("게시글 작성 요청 받음:", { userId, title, content });

        const [result] = await db.query(
            "INSERT INTO posts (user_id, title, content, created_at) VALUES (?, ?, ?, NOW())",
            [userId, title, content]
        );

        console.log("INSERT 결과:", result);

        res.status(201).json({ message: "Post created", postId: result.insertId });
    } catch (error) {
        console.error("게시글 작성 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 게시글 목록 조회
router.get("/", async (req, res) => {
    try {
        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.created_at, p.user_id, 
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            ORDER BY p.created_at DESC
        `);

        res.json(posts);
    } catch (error) {
        console.error("게시글 조회 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 게시글 상세 조회
router.get("/:postId", async (req, res) => {
    const { postId } = req.params;

    try {
        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.created_at, u.nickname AS author,
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            JOIN user u ON p.user_id = u.id
            WHERE p.id = ?
        `, [postId]);

        if (posts.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(posts[0]); // 결과를 한 개만 반환
    } catch (error) {
        console.error("게시글 상세 조회 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 게시글 삭제 (본인만 가능)
router.delete("/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id; // 로그인한 사용자 ID

    try {
        // 해당 게시글이 존재하는지 확인 + 작성자 ID 조회
        const [posts] = await db.query("SELECT user_id FROM posts WHERE id = ?", [postId]);

        if (posts.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        // 작성자 ID와 로그인한 사용자의 ID가 일치하는지 확인
        if (posts[0].user_id !== userId) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        // 댓글 먼저 삭제 (외래키 관계 때문에)
        await db.query("DELETE FROM comments WHERE post_id = ?", [postId]);

        // 게시글 삭제
        await db.query("DELETE FROM posts WHERE id = ?", [postId]);

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("게시글 삭제 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});



module.exports = router;
