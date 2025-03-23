import { useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 확인
    const isAuthPage = router.pathname === "/login" || router.pathname === "/register"; 

    if (!token && !isAuthPage) {
      router.push("/login"); // 로그인 안 되어 있으면 로그인 페이지로 이동
    }
  }, [router.pathname]);

  const isAuthPage = router.pathname === "/login" || router.pathname === "/register";

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Component {...pageProps} />
    </>
  );
}
