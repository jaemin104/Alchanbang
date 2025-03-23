import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Register() {
    const [form, setForm] = useState({ nickname: "", email: "", password: "" });
    const router = useRouter();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, form);
            alert("회원가입 성공!");
            router.push("/login");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
            alert(errorMessage);
        }
    };

    return (
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
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#a1c638] hover:bg-[#91b232] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a1c638]"
                        >
                            회원가입
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
