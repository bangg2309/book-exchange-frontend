'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaMapMarkerAlt, FaTruck, FaMoneyBillWave } from 'react-icons/fa';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import AddressForm from '@/components/checkout/AddressForm';
import { toastService } from '@/services/toastService';
import { CartItemResponse } from "@/types/cart";
import { cartService } from '@/services/cartService';
import { AddressType } from '@/types/address';
import { orderService } from '@/services/orderService';
import { OrderCreationRequest, OrderItemRequest, OrderBookItemRequest } from '@/types/order';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { shippingAddressService } from '@/services/shippingAddressService';
import { voucherService } from '@/services/voucherService';
import { paymentService } from '@/services/paymentService';
import { PaymentMethod } from '@/types/payment';

// Định nghĩa kiểu dữ liệu
type DeliveryMethod = 'standard' | 'express';

// Interface để nhóm sản phẩm theo người bán
type SellerGroup = {
  sellerId: number;
  sellerName: string;
  items: CartItemResponse[];
  shippingFee: number;
  note: string;
};

export default function CheckoutPage() {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
  const [sellerGroups, setSellerGroups] = useState<SellerGroup[]>([]);
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
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalShippingFee = sellerGroups.reduce((sum, group) => sum + group.shippingFee, 0);
  const shippingFee = deliveryMethod === 'express' ? totalShippingFee * 2 : totalShippingFee;
  const total = subtotal + shippingFee - discount;

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch giỏ hàng
        const items = await cartService.getCart();
        setCartItems(items);
        
        // Nhóm sản phẩm theo người bán
        const groupedItems: Record<number, SellerGroup> = {};
        
        items.forEach(item => {
          const sellerId = item.sellerId || 0;
          
          if (!groupedItems[sellerId]) {
            groupedItems[sellerId] = {
              sellerId,
              sellerName: item.sellerName || 'Chưa xác định',
              items: [],
              shippingFee: 15000,
              note: ''
            };
          }
          
          groupedItems[sellerId].items.push(item);
        });
        
        setSellerGroups(Object.values(groupedItems));
        
        // Fetch địa chỉ giao hàng từ API thay vì dùng mock data
        const addresses = await shippingAddressService.getAddresses();
        setAddresses(addresses);
        
        // Chọn địa chỉ mặc định nếu có
        const defaultAddress = addresses.find(addr => addr.defaultAddress);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        } else if (addresses.length > 0) {
          setSelectedAddress(addresses[0].id);
        }
      } catch (error) {
        console.error('Error fetching checkout data:', error);
        toastService.error('Không thể tải dữ liệu thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý lưu địa chỉ mới
  const handleSaveAddress = async (newAddress: AddressType) => {
    try {
      // Gọi API để lưu địa chỉ mới
      const createdAddress = await shippingAddressService.createAddress(newAddress);
      
      if (createdAddress) {
        // Cập nhật danh sách địa chỉ
        const updatedAddresses = [...addresses];
        
        // Nếu địa chỉ mới là mặc định, cập nhật các địa chỉ khác
        if (newAddress.defaultAddress) {
          updatedAddresses.forEach(addr => {
            addr.defaultAddress = false;
          });
        }
        
        updatedAddresses.push(createdAddress);
        setAddresses(updatedAddresses);
        
        // Chọn địa chỉ mới
        setSelectedAddress(createdAddress.id);
        
        // Đóng modal
        setShowAddressModal(false);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toastService.error('Không thể lưu địa chỉ mới');
    }
  };

  // Xử lý thay đổi ghi chú cho từng người bán
  const handleNoteChange = (sellerId: number, note: string) => {
    setSellerGroups(prev => prev.map(group => 
      group.sellerId === sellerId ? {...group, note} : group
    ));
  };

  // Xử lý áp dụng voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode) {
      toastService.error('Vui lòng nhập mã giảm giá');
      return;
    }
    
    // Gọi API để kiểm tra và tính toán giảm giá
    const result = await voucherService.validateVoucher(voucherCode, subtotal);
    
    if (result && result.valid) {
      setDiscount(result.discount);
      toastService.success('Áp dụng mã giảm giá thành công');
    }
  };

  // Khởi tạo voucher demo khi component mount
  useEffect(() => {
    const initializeDemoVoucher = async () => {
      try {
        await voucherService.initializeDemoVoucher();
      } catch (error) {
        console.error('Error initializing demo voucher:', error);
      }
    };

    initializeDemoVoucher();
  }, []);

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toastService.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const userInfo = authService.getCurrentUser();
      if (!userInfo) {
        router.push('/login');
        return;
      }

      // Tạo danh sách các OrderItem theo người bán
      const orderItems: OrderItemRequest[] = sellerGroups.map(group => ({
        sellerId: group.sellerId,
        shippingFee: deliveryMethod === 'express' ? group.shippingFee * 2 : group.shippingFee,
        note: group.note,
        bookItems: group.items.map(item => ({
          bookId: item.bookId,
          quantity: 1,
          price: item.price,
          subtotal: item.price
        }))
      }));

      // Tạo đơn hàng
      const orderRequest: OrderCreationRequest = {
        userId: Number(userInfo.id),
        shippingAddressId: selectedAddress,
        paymentMethod: paymentMethod,
        voucherCode: discount > 0 ? voucherCode : undefined,
        shippingFee: shippingFee,
        discount: discount,
        totalPrice: total,
        items: orderItems,
        returnUrl: `${window.location.origin}/payment/callback`
      };

      // Gọi API đặt hàng
      const orderResponse = await orderService.createOrder(orderRequest);
      
      // Nếu thanh toán VNPay, chuyển hướng đến trang thanh toán
      if (paymentMethod === PaymentMethod.VNPAY) {
        const paymentRequest = {
          orderId: orderResponse.id,
          orderInfo: `Thanh toan don hang #${orderResponse.id}`,
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
      
      // Nếu là COD hoặc không có URL thanh toán, chuyển hướng đến trang đơn hàng
      router.push(`/orders/${orderResponse.id}`);
      toastService.success('Đặt hàng thành công!');
    } catch (error) {
      console.error('Error placing order:', error);
      toastService.error('Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Tìm địa chỉ được chọn
  const selectedAddressData = selectedAddress
    ? addresses.find(addr => addr.id === selectedAddress)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-screen-xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Thanh toán</h1>
          <Link 
            href="/cart" 
            className="flex items-center text-green-600 hover:text-green-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>Quay lại giỏ hàng</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-6 p-6 bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không có sản phẩm để thanh toán</h2>
              <p className="text-gray-500 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
              <Link 
                href="/cart" 
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Thông tin thanh toán */}
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
              
              {/* Sản phẩm nhóm theo người bán */}
              {sellerGroups.map((group, index) => (
                <div key={group.sellerId} className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center mr-2 text-sm">
                        {index + 1}
                      </span>
                      {group.sellerName}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {group.items.length} sản phẩm
                    </div>
                  </div>
                  
                  <ul className="divide-y divide-gray-100">
                    {group.items.map((item) => (
                      <li key={item.id} className="py-4 flex">
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded flex items-center justify-center overflow-hidden relative mr-4">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.bookTitle}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="text-gray-400">No image</div>
                          )}
                        </div>
                        
                        <div className="flex-grow flex flex-col">
                          <Link href={`/books/${item.bookId}`} className="font-medium text-gray-800 hover:text-green-600 transition-colors line-clamp-2">
                            {item.bookTitle}
                          </Link>
                          <div className="text-sm mt-1">
                            Tình trạng: <span className="font-medium">{item.conditionNumber}/5</span>
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="text-lg font-bold text-green-700">
                            {item.price.toLocaleString('vi-VN')}đ
                          </div>
                          <div className="text-sm text-gray-500">x1</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Phương thức giao hàng cho từng người bán */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
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
                          {(deliveryMethod === 'standard' ? group.shippingFee : group.shippingFee * 2).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ghi chú cho từng người bán */}
                  <div className="mt-4 pt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú cho shop</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      rows={2}
                      placeholder="Nhập ghi chú cho người bán này"
                      value={group.note}
                      onChange={(e) => handleNoteChange(group.sellerId, e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
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
            
            {/* Tổng thanh toán */}
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
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển ({sellerGroups.length} shop)</span>
                    <span className="font-medium">{shippingFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Giảm giá</span>
                      <span className="font-medium">-{discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-100 flex justify-between">
                    <span className="font-semibold">Tổng thanh toán</span>
                    <span className="font-bold text-green-700 text-2xl">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="space-y-4">
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
                        <span className="font-medium">Đặt hàng ({sellerGroups.length} shop)</span>
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

      {/* Modal thêm địa chỉ mới */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <AddressForm 
            onSaveAddress={handleSaveAddress}
            onClose={() => setShowAddressModal(false)}
          />
        </div>
      )}
    </div>
  );
} 