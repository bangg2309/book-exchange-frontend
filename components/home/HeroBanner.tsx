'use client';

import Link from 'next/link';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useState } from 'react';
import { slideService } from '@/services/slideService';
import {usePathname} from "next/navigation"; // Đường dẫn đúng tùy theo cấu trúc dự án của bạn

const HeroBanner = () => {
  const [images, setImages] = useState<string[]>([]);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const fetchSlides = async () => {
      const urls = await slideService.getAllSlides();
      setImages(urls);
      console.log('✅ Ảnh slide đã load:', urls);
    };

    fetchSlides();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
      <section className="bg-white py-10">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Text bên trái */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
              Mua và bán sách cũ<br />cho sinh viên
            </h1>
            <p className="text-gray-600 mb-6">
              Nền tảng giúp học sinh, sinh viên mua bán sách cũ
              tiết kiệm chi phí và tạo môi trường học tập bền vững.
            </p>
            <div className="flex space-x-4">
              <Link
                  href="/sell-book"
                  className={`bg-green-700 hover:bg-green-800 text-white py-2 px-6 rounded-full font-medium transition ${isActive('/sell-book') ? 'after:w-full font-semibold' : 'after:w-0'}`}
              >
                Đăng bán sách
              </Link>
              <Link href="/books" className="border border-green-700 text-green-700 hover:bg-green-50 py-2 px-6 rounded-full font-medium transition">
                Tìm sách
              </Link>

            </div>
          </div>

          {/* Slide bên phải */}
          <div className="relative h-64 md:h-80 w-full">
            <Slider {...settings}>
              {images.map((src, index) => (
                  <div key={index} className="h-64 md:h-80 relative">
                    <Image
                        src={src}
                        alt={`Slide ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover rounded-xl"
                    />
                  </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>
  );
};

export default HeroBanner;
