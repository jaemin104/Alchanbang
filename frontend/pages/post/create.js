import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function PostCreate() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/board`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        alert('게시글이 작성되었습니다.');
        router.push('/');
      } else {
        const data = await response.json();
        alert(data.message || '게시글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 작성 중 오류:', error);
      alert('게시글 작성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#a1c638]/10 pt-16">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">새 게시글 작성</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-[#a1c638]/30 rounded-lg focus:ring-2 focus:ring-[#a1c638] focus:border-[#a1c638]"
                placeholder="제목을 입력하세요"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-[#a1c638]/30 rounded-lg focus:ring-2 focus:ring-[#a1c638] focus:border-[#a1c638] min-h-[300px] resize-none"
                placeholder="내용을 입력하세요"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#a1c638] hover:bg-[#91b232] text-white rounded-lg transition-colors"
              >
                작성하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 