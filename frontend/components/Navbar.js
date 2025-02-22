import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-gray-800 p-4 fixed bottom-0 w-full">
            <ul className="flex justify-center space-x-4 text-white">
                <li>
                    <Link href="/" className="hover:text-gray-400">
                        홈
                    </Link>
                </li>
                <li>
                    <Link href="/create-post" className="hover:text-gray-400">
                        글쓰기
                    </Link>
                </li>
                <li>
                    <Link href="/profile" className="hover:text-gray-400">
                        내 프로필
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
