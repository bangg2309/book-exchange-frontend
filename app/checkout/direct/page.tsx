'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaMapMarkerAlt, FaTruck, FaMoneyBillWave } from 'react-icons/fa';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import AddressForm from '@/components/checkout/AddressForm';
import { toastService } from '@/services/toastService';
import { AddressType } from '@/types/address';
import { orderService } from '@/services/orderService';
import { OrderCreationRequest, OrderItemRequest, OrderBookItemRequest } from '@/types/order';
import { authService } from '@/services/authService';
import { shippingAddressService } from '@/services/shippingAddressService';
import { voucherService } from '@/services/voucherService';
import { PaymentMethod } from '@/types/payment';
import { paymentService } from '@/services/paymentService';

// Định nghĩa kiểu dữ liệu
type DeliveryMethod = 'standard' | 'express';

interface DirectCheckoutBook {
  bookId: number;
  title: string;
  price: number;
  thumbnail: string;
  sellerId: number;
  sellerName: string;
  conditionNumber: number;
}

interface SellerGroup {
  sellerId: number;
  sellerName: string;
  shippingFee: number;
  note: string;
}

export default function DirectCheckoutPage() {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState<DirectCheckoutBook | null>(null);
  const [sellerGroup, setSellerGroup] = useState<SellerGroup | null>(null);
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [note, setNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Tính toán giá trị đơn hàng
  const subtotal = book ? book.price : 0;
  const shippingFee = sellerGroup ? (deliveryMethod === 'express' ? sellerGroup.shippingFee * 2 : sellerGroup.shippingFee) : 0;
  const total = subtotal + shippingFee - discount;

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Kiểm tra đăng nhập
        if (!authService.isAuthenticated()) {
          toastService.error('Vui lòng đăng nhập để thanh toán');
          router.push('/login');
          return;
        }
        
        // Lấy thông tin sách từ sessionStorage
        const storedBook = sessionStorage.getItem('directCheckout');
        
        if (!storedBook) {
          toastService.error('Không tìm thấy thông tin sách để thanh toán');
          router.push('/books');
          return;
        }
        
        try {
          // Parse dữ liệu JSON
          const bookData = JSON.parse(storedBook) as DirectCheckoutBook;
          
          setBook(bookData);
          
          // Tạo thông tin người bán
          setSellerGroup({
            sellerId: bookData.sellerId,
            sellerName: bookData.sellerName || 'Chưa xác định',
            shippingFee: 15000, // Phí vận chuyển mặc định
            note: ''
          });
          
          // Fetch địa chỉ giao hàng
          const addresses = await shippingAddressService.getAddresses();
          setAddresses(addresses);
          
          // Chọn địa chỉ mặc định nếu có
          const defaultAddress = addresses.find(addr => addr.defaultAddress);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id);
          } else if (addresses.length > 0) {
            setSelectedAddress(addresses[0].id);
          }
        } catch (parseError) {
          console.error('Error parsing book data:', parseError);
          toastService.error('Dữ liệu sách không hợp lệ');
          router.push('/books');
        }
      } catch (error) {
        console.error('Error fetching checkout data:', error);
        toastService.error('Không thể tải dữ liệu thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Xử lý thêm địa chỉ mới
  const handleAddAddress = async (address: Omit<AddressType, 'id'>) => {
    try {
      const newAddress = await shippingAddressService.createAddress(address);
      if (newAddress) {
        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddress(newAddress.id);
        setShowAddressModal(false);
        toastService.success('Thêm địa chỉ mới thành công');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toastService.error('Không thể thêm địa chỉ mới');
    }
  };

  // Áp dụng mã giảm giá
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toastService.error('Vui lòng nhập mã giảm giá');
      return;
    }
    
    try {
      // Giả lập áp dụng mã giảm giá
      if (voucherCode === 'FIRSTBUY') {
        const discountAmount = Math.min(total * 0.1, 50000);
        setDiscount(discountAmount);
        toastService.success(`Áp dụng mã giảm giá thành công: -${discountAmount.toLocaleString('vi-VN')}đ`);
      } else {
        toastService.error('Mã giảm giá không hợp lệ');
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      toastService.error('Không thể áp dụng mã giảm giá');
    }
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    if (!book || !sellerGroup) {
      toastService.error('Không có sản phẩm để thanh toán');
      return;
    }
    
    if (!selectedAddress) {
      toastService.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        toastService.error('Vui lòng đăng nhập để thanh toán');
        router.push('/login');
        return;
      }
      
      // Tạo đối tượng OrderBookItemRequest
      const bookItem: OrderBookItemRequest = {
        bookId: Number(book.bookId),
        quantity: 1,
        price: book.price,
        subtotal: book.price
      };
      
      // Tạo đối tượng OrderItemRequest
      const orderItem: OrderItemRequest = {
        sellerId: sellerGroup.sellerId,
        shippingFee: deliveryMethod === 'express' ? sellerGroup.shippingFee * 2 : sellerGroup.shippingFee,
        note: note,
        bookItems: [bookItem]
      };
      
      // Tạo đối tượng OrderCreationRequest
      const orderRequest: OrderCreationRequest = {
        userId: Number(currentUser.id),
        shippingAddressId: selectedAddress,
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
        note: note,
        voucherCode: voucherCode || undefined,
        shippingFee: shippingFee,
        discount: discount,
        totalPrice: total,
        returnUrl: `${window.location.origin}/payment/callback`,
        items: [orderItem]
      };
      
      // Gọi API để tạo đơn hàng
      const order = await orderService.createOrder(orderRequest);
      
      if (order) {
        // Xóa thông tin sách trong sessionStorage
        sessionStorage.removeItem('directCheckout');
        
        // Nếu thanh toán VNPay, chuyển hướng đến trang thanh toán
        if (paymentMethod === PaymentMethod.VNPAY) {
          const paymentRequest = {
            orderId: order.id,
            orderInfo: `Thanh toan don hang #${order.id}`,
            amount: total,
            language: 'vn'
          };
          
          const paymentResponse = await paymentService.createPaymentUrl(paymentRequest);
          
          if (paymentResponse && paymentResponse.paymentUrl) {
            // Chuyển hướng đến trang thanh toán VNPay
            window.location.href = paymentResponse.paymentUrl;
            return;
          }
        }
        
        // Hiển thị thông báo thành công
        toastService.success('Đặt hàng thành công!');
        
        // Chuyển hướng đến trang chi tiết đơn hàng
        router.push(`/profile/buy-orders`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toastService.error('Không thể xử lý đơn hàng');
    } finally {
      setIsProcessing(false);
    }
  };

  // Trong hàm render, thêm biến tạm để tránh lỗi TypeScript
  const shippingFeeDisplay = () => {
    if (!sellerGroup) return '0';
    // Sử dụng optional chaining
    const fee = sellerGroup?.shippingFee;
    if (typeof fee !== 'number') return '0';
    return fee.toLocaleString('vi-VN');
  };

  // Render component
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-screen-xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Thanh toán</h1>
          <Link 
            href={`/books/${book?.bookId}`}
            className="flex items-center text-green-600 hover:text-green-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>Quay lại trang sách</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : !book ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-6 p-6 bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không có sản phẩm để thanh toán</h2>
              <p className="text-gray-500 mb-6">Vui lòng chọn sản phẩm trước khi thanh toán</p>
              <Link 
                href="/books" 
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Xem danh sách sách
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:w-2/3">
              {/* Địa chỉ giao hàng */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaMapMarkerAlt className="text-green-600 mr-2" />
                    Địa chỉ giao hàng
                  </h2>
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    + Thêm địa chỉ mới
                  </button>
                </div>
                
                {addresses.length === 0 ? (
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                    Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ mới.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(address => (
                      <div 
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedAddress === address.id 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => setSelectedAddress(address.id)}
                      >
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full border ${
                              selectedAddress === address.id 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300'
                            } flex items-center justify-center mr-2`}>
                              {selectedAddress === address.id && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-800">{address.fullName}</span>
                                <span className="mx-2 text-gray-300">|</span>
                                <span className="text-gray-600">{address.phoneNumber}</span>
                                {address.defaultAddress && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {address.addressDetail}, {address.ward}, {address.district}, {address.province}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Sản phẩm thanh toán */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Sản phẩm thanh toán</h2>
                </div>
                
                <ul className="divide-y divide-gray-100">
                  <li className="py-4 flex">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded flex items-center justify-center overflow-hidden relative mr-4">
                      {book.thumbnail ? (
                        <Image
                          src={book.thumbnail}
                          alt={book.title}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="text-gray-400">No image</div>
                      )}
                    </div>
                    
                    <div className="flex-grow flex flex-col">
                      <Link href={`/books/${book.bookId}`} className="font-medium text-gray-800 hover:text-green-600 transition-colors line-clamp-2">
                        {book.title}
                      </Link>
                      <div className="text-sm mt-1">
                        Tình trạng: <span className="font-medium">{book.conditionNumber}/5</span>
                      </div>
                      <div className="text-sm mt-1">
                        Người bán: <span className="font-medium">{book.sellerName || 'Không xác định'}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-green-700">
                        {book.price.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-sm text-gray-500">x1</div>
                    </div>
                  </li>
                </ul>
                
                {/* Phương thức giao hàng */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center mb-3">
                    <FaTruck className="text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Phương thức giao hàng</h3>
                  </div>
                  
                  <div className={`border rounded-lg p-3 ${deliveryMethod === 'standard' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">
                          {deliveryMethod === 'standard' ? 'Giao hàng tiêu chuẩn (3-5 ngày)' : 'Giao hàng nhanh (1-2 ngày)'}
                        </div>
                      </div>
                      <div className="font-medium text-green-700">
                        {(deliveryMethod === 'standard' 
                          ? (sellerGroup && sellerGroup.shippingFee ? sellerGroup.shippingFee : 0) 
                          : (sellerGroup && sellerGroup.shippingFee ? sellerGroup.shippingFee * 2 : 0)
                        ).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ghi chú */}
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium text-gray-800 mb-3">Ghi chú</h3>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Nhập ghi chú cho người bán (nếu có)"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              {/* Phương thức thanh toán */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center mb-4">
                  <FaMoneyBillWave className="text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">Phương thức thanh toán</h2>
                </div>
                
                <div className="space-y-3">
                  {/* COD */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === PaymentMethod.COD 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setPaymentMethod(PaymentMethod.COD)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border ${
                        paymentMethod === PaymentMethod.COD 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300'
                      } flex items-center justify-center mr-3`}>
                        {paymentMethod === PaymentMethod.COD && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-600 mr-2" />
                        <span className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* VNPay */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === PaymentMethod.VNPAY 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setPaymentMethod(PaymentMethod.VNPAY)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border ${
                        paymentMethod === PaymentMethod.VNPAY 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300'
                      } flex items-center justify-center mr-3`}>
                        {paymentMethod === PaymentMethod.VNPAY && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800">Thanh toán qua VNPay</span>
                      </div>
                    </div>
                    {paymentMethod === PaymentMethod.VNPAY && (
                      <div className="mt-3 pl-8">
                        <p className="text-sm text-gray-600">
                          Thanh toán trực tuyến qua VNPay bằng thẻ ATM, Visa, Master, JCB hoặc ví điện tử.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Tổng thanh toán</h2>
                
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-3 pr-28 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Nhập mã giảm giá"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                    <button
                      className="absolute right-2 top-2 px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      onClick={handleApplyVoucher}
                    >
                      Áp dụng
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    * Thử mã "FIRSTBUY" để được giảm 10% (tối đa 50.000đ)
                  </p>
                </div>
                
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">{shippingFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">-{discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-100">
                    <span>Tổng cộng:</span>
                    <span className="text-green-700">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <button 
                    onClick={handlePlaceOrder}
                    className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    disabled={!selectedAddress || isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      <>
                        <FaMoneyBillWave className="mr-2" />
                        <span className="font-medium">Đặt hàng</span>
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-sm text-gray-500">
                    Bằng cách đặt hàng, bạn đồng ý với 
                    <Link href="/terms" className="text-green-600 hover:underline mx-1">Điều khoản dịch vụ</Link> 
                    của chúng tôi.
                  </p>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Chính sách đặt hàng</h3>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Kiểm tra hàng trước khi thanh toán (với COD)</li>
                    <li>• Đổi trả trong vòng 3 ngày nếu sách không đúng mô tả</li>
                    <li>• Hỗ trợ 24/7: 1900 1234</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      
      {/* Modal thêm địa chỉ */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thêm địa chỉ mới</h2>
            <AddressForm 
              onSaveAddress={handleAddAddress}
              onClose={() => setShowAddressModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 