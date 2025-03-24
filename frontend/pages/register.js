import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from 'next/head';

export default function Register() {
    const [form, setForm] = useState({ nickname: "", email: "", password: "" });
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`;
            console.log('Attempting to register with:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '회원가입 실패');
            }
            
            alert("회원가입 성공!");
            router.push("/login");
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || "회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <>
            <Head>
                <title>회원가입 - 알찬방</title>
            </Head>
            <div className="min-h-screen bg-[#a1c638]/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            회원가입
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            이미 계정이 있으신가요?{" "}
                            <Link href="/login" className="font-medium text-[#a1c638] hover:text-[#91b232]">
                                로그인하기
                            </Link>
                        </p>
                    </div>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <div className="mt-8 space-y-6">
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="nickname" className="sr-only">
                                    닉네임
                                </label>
                                <input
                                    id="nickname"
                                    name="nickname"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#a1c638]/30 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#a1c638] focus:border-[#a1c638] focus:z-10 sm:text-sm"
                                    placeholder="닉네임"
                                    value={form.nickname}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    이메일
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#a1c638]/30 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#a1c638] focus:border-[#a1c638] focus:z-10 sm:text-sm"
                                    placeholder="이메일"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    비밀번호
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#a1c638]/30 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#a1c638] focus:border-[#a1c638] focus:z-10 sm:text-sm"
                                    placeholder="비밀번호"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={handleRegister}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#a1c638] hover:bg-[#91b232] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a1c638]"
                            >
                                회원가입
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
