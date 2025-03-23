import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
    const router = useRouter();
    
    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <nav className="bg-[#a1c638] p-4 fixed top-0 w-full shadow-lg z-50">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/" className="text-3xl font-bold text-white hover:text-white/90 transition-colors">
                            알찬방
                        </Link>
                        <span className="ml-3 text-sm text-white/90">
                            알고리즘 공부하면 칭찬해주는 방
                        </span>
                    </div>
                    <ul className="flex items-center space-x-6">
                        <li>
                            <Link href="/" className="text-white hover:text-white/90 transition-colors">
                                홈
                            </Link>
                        </li>
                        <li>
                            <Link href="/post/create" className="text-white hover:text-white/90 transition-colors">
                                글쓰기
                            </Link>
                        </li>
                        <li>
                            <Link href="/profile" className="text-white hover:text-white/90 transition-colors">
                                내 프로필
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="text-white hover:text-white/90 transition-colors"
                            >
                                로그아웃
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
