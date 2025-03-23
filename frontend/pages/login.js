import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token); // 토큰 저장
      router.push("/"); // 로그인 성공하면 게시판으로 이동
    } else {
      alert("로그인 실패: " + data.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#a1c638]/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">로그인</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            또는{' '}
            <Link href="/register" className="font-medium text-[#a1c638] hover:text-[#91b232]">
              회원가입
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[#a1c638]/30 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#a1c638] focus:border-[#a1c638] focus:z-10 sm:text-sm"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-[#a1c638]/30 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#a1c638] focus:border-[#a1c638] focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#a1c638] hover:bg-[#91b232] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a1c638]"
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
