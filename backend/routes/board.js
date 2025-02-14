const express = require("express");
const authMiddleware = require("../middleware/auth");
const db = require("../db");
const router = express.Router();

// 게시글 좋아요 추가 및 취소
router.post("/:postId/like", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        // 사용자가 해당 게시글에 좋아요를 눌렀는지 확인
        const [existingLike] = await db.query("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId]);

        if (existingLike.length > 0) {
            // 이미 좋아요를 눌렀다면 삭제 (좋아요 취소)
            await db.query("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId]);
            return res.json({ message: "좋아요 취소됨", liked: false });
        } else {
            // 좋아요 추가
            await db.query("INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, NOW())", [userId, postId]);
            return res.json({ message: "좋아요 추가됨", liked: true });
        }
    } catch (error) {
        console.error("좋아요 처리 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 게시글 목록 조회 (검색, 페이징, 인기글 포함)
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
                   (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
            FROM posts p
            ${searchCondition}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `, [...searchParams, limit, offset]);

        const [popularPosts] = await db.query(`
            SELECT p.id, p.title, p.content, p.created_at, p.views,
                   (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.created_at >= NOW() - INTERVAL 3 DAY) AS recent_likes
            FROM posts p
            ORDER BY recent_likes DESC
            LIMIT 3
        `);

        const [topCommenters] = await db.query(`
            SELECT u.nickname, COUNT(c.id) AS comment_count
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.created_at >= NOW() - INTERVAL 7 DAY
            GROUP BY c.user_id
            ORDER BY comment_count DESC
            LIMIT 3
        `);

        const [[{ totalCount }]] = await db.query(`
            SELECT COUNT(*) AS totalCount FROM posts p ${searchCondition}
        `, searchParams);

        res.json({
            posts,
            popularPosts,
            topCommenters,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("게시글 조회 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 게시글 상세 조회 (조회수 증가 포함, 사용자의 좋아요 여부 포함)
router.get("/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user ? req.user.id : null; // 로그인된 사용자 ID

    try {
        console.log(`게시글 ${postId} 조회 중...`);

        await db.query("UPDATE posts SET views = views + 1 WHERE id = ?", [postId]);

        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.created_at, p.views,
                   u.nickname AS author, 
                   (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes
            FROM posts p
            JOIN users u ON p.user_id = u.id  
            WHERE p.id = ?
        `, [postId]);

        if (posts.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        let liked = false;
        if (userId) {
            const [likeStatus] = await db.query("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId]);
            liked = likeStatus.length > 0;
        }

        res.json({ ...posts[0], liked });
    } catch (error) {
        console.error("게시글 상세 조회 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
