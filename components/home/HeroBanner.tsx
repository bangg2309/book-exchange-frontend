import Link from 'next/link';
import Image from 'next/image';

const HeroBanner = () => {
  return (
    <section className="bg-white py-10">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
            Mua và bán sách cũ<br />cho sinh viên
          </h1>
          <p className="text-gray-600 mb-6">
            Nền tảng giúp học sinh, sinh viên mua bán sách cũ
            tiết kiệm chi phí và tạo môi trường học tập bền vững.
          </p>
          <div className="flex space-x-4">
            <Link href="/ban-sach" className="bg-green-700 hover:bg-green-800 text-white py-2 px-6 rounded-full font-medium transition">
              Đăng bán sách
            </Link>
            <Link href="/mua-sach" className="border border-green-700 text-green-700 hover:bg-green-50 py-2 px-6 rounded-full font-medium transition">
              Tìm sách
            </Link>
          </div>
        </div>
        <div className="relative h-64 md:h-80">
          <Image
            src="/images/hero-image.jpg"
            alt="Trao đổi sách"
            fill
            className="rounded-lg object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;