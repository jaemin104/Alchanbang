import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";  // Navbar 컴포넌트 추가

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [topCommenters, setTopCommenters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // 입력된 검색어
  const [appliedSearch, setAppliedSearch] = useState(""); // 실제 검색어 (버튼 클릭 시 적용)
  const router = useRouter();

  // 페이지 변경 또는 검색어 변경 시 API 호출
  useEffect(() => {
    const url = `http://localhost:5001/api/board?page=${currentPage}&search=${encodeURIComponent(appliedSearch)}`;
    console.log("📌 API 요청 URL:", url); // ✅ URL에 검색어가 포함되는지 확인

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("📌 API 응답 데이터:", data); // ✅ 응답 데이터 확인
        setPosts(data.posts || []);
        setPopularPosts(data.popularPosts || []);
        setTotalPages(data.totalPages || 1);

        // 🔥 검색어가 없을 때만 인기글 표시
        if (!appliedSearch) {
          setPopularPosts(data.popularPosts || []);
          setTopCommenters(data.topCommenters || []);
        } else {
          setPopularPosts([]); // 검색 중이면 인기글 숨김
          setTopCommenters([]);
        }
      })
      
      .catch((err) => {
        console.error("게시글 가져오기 오류:", err);
        setPosts([]);
      });
  }, [currentPage, appliedSearch]); // ✅ appliedSearch가 변경될 때 실행

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSearch = () => {
    console.log("📌 검색 버튼 클릭됨 - 검색어:", searchQuery); // ✅ 검색어가 정상적으로 저장되는지 확인
    setAppliedSearch(searchQuery); // ✅ 버튼 클릭 시 검색 실행
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
};


  return (
    <div>
      <h1>게시판</h1>
      <button onClick={handleLogout}>로그아웃</button>

      {/* 🔥 검색 결과가 없을 때만 인기글 & 우수댓글러 표시 */}
      {!appliedSearch && (
        <>
          <h2>🔥 인기글 (최근 3일 기준)</h2>
          {popularPosts.length === 0 ? (
            <p>최근 3일 동안 좋아요를 많이 받은 글이 없습니다.</p>
          ) : (
            <ul>
              {popularPosts.map((post) => (
                <li key={post.id}>{post.title} (최근 좋아요: {post.recent_likes})</li>
              ))}
            </ul>
          )}
          <h2>🏆 우수 댓글러 (최근 7일 기준)</h2>
          {topCommenters.length === 0 ? (
            <p>최근 7일 동안 댓글을 가장 많이 작성한 사용자가 없습니다.</p>
          ) : (
            <ul>
              {topCommenters.map((user, index) => (
                <li key={index}>{index + 1}위: {user.nickname} (댓글 {user.comment_count}개)</li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* ✅ 검색 입력창 + 검색 버튼 추가 */}
      <div>
        <input
          type="text"
          placeholder="검색어를 입력하세요..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>검색</button> {/* 검색 버튼 */}
      </div>

      {/* ✅ 검색 결과 없을 때 처리 */}
      {posts.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <a href={`/post/${post.id}`}>{post.title} (조회수: {post.views})</a>
            </li>
          ))}
        </ul>
      )}

      {/* 페이징 버튼 추가 */}
      <div>
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          이전
        </button>
        <span> {currentPage} / {totalPages} </span>
        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          다음
        </button>
      </div>

      

      

      <Navbar />
    </div>
  );
}
