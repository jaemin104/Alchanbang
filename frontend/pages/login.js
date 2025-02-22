import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5001/api/auth/login", {
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

  const handleRegisterRedirect = () => {
    router.push("/register"); // 회원가입 페이지로 이동
  };

  return (
    <div>
      <h2>로그인</h2>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>로그인</button>
      <div>
        <button onClick={handleRegisterRedirect}>회원가입</button> {/* 회원가입 버튼 추가 */}
      </div>
    </div>
  );
}
