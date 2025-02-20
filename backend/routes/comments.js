const express = require("express");
const authMiddleware = require("../middleware/auth");
const db = require("../db");
const router = express.Router();

// ✅ 댓글 작성 (대댓글 포함)
router.post("/:postId", authMiddleware, async (req, res) => {
    const postId = parseInt(req.params.postId, 10);
    console.log("postId:", postId);
    const { content, parentId } = req.body;
    const userId = req.user.id;

    if (!content) {
        return res.status(400).json({ message: "Content is required" });
    }

    try {
        // 게시글 존재 여부 확인
        const [posts] = await db.query("SELECT id FROM posts WHERE id = ?", [postId]);
        if (posts.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        // parentId가 있는 경우, 부모 댓글이 존재하는지 확인
        if (parentId) {
            const [parentComment] = await db.query("SELECT id FROM comments WHERE id = ?", [parentId]);
            if (parentComment.length === 0) {
                return res.status(400).json({ message: "Parent comment not found" });
            }
        }

        // 댓글 저장
        const [result] = await db.query(
            "INSERT INTO comments (post_id, user_id, content, parent_id, created_at) VALUES (?, ?, ?, ?, NOW())",
            [postId, userId, content, parentId || null]
        );

        res.status(201).json({ message: "Comment added successfully", commentId: result.insertId });
    } catch (error) {
        console.error("댓글 작성 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ 댓글 조회 (대댓글 포함, 작성자 닉네임 표시)
router.get("/:postId", async (req, res) => {
    const { postId } = req.params;
    console.log(`댓글 조회 요청: 게시글 ID - ${postId}`);

    try {
        const [comments] = await db.query(`
            SELECT c.id, c.content, c.parent_id, c.user_id, c.created_at, u.nickname AS author
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY COALESCE(c.parent_id, c.id), c.created_at ASC
        `, [postId]);

        // ✅ 댓글을 계층 구조로 변환
        const commentMap = {};
        const rootComments = [];

        comments.forEach(comment => {
            comment.replies = [];
            commentMap[comment.id] = comment;
        });

        comments.forEach(comment => {
            if (comment.parent_id) {
                if (commentMap[comment.parent_id]) {
                    commentMap[comment.parent_id].replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        res.json(rootComments);
    } catch (error) {
        console.error("댓글 조회 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ 댓글 삭제 (대댓글이 있으면 내용만 '삭제된 댓글입니다.'로 변경)
router.delete("/:commentId", authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    try {
        // 댓글 존재 여부 확인
        const [comments] = await db.query("SELECT user_id, parent_id FROM comments WHERE id = ?", [commentId]);
        if (comments.length === 0) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // ✅ 본인만 삭제 가능
        if (comments[0].user_id !== userId) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        // ✅ 원댓글인데 대댓글이 있는 경우 내용만 변경
        const [childComments] = await db.query("SELECT id FROM comments WHERE parent_id = ?", [commentId]);
        if (childComments.length > 0) {
            await db.query("UPDATE comments SET content = '삭제된 댓글입니다.' WHERE id = ?", [commentId]);
            return res.json({ message: "Comment deleted successfully (content replaced)." });
        }

        // ✅ 대댓글이 없으면 완전 삭제
        await db.query("DELETE FROM comments WHERE id = ?", [commentId]);

        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("댓글 삭제 오류:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
