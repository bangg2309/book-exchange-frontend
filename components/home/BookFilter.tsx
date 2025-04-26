import React from 'react';

const BookFilter = () => {
  return (
    <div className="bg-white py-4">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <p className="text-gray-600 mb-2 md:mb-0">Lọc theo:</p>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Chuyên ngành Filter */}
            <div className="relative min-w-[150px]">
              <select className="w-full py-2 px-3 border border-gray-300 rounded bg-white appearance-none pr-8">
                <option value="">Chuyên ngành</option>
                <option value="cntt">Công nghệ thông tin</option>
                <option value="kinhte">Kinh tế</option>
                <option value="ngoaingu">Ngoại ngữ</option>
                <option value="yduoc">Y - Dược</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Trường học Filter */}
            <div className="relative min-w-[150px]">
              <select className="w-full py-2 px-3 border border-gray-300 rounded bg-white appearance-none pr-8">
                <option value="">Trường học</option>
                <option value="dhcntp">ĐH Công nghệ TP.HCM</option>
                <option value="dhbk">ĐH Bách Khoa TP.HCM</option>
                <option value="dhnl">ĐH Nông Lâm TP.HCM</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Tình trạng sách Filter */}
            <div className="relative min-w-[150px]">
              <select className="w-full py-2 px-3 border border-gray-300 rounded bg-white appearance-none pr-8">
                <option value="">Tình trạng sách</option>
                <option value="new">Mới (90-100%)</option>
                <option value="good">Tốt (70-90%)</option>
                <option value="used">Đã sử dụng (50-70%)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Giá tiền Filter */}
            <div className="relative min-w-[150px]">
              <select className="w-full py-2 px-3 border border-gray-300 rounded bg-white appearance-none pr-8">
                <option value="">Giá tiền</option>
                <option value="lt100">Dưới 100.000đ</option>
                <option value="100-200">100.000đ - 200.000đ</option>
                <option value="gt200">Trên 200.000đ</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Tác giả Filter */}
            <div className="relative min-w-[150px]">
              <select className="w-full py-2 px-3 border border-gray-300 rounded bg-white appearance-none pr-8">
                <option value="">Tác giả</option>
                <option value="a">A - D</option>
                <option value="e">E - H</option>
                <option value="i">I - L</option>
                <option value="m">M - P</option>
                <option value="q">Q - T</option>
                <option value="u">U - Z</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition">
              Áp dụng
            </button>
            <button className="border border-gray-300 text-gray-600 py-2 px-4 rounded hover:bg-gray-50 transition">
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookFilter;