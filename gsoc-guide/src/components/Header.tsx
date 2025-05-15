import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative w-14 h-14">
            <Image 
              src="/gsoc-logo2.svg" 
              alt="GSoC Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-bold text-gray-800">GSoC Guide</span>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-gray-600 hox`:text-gray-900">
                Organizations
              </Link>
            </li>
            <li>
              <Link href="https://summerofcode.withgoogle.com/" target="_blank" className="text-gray-600 hover:text-gray-900">
                Official Site
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 