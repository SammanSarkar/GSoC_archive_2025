import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative w-14 h-14">
            <Image 
              src="/gsoc-logo2.svg" 
              alt="GSoC Logo" 
              fill
              sizes="(max-width: 768px) 56px, 56px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">GSoC Guide</h1>
            <p className="text-blue-100 text-xs">Everything You Need to Ace Google Summer of Code</p>
          </div>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-white hover:text-blue-200 font-medium transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="https://summerofcode.withgoogle.com/" target="_blank" className="text-white hover:text-blue-200 font-medium transition-colors">
                Official Site
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 