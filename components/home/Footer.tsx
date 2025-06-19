'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  return (
    <footer className="bg-green-800 text-white pt-10 pb-6">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Thông tin liên hệ */}
          <div>
            <div className="flex items-center mb-4">
              <Image 
                src="/images/logo.jpg" 
                alt="Book Exchange" 
                width={40} 
                height={40} 
                className="mr-2"
              />
              <span className="text-white font-bold text-xl">BookExchange</span>
            </div>
            <p className="mb-4">Nền tảng mua bán sách cũ dành cho sinh viên</p>
            <div className="space-y-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Địa chỉ: Đại học Nông Lâm TP.HCM, Khu phố 6, P.Linh Trung, Tp.Thủ Đức, TP.HCM</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Hotline: 0123 456 789</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email: contact@bookexchange.vn</span>
              </div>
            </div>
          </div>

          {/* Liên kết */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-green-300">Trang chủ</Link></li>
              <li><Link href="/about" className="hover:text-green-300">Về chúng tôi</Link></li>
              <li><Link href="/books" className="hover:text-green-300">Mua sách</Link></li>
              <li><Link
                  href="/sell-book"
                  className={`hover:text-green-300 ${isActive('/sell-book') ? 'after:w-full font-semibold' : 'after:w-0'}`}
              >Bán sách</Link></li>
              <li><Link href="/blog" className="hover:text-green-300">Blog</Link></li>
            </ul>
          </div>

          {/* Chính sách */}
          <div>
            <h3 className="font-bold text-lg mb-4">Chính sách</h3>
            <ul className="space-y-2">
              <li><Link href="/chinh-sach-bao-mat" className="hover:text-green-300">Chính sách bảo mật</Link></li>
              <li><Link href="/quy-dinh-giao-dich" className="hover:text-green-300">Quy định giao dịch</Link></li>
              <li><Link href="/cau-hoi-thuong-gap" className="hover:text-green-300">Câu hỏi thường gặp</Link></li>
              <li><Link href="/dieu-khoan-su-dung" className="hover:text-green-300">Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          {/* Kết nối */}
          <div>
            <h3 className="font-bold text-lg mb-4">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="bg-white text-green-700 p-2 rounded-full hover:bg-green-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                </svg>
              </a>
              <a href="#" className="bg-white text-green-700 p-2 rounded-full hover:bg-green-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="bg-white text-green-700 p-2 rounded-full hover:bg-green-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="bg-white text-green-700 p-2 rounded-full hover:bg-green-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
            <h3 className="font-bold text-lg mb-2">Đăng ký nhận tin</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Nhập email của bạn" 
                className="px-4 py-2 w-full rounded-l-lg text-gray-900 focus:outline-none"
              />
              <button 
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-r-lg transition"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-green-700 text-center">
          <p>&copy; {new Date().getFullYear()} BookExchange. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;