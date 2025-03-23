import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [topCommenters, setTopCommenters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/board?page=${currentPage}&search=${encodeURIComponent(appliedSearch)}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("게시글 데이터:", data);
        console.log("첫 번째 게시글 상세 정보:", data.posts?.[0]);
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);

        if (!appliedSearch) {
          console.log("인기글 데이터:", data.popularPosts);
          setPopularPosts(data.popularPosts || []);
          setTopCommenters(data.topCommenters || []);
        } else {
          setPopularPosts([]);
          setTopCommenters([]);
        }
      })
      .catch((err) => {
        console.error("게시글 가져오기 오류:", err);
        setPosts([]);
      });
  }, [currentPage, appliedSearch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSearch = () => {
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-[#a1c638]/10 pt-16">
      <div className="max-w-4xl mx-auto p-6">
        {/* 검색 바 */}
        <div className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="검색어를 입력하세요..."
              className="flex-1 p-3 border border-[#a1c638]/30 rounded-lg focus:ring-2 focus:ring-[#a1c638] focus:border-[#a1c638]"
            />
            <button
              onClick={handleSearch}
              className="bg-[#a1c638] hover:bg-[#91b232] text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>🔍</span>
              <span>검색</span>
            </button>
          </div>
        </div>

        {/* 인기글과 우수 댓글러 섹션 */}
        {!appliedSearch && (
          <div className="grid grid-cols-2 gap-6 mb-12">
            {/* 인기글 섹션 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🔥 인기글 <span className="text-sm font-normal text-gray-500">(최근 3일)</span>
              </h2>
              {popularPosts.length === 0 ? (
                <p className="text-gray-500">최근 3일 동안 좋아요를 많이 받은 글이 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {popularPosts.map((post) => (
                    <li key={post.id} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => router.push(`/post/${post.id}`)}
                          className="text-gray-900 hover:text-[#a1c638] text-left transition-colors flex-1 truncate mr-2"
                        >
                          {post.title}
                        </button>
                        <span className="text-sm text-gray-500 whitespace-nowrap">❤️ {post.recent_likes || 0}개</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        작성자: {post.nickname || post.author}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 우수 댓글러 섹션 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🏆 우수 댓글러 <span className="text-sm font-normal text-gray-500">(최근 7일)</span>
              </h2>
              {topCommenters.length === 0 ? (
                <p className="text-gray-500">최근 7일 동안 댓글을 가장 많이 작성한 사용자가 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {topCommenters.map((user, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-gray-900">
                        {index + 1}위: {user.nickname}
                      </span>
                      <span className="text-sm text-gray-500">💬 {user.comment_count}개</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* 게시글 목록 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {appliedSearch ? `'${appliedSearch}' 검색 결과` : '전체 게시글'}
            </h2>
            <button
              onClick={() => router.push('/post/create')}
              className="bg-[#a1c638] hover:bg-[#91b232] text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>✏️</span>
              <span>새 글 작성</span>
            </button>
          </div>
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">아직 게시글이 없습니다.</p>
                <p className="text-gray-400">첫 번째 게시글을 작성해보세요!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 hover:text-[#a1c638] transition-colors">
                      {post.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👁️ {post.views}</span>
                      <span>❤️ {post.likes}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <span>작성자: {post.nickname || post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#a1c638]">💬 {post.comment_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#a1c638]/10 text-[#a1c638] hover:bg-[#a1c638]/20'
              }`}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-[#a1c638] text-white'
                    : 'bg-[#a1c638]/10 text-[#a1c638] hover:bg-[#a1c638]/20'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#a1c638]/10 text-[#a1c638] hover:bg-[#a1c638]/20'
              }`}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
