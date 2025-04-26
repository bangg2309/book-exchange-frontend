import React from 'react';

const steps = [
  {
    id: 1,
    title: 'Đăng sách',
    description: 'Đăng thông tin sách cần bán lên hệ thống'
  },
  {
    id: 2,
    title: 'Kết nối người mua',
    description: 'Người mua sẽ liên hệ khi thấy sách phù hợp'
  },
  {
    id: 3,
    title: 'Giao dịch',
    description: 'Thực hiện giao dịch và giao nhận sách'
  },
  {
    id: 4,
    title: 'Đánh giá',
    description: 'Người mua và người bán đánh giá sau giao dịch'
  }
];

const ProcessSection = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-12">
          Quy trình hoạt động
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-700 text-white flex items-center justify-center text-xl font-bold mb-4">
                {step.id}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">{step.title}</h3>
              <p className="text-gray-600 text-center">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex justify-center mt-6">
          <div className="w-3/4 h-1 bg-gray-200 relative">
            {steps.map((step, index) => {
              // Chỉ hiển thị mũi tên giữa các bước, không có ở bước cuối
              if (index < steps.length - 1) {
                const position = (100 / (steps.length - 1)) * index;
                return (
                  <div 
                    key={`arrow-${step.id}`}
                    className="absolute top-1/2 transform -translate-y-1/2"
                    style={{ left: `${position}%`, right: `${100 - position}%` }}
                  >
                    <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;