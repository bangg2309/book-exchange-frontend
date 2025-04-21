"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${scrolled ? 'bg-green-800' : 'bg-green-700'} py-3 shadow-lg sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative overflow-hidden rounded-full border-2 border-white/70 transition-transform group-hover:scale-105">
              <Image 
                src="/images/logo.jpg" 
                alt="Book Exchange" 
                width={40} 
                height={40} 
                className="rounded-full"
              />
            </div>
            <span className="text-white font-bold text-xl group-hover:text-green-200 transition-colors">BookExchange</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Tìm kiếm sách, tác giả, môn học..." 
                className="w-full py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white/90 backdrop-blur-sm shadow-inner border border-green-50"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-green-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-white">
            <Link 
              href="/" 
              className={`hover:text-green-200 transition-colors text-sm font-medium relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-green-200 after:transition-all after:duration-300 ${isActive('/') ? 'after:w-full font-semibold' : 'after:w-0'}`}
            >
              Trang chủ
            </Link>
            <Link 
              href="/mua-sach" 
              className={`hover:text-green-200 transition-colors text-sm font-medium relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-green-200 after:transition-all after:duration-300 ${isActive('/mua-sach') ? 'after:w-full font-semibold' : 'after:w-0'}`}
            >
              Mua sách
            </Link>
            <Link 
              href="/ban-sach" 
              className={`hover:text-green-200 transition-colors text-sm font-medium relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-green-200 after:transition-all after:duration-300 ${isActive('/ban-sach') ? 'after:w-full font-semibold' : 'after:w-0'}`}
            >
              Bán sách
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative group p-1.5 hover:bg-green-600/30 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white group-hover:text-green-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Login Button */}
            <Link 
              href="/login"
              className="hidden md:flex items-center space-x-2 bg-white text-green-700 px-4 py-2 rounded-full font-medium text-sm hover:bg-green-50 transition-colors border border-transparent hover:border-green-200 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Đăng nhập</span>
            </Link>
            
            {/* Register Button */}
            <Link 
              href="/register"
              className="hidden md:flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-full font-medium text-sm hover:bg-green-500 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Đăng ký</span>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white p-1.5 hover:bg-green-600/30 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm sách, tác giả, môn học..." 
              className="w-full py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white/90 backdrop-blur-sm shadow-inner border border-green-50"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-green-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 py-2 bg-green-800/80 backdrop-blur-sm rounded-lg animate-fadeIn">
            <div className="flex flex-col space-y-1 p-2">
              <Link 
                href="/" 
                className={`text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center ${isActive('/') ? 'bg-green-600 font-semibold' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Trang chủ
              </Link>
              <Link 
                href="/mua-sach" 
                className={`text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center ${isActive('/mua-sach') ? 'bg-green-600 font-semibold' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Mua sách
              </Link>
              <Link 
                href="/ban-sach" 
                className={`text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center ${isActive('/ban-sach') ? 'bg-green-600 font-semibold' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bán sách
              </Link>
              <Link 
                href="/login" 
                className={`text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center ${isActive('/login') ? 'bg-green-600 font-semibold' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className={`text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center ${isActive('/register') ? 'bg-green-600 font-semibold' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Đăng ký
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;