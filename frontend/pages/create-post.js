import { useState } from "react";
import { useRouter } from "next/router";

export default function CreatePost() {
  const [title, setTitle] = useState(""); // 제목
  const [content, setContent] = useState(""); // 내용
  const router = useRouter();

  // 게시글 작성 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 제목과 내용이 비어 있으면 경고
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    // 게시글 작성 API 호출
    const res = await fetch("http://localhost:5001/api/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`, // 토큰을 헤더에 추가
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });

    if (res.ok) {
      // 게시글 작성 성공 후 메인 페이지로 이동
      alert("게시글이 작성되었습니다.");
      router.push("/"); // 홈으로 리디렉션
    } else {
      // 게시글 작성 실패
      console.error("게시글 작성 실패:", await res.text());
      alert("게시글 작성에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">새 게시글 작성</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium">제목</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="게시글 제목을 입력하세요"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium">내용</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="게시글 내용을 입력하세요"
            rows="6"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md"
        >
          게시글 작성
        </button>
      </form>
    </div>
  );
}
