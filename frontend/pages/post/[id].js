import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [parentId, setParentId] = useState(null);
  const [nickname, setNickname] = useState("");
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  console.log("라우터 ID:", id); // ✅ 라우터에서 ID가 정상적으로 넘어오는지 확인
  console.log("라우터 준비 완료?:", router.isReady);

  // ✅ 댓글을 가져오는 함수
  const fetchComments = () => {
    if (!id) return; // ✅ id가 없으면 실행 안 함
    console.log("댓글 요청 실행, ID:", id); // ✅ 디버깅용 로그 추가

    fetch(`http://localhost:5001/api/comments/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("받아온 댓글 데이터:", data);
        setComments(data);
      })
      .catch((err) => {
        console.error("댓글 조회 오류:", err);
        setComments([]);
      });
  };

  useEffect(() => {
    if (!router.isReady || !id) return; // ✅ router.isReady 체크 추가

    console.log("✅ 게시글 상세 정보 요청 시작, ID:", id); // ✅ 실행 여부 확인

    const token = localStorage.getItem("token");
    console.log("토큰 확인:", token); // ✅ 토큰이 정상적으로 불러와지는지 확인

    // ✅ 게시글 상세 정보 불러오기
    fetch(`http://localhost:5001/api/board/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => {
        console.log("📌 API 요청 실행됨! 응답 상태:", res.status); // ✅ 응답 상태 코드 확인
        return res.json();
      })
      .then((data) => {
        console.log("post 데이터:", data); // ✅ post 데이터 확인
        setPost(data);
        setLiked(data.liked);
      })
      .catch((err) => console.error("게시글 조회 오류:", err));

    // ✅ 로그인한 사용자 정보 가져오기
    if (token) {
      console.log("✅ 사용자 정보 요청 시작");

      fetch("http://localhost:5001/api/auth/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          console.log("📌 사용자 정보 API 응답 상태:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("📌 받아온 사용자 정보:", data); // ✅ userId 값 확인
          setUserId(data.userId);
        })
        .catch((err) => console.error("사용자 정보 조회 오류:", err));
    } else {
      console.log("❌ 토큰이 없어서 사용자 정보를 가져오지 않음");
    }

    // ✅ 댓글 정보 불러오기 (id가 존재할 때만 실행)
    if (id) {
      fetchComments();
    }
  }, [router.isReady, id]); // ✅ router.isReady를 의존성 배열에 추가

  

  // ✅ 댓글 또는 대댓글 작성 함수
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return alert("댓글을 입력하세요.");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    fetch(`http://localhost:5001/api/comments/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newComment, parentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setNewComment("");
        setParentId(null);
        fetchComments();
      })
      .catch((err) => console.error("댓글 작성 오류:", err));
  };


  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
  
    const res = await fetch(`http://localhost:5001/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  
    if (res.ok) {
      alert("댓글이 삭제되었습니다.");
  
      // ✅ 삭제된 댓글을 표시하는 함수 (내용만 변경)
      const markCommentAsDeleted = (comments, id) => {
        return comments.map((comment) => {
          if (comment.id === id) {
            return { ...comment, content: "삭제된 댓글입니다.", user_id: null };
          }
          return { ...comment, replies: markCommentAsDeleted(comment.replies || [], id) };
        });
      };
  
      setComments((prevComments) => markCommentAsDeleted(prevComments, commentId));
    } else {
      alert("댓글 삭제에 실패했습니다.");
    }
  };
  

  // ✅ 댓글을 렌더링하는 함수
const renderComments = (comments) => {
  return comments.map((comment) => (
    <li key={comment.id} style={{ marginLeft: comment.parent_id ? "20px" : "0" }}>
      <p>
        <strong>{comment.author ? comment.author : "익명"}:</strong>{" "}
        {comment.content === "삭제된 댓글입니다." ? (
          <span style={{ color: "gray" }}>삭제된 댓글입니다.</span>
        ) : (
          comment.content
        )}
      </p>

      {/* ✅ 내가 쓴 댓글(원댓글 & 대댓글)만 삭제 버튼 표시 */}
      {userId && comment.user_id === userId && comment.content !== "삭제된 댓글입니다." && (
        <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
      )}

      {/* ✅ 원댓글이 삭제되지 않은 경우에만 대댓글 작성 가능 */}
      {comment.parent_id === null && comment.content !== "삭제된 댓글입니다." && (
        <button onClick={() => setParentId(comment.id)}>대댓글 작성</button>
      )}

      {/* ✅ 대댓글 재귀 렌더링 */}
      {comment.replies && comment.replies.length > 0 && (
        <ul>{renderComments(comment.replies)}</ul>
      )}
    </li>
  ));
};


  // ✅ 게시글 삭제 함수
  const handleDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    const res = await fetch(`http://localhost:5001/api/board/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.ok) {
      alert("게시글이 삭제되었습니다.");
      router.push("/");
    } else {
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  // ✅ 좋아요 기능 추가
  const handleLike = async () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5001/api/board/${id}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      console.log("좋아요 처리 응답:", data);

      // ✅ 상태 업데이트
      setLiked(data.liked);
      setPost((prevPost) => ({
        ...prevPost,
        likes: data.liked ? prevPost.likes + 1 : prevPost.likes - 1, // ✅ 좋아요 수 즉시 반영
      }));
    } else {
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };


  return (
    <div>
      {post && (
        <>
          <h1>{post.title}</h1>

          {console.log("로그인한 사용자 ID:", userId)}
          {console.log("게시글 작성자 ID:", post?.user_id)}
          {console.log("삭제 버튼 표시 조건:", userId && post?.user_id && Number(userId) === Number(post?.user_id))}


          {/* 로그인한 사용자와 작성자가 동일하면 삭제 버튼 표시 */}
          {userId && post.user_id && Number(userId) === Number(post.user_id) && (
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              삭제하기
            </button>
          )}

          <p>조회수: {post.views}</p>
          <p>좋아요: {post.likes}</p>
          <button onClick={handleLike}>
            {liked ? "좋아요 취소" : "좋아요"}
          </button>

          <p>{post.content}</p>
          <p>
            <strong>작성자:</strong> {post.author}
          </p>
          <p>
            <strong>작성일:</strong> {new Date(post.created_at).toLocaleString()}
          </p>
        </>
      )}

      {/* 댓글 목록 */}
      <h2>댓글</h2>
      {comments.length === 0 ? (
        <p>댓글이 없습니다.</p>
      ) : (
        <ul>{renderComments(comments)}</ul>
      )}

      <h3>{parentId ? "대댓글 작성" : "댓글 작성"}</h3>
      <form onSubmit={handleCommentSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <button type="submit">작성</button>
        {parentId && <button type="button" onClick={() => setParentId(null)}>취소</button>}
      </form>
    </div>
  );
}
