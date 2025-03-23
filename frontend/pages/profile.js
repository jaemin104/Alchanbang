import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/Navbar"; // Navbar 컴포넌트 추가

export default function Profile() {
  const [nickname, setNickname] = useState(""); // 사용자 닉네임
  const [newNickname, setNewNickname] = useState(""); // 새 닉네임
  const [isEditing, setIsEditing] = useState(false); // 닉네임 수정 여부
  const [userId, setUserId] = useState(null); // 사용자 ID
  const [myPosts, setMyPosts] = useState([]); // 내가 쓴 게시글
  const [myComments, setMyComments] = useState([]); // 내가 쓴 댓글
  const [likedPosts, setLikedPosts] = useState([]); // 좋아요한 게시글
  const router = useRouter();

  useEffect(() => {
    // 로그인한 사용자 정보 불러오기
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5001/api/auth/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setNickname(data.nickname);
          setNewNickname(data.nickname);
          setUserId(data.userId); // 사용자 ID 저장
        })
        .catch((err) => console.error("사용자 정보 조회 오류:", err));
    } else {
      router.push("/login"); // 로그인하지 않으면 로그인 페이지로 리디렉션
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // ✅ 토큰이 없으면 요청 안 함.
  
    fetch(`http://localhost:5001/api/profile/posts`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Authorization 추가
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("📌 내가 쓴 게시글 데이터:", data);
        setMyPosts(Array.isArray(data) ? data : []); // ✅ 데이터가 배열이 아니면 빈 배열로 처리
      })
      .catch((err) => {
        console.error("내 게시글 조회 오류:", err);
        setMyPosts([]); // ✅ 오류 발생 시 빈 배열로 초기화 (map 오류 방지)
      });
  }, []);
  
  

  // ✅ 내가 쓴 댓글 가져오기
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    fetch(`http://localhost:5001/api/profile/comments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("📌 내가 쓴 댓글 데이터:", data);
        setMyComments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("내 게시글 조회 오류:", err);
        setMyComments([]); // ✅ 오류 발생 시 빈 배열로 초기화 (map 오류 방지)
      });
  }, []);

  // ✅ 내가 좋아요한 게시글 가져오기
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    fetch(`http://localhost:5001/api/profile/liked-posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("📌 내가 좋아요한 게시글 데이터:", data);
        setLikedPosts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("내 게시글 조회 오류:", err);
        setLikedPosts([]); // ✅ 오류 발생 시 빈 배열로 초기화 (map 오류 방지)
      });
  }, []);

  // 닉네임 수정 함수
  const handleSaveNickname = async () => {
    if (newNickname === nickname) {
      alert("수정된 닉네임이 없습니다.");
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      const res = await fetch("http://localhost:5001/api/auth/update-nickname", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname: newNickname }),
      });

      if (res.ok) {
        setNickname(newNickname);
        setIsEditing(false);
        alert("닉네임이 성공적으로 변경되었습니다.");
      } else {
        alert("닉네임 수정에 실패했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#a1c638]/10 pt-16">
      <div className="max-w-4xl mx-auto p-6">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center mb-6">
            {isEditing ? (
              <div className="flex items-center justify-center gap-4">
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="p-2 border border-[#a1c638]/30 rounded-lg focus:ring-2 focus:ring-[#a1c638] focus:border-[#a1c638]"
                  placeholder="새 닉네임"
                />
                <button
                  onClick={handleSaveNickname}
                  className="bg-[#a1c638] hover:bg-[#91b232] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewNickname(nickname);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">{nickname}님의 프로필</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[#a1c638] hover:text-[#91b232] transition-colors"
                >
                  ✏️ 수정
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#a1c638]/10 p-4 rounded-lg">
              <p className="text-2xl font-bold text-[#a1c638]">{myPosts.length || 0}</p>
              <p className="text-gray-600">작성한 게시글</p>
            </div>
            <div className="bg-[#a1c638]/10 p-4 rounded-lg">
              <p className="text-2xl font-bold text-[#a1c638]">{myComments.length || 0}</p>
              <p className="text-gray-600">작성한 댓글</p>
            </div>
            <div className="bg-[#a1c638]/10 p-4 rounded-lg">
              <p className="text-2xl font-bold text-[#a1c638]">{likedPosts.length || 0}</p>
              <p className="text-gray-600">좋아요한 글</p>
            </div>
          </div>
        </div>

        {/* 내가 쓴 게시글 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">내가 쓴 게시글</h2>
          {myPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">아직 작성한 게시글이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="border border-[#a1c638]/20 rounded-lg p-4 hover:bg-[#a1c638]/10 transition-colors cursor-pointer"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 좋아요한 게시글 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">좋아요한 게시글</h2>
          {likedPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">아직 좋아요한 게시글이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {likedPosts.map((post) => (
                <div
                  key={post.id}
                  className="border border-[#a1c638]/20 rounded-lg p-4 hover:bg-[#a1c638]/10 transition-colors cursor-pointer"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 내가 쓴 댓글 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">내가 쓴 댓글</h2>
          {myComments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">아직 작성한 댓글이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {myComments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-[#a1c638]/20 rounded-lg p-4 hover:bg-[#a1c638]/10 transition-colors cursor-pointer"
                  onClick={() => router.push(`/post/${comment.post_id}`)}
                >
                  <p className="text-gray-800">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </div>
  );
}
