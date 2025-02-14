const express = require("express");
const authMiddleware = require("../middleware/auth");
const db = require("../db");
const router = express.Router();

// 게시글 작성 (로그인한 사용자만 가능)
router.post("/", authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

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

// 게시글 목록 조회 + 검색
router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    let search = req.query.search ? decodeURIComponent(req.query.search) : "";

    try {
        console.log("백엔드에서 받은 검색어:", search);

        const searchCondition = search ? `WHERE (p.title LIKE ? OR p.content LIKE ?)` : "";
        const searchParams = search ? [`%${search}%`, `%${search}%`] : [];

        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.created_at, p.views,
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            ${searchCondition}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `, [...searchParams, limit, offset]);

        const [[{ totalCount }]] = await db.query(`
            SELECT COUNT(*) AS totalCount FROM posts p ${searchCondition}
        `, searchParams);

        res.json({
            posts,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("게시글 조회 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 게시글 상세 조회 (조회수 증가 포함)
router.get("/:postId", async (req, res) => {
    const { postId } = req.params;

    try {
        console.log(`게시글 ${postId} 조회 중...`);

        await db.query("UPDATE posts SET views = views + 1 WHERE id = ?", [postId]);

        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.created_at, p.views,
                   u.nickname AS author, 
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            JOIN user u ON p.user_id = u.id  
            WHERE p.id = ?
        `, [postId]);

        if (posts.length === 0) {
            console.log("게시글 없음!");
            return res.status(404).json({ message: "Post not found" });
        }

        console.log("응답 데이터:", posts[0]);

        res.json(posts[0]);
    } catch (error) {
        console.error("게시글 상세 조회 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 게시글 삭제 (본인만 가능)
router.delete("/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const [posts] = await db.query("SELECT user_id FROM posts WHERE id = ?", [postId]);

        if (posts.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (posts[0].user_id !== userId) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        await db.query("DELETE FROM comments WHERE post_id = ?", [postId]);
        await db.query("DELETE FROM posts WHERE id = ?", [postId]);

        console.log(`게시글 ${postId} 삭제 완료`);

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("게시글 삭제 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
