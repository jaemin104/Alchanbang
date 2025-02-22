import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">내 프로필</h1>

      {/* 닉네임 변경 */}
      <div className="mb-4">
        <strong>닉네임:</strong>
        {isEditing ? (
          <div>
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="새 닉네임을 입력하세요"
            />
            <button
              onClick={handleSaveNickname}
              className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              저장
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <span>{nickname}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 text-blue-500 hover:underline"
            >
              수정
            </button>
          </div>
        )}
      </div>

      {/* 내가 쓴 게시글 */}
      <h2 className="text-xl font-semibold mt-6">내가 쓴 게시글</h2>
      {!Array.isArray(myPosts) || myPosts.length === 0 ? (
        <p>게시글이 없습니다.</p>
      ) : (
        <ul className="list-disc ml-5">
          {myPosts.map((post) => (
            <li key={post.id}>
              <a href={`/post/${post.id}`} className="text-blue-500 hover:underline">
                {post.title}
              </a>
            </li>
          ))}
        </ul>
      )}


      {/* 내가 쓴 댓글 */}
      <h2 className="text-xl font-semibold mt-6">내가 쓴 댓글</h2>
      {!Array.isArray(myComments) || myComments.length === 0 ? (
        <p>댓글이 없습니다.</p>
      ) : (
        <ul className="list-disc ml-5">
          {myComments.map((comment) => (
            <li key={comment.id}>
              <a href={`/post/${comment.post_id}`} className="text-blue-500 hover:underline">
                {comment.content}
              </a>
            </li>
          ))}
        </ul>
      )}


      {/* 내가 좋아요한 게시글 */}
      <h2 className="text-xl font-semibold mt-6">좋아요한 게시글</h2>
      {!Array.isArray(likedPosts) || likedPosts.length === 0 ? (
        <p>좋아요한 게시글이 없습니다.</p>
      ) : (
        <ul className="list-disc ml-5">
          {likedPosts.map((post) => (
            <li key={post.id}>
              <a href={`/post/${post.id}`} className="text-blue-500 hover:underline">
                {post.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      { }
      <Navbar />
    </div>
  );
}
