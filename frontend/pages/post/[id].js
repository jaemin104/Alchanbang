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

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${id}`)
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/board/${id}`, {
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

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/userinfo`, {
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

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${id}`, {
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
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`, {
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
    <li
      key={comment.id}
      className={`p-4 bg-gray-50 rounded-lg ${
        comment.parent_id ? "ml-8 border-l-4 border-gray-200" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-semibold text-gray-900">
            {comment.author ? comment.author : "익명"}
          </span>
          <p className={`mt-1 ${
            comment.content === "삭제된 댓글입니다."
              ? "text-gray-400 italic"
              : "text-gray-800"
          }`}>
            {comment.content}
          </p>
        </div>
        <div className="flex space-x-2">
          {userId && comment.user_id === userId && comment.content !== "삭제된 댓글입니다." && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              삭제
            </button>
          )}
          {comment.parent_id === null && comment.content !== "삭제된 댓글입니다." && (
            <button
              onClick={() => setParentId(comment.id)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              답글
            </button>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <ul className="mt-4 space-y-4">
          {renderComments(comment.replies)}
        </ul>
      )}
    </li>
  ));
};


  // ✅ 게시글 삭제 함수
  const handleDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/board/${id}`, {
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/board/${id}/like`, {
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
    <div className="min-h-screen bg-[#a1c638]/10 pt-16">
      <div className="max-w-4xl mx-auto p-6">
        {post && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {/* 게시글 헤더 */}
            <div className="border-b border-[#a1c638]/20 pb-4 mb-4">
              <h1 className="text-4xl font-extrabold text-gray-950 mb-3 tracking-tight leading-tight">{post.title}</h1>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>작성자: {post.author}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>👁️ {post.views}</span>
                  <span>❤️ {post.likes}</span>
                </div>
              </div>
            </div>

            {/* 게시글 본문 */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* 작성자 전용 버튼 & 좋아요 버튼 */}
            <div className="flex justify-between items-center border-t border-[#a1c638]/20 pt-4">
              <div>
                {userId && post.user_id && Number(userId) === Number(post.user_id) && (
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    삭제하기
                  </button>
                )}
              </div>
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  liked
                    ? "bg-[#a1c638]/10 text-[#a1c638] hover:bg-[#a1c638]/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{liked ? "❤️" : "🤍"}</span>
                <span>{liked ? "좋아요 취소" : "좋아요"}</span>
              </button>
            </div>
          </div>
        )}

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">댓글</h2>
          
          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4 mb-8">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
          ) : (
            <ul className="space-y-4 mb-8">
              {renderComments(comments)}
            </ul>
          )}

          {/* 구분선 */}
          <div className="border-t border-[#a1c638]/20 my-6"></div>
          
          {/* 댓글 작성 폼 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {parentId ? "대댓글 작성" : "새 댓글 작성"}
            </h3>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={parentId ? "대댓글을 입력하세요..." : "댓글을 입력하세요..."}
                className="w-full p-3 border border-[#a1c638]/30 rounded-lg focus:ring-2 focus:ring-[#a1c638] focus:border-[#a1c638] min-h-[100px] resize-none"
              />
              <div className="flex justify-end space-x-2">
                {parentId && (
                  <button
                    type="button"
                    onClick={() => setParentId(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    취소
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#a1c638] hover:bg-[#91b232] text-white px-6 py-2 rounded-md transition-colors"
                >
                  댓글 작성
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
