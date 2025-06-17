'use client';

import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { toastService } from '@/services/toastService';
import { addressService } from '@/services/addressService';
import { AddressType, Province, District, Ward, NewAddressForm, LocationState } from '@/types/address';
import { authService } from '@/services/authService';

interface AddressFormProps {
  onSaveAddress: (address: AddressType) => void;
  onClose: () => void;
  editAddress?: AddressType;
  isEdit?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSaveAddress, onClose, editAddress, isEdit = false }) => {
  // Form state
  const [form, setForm] = useState<NewAddressForm>({
    fullName: '',
    phone: '',
    address: '',
    defaultAddress: false
  });

  // Location state
  const [locationState, setLocationState] = useState<LocationState>({
    provinces: [],
    districts: [],
    wards: [],
    selectedProvince: null,
    selectedDistrict: null,
    selectedWard: null,
    loading: {
      provinces: false,
      districts: false,
      wards: false
    }
  });

  // Fetch tỉnh/thành phố khi component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Nếu đang chỉnh sửa, điền thông tin địa chỉ
  useEffect(() => {
    if (isEdit && editAddress) {
      setForm({
        fullName: editAddress.fullName,
        phone: editAddress.phoneNumber,
        address: editAddress.addressDetail,
        defaultAddress: editAddress.defaultAddress
      });
      
      // Tìm và chọn tỉnh/thành phố
      fetchProvinces().then(() => {
        // Tìm province theo tên
        const province = locationState.provinces.find(p => p.name === editAddress.province);
        if (province) {
          setLocationState(prev => ({ ...prev, selectedProvince: province.code }));
          fetchDistricts(province.code).then(() => {
            // Tìm district theo tên
            const district = locationState.districts.find(d => d.name === editAddress.district);
            if (district) {
              setLocationState(prev => ({ ...prev, selectedDistrict: district.code }));
              fetchWards(district.code).then(() => {
                // Tìm ward theo tên
                const ward = locationState.wards.find(w => w.name === editAddress.ward);
                if (ward) {
                  setLocationState(prev => ({ ...prev, selectedWard: ward.code }));
                }
              });
            }
          });
        }
      });
    }
  }, [isEdit, editAddress]);

  // Fetch danh sách tỉnh/thành phố
  const fetchProvinces = async () => {
    try {
      setLocationState(prev => ({
        ...prev,
        loading: { ...prev.loading, provinces: true }
      }));
      
      const provinces = await addressService.getProvinces();
      
      setLocationState(prev => ({
        ...prev,
        provinces,
        loading: { ...prev.loading, provinces: false }
      }));
      
      return provinces;
    } catch (error) {
      toastService.error('Không thể tải danh sách tỉnh thành');
      setLocationState(prev => ({
        ...prev,
        loading: { ...prev.loading, provinces: false }
      }));
      return [];
    }
  };

  // Fetch danh sách quận/huyện khi chọn tỉnh/thành phố
  const fetchDistricts = async (provinceCode: number) => {
    try {
      setLocationState(prev => ({
        ...prev,
        districts: [],
        wards: [],
        selectedDistrict: null,
        selectedWard: null,
        loading: { ...prev.loading, districts: true }
      }));
      
      const districts = await addressService.getDistricts(provinceCode);
      
      setLocationState(prev => ({
        ...prev,
        districts,
        loading: { ...prev.loading, districts: false }
      }));
      
      return districts;
    } catch (error) {
      toastService.error('Không thể tải danh sách quận huyện');
      setLocationState(prev => ({
        ...prev,
        loading: { ...prev.loading, districts: false }
      }));
      return [];
    }
  };

  // Fetch danh sách phường/xã khi chọn quận/huyện
  const fetchWards = async (districtCode: number) => {
    try {
      setLocationState(prev => ({
        ...prev,
        wards: [],
        selectedWard: null,
        loading: { ...prev.loading, wards: true }
      }));
      
      const wards = await addressService.getWards(districtCode);
      
      setLocationState(prev => ({
        ...prev,
        wards,
        loading: { ...prev.loading, wards: false }
      }));
      
      return wards;
    } catch (error) {
      toastService.error('Không thể tải danh sách phường xã');
      setLocationState(prev => ({
        ...prev,
        loading: { ...prev.loading, wards: false }
      }));
      return [];
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Xử lý khi chọn tỉnh/thành phố
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = parseInt(e.target.value);
    setLocationState(prev => ({
      ...prev,
      selectedProvince: provinceCode
    }));
    
    if (provinceCode) {
      fetchDistricts(provinceCode);
    }
  };

  // Xử lý khi chọn quận/huyện
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = parseInt(e.target.value);
    setLocationState(prev => ({
      ...prev,
      selectedDistrict: districtCode
    }));
    
    if (districtCode) {
      fetchWards(districtCode);
    }
  };

  // Xử lý khi chọn phường/xã
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocationState(prev => ({
      ...prev,
      selectedWard: parseInt(e.target.value)
    }));
  };

  // Xử lý lưu địa chỉ mới
  const handleSaveAddress = () => {
    // Kiểm tra dữ liệu nhập
    if (!form.fullName.trim()) {
      toastService.error('Vui lòng nhập họ tên');
      return;
    }
    if (!form.phone.trim()) {
      toastService.error('Vui lòng nhập số điện thoại');
      return;
    }
    if (!locationState.selectedProvince) {
      toastService.error('Vui lòng chọn tỉnh/thành phố');
      return;
    }
    if (!locationState.selectedDistrict) {
      toastService.error('Vui lòng chọn quận/huyện');
      return;
    }
    if (!locationState.selectedWard) {
      toastService.error('Vui lòng chọn phường/xã');
      return;
    }
    if (!form.address.trim()) {
      toastService.error('Vui lòng nhập địa chỉ chi tiết');
      return;
    }

    // Tìm tên các địa điểm đã chọn
    const province = locationState.provinces.find(p => p.code === locationState.selectedProvince);
    const district = locationState.districts.find(d => d.code === locationState.selectedDistrict);
    const ward = locationState.wards.find(w => w.code === locationState.selectedWard);

    if (!province || !district || !ward) {
      toastService.error('Có lỗi xảy ra khi xác định địa chỉ');
      return;
    }

    // Lấy thông tin user hiện tại
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      toastService.error('Vui lòng đăng nhập để thêm địa chỉ');
      return;
    }

    // Tạo địa chỉ mới theo định dạng backend API yêu cầu
    const addressData: AddressType = {
      id: isEdit && editAddress ? editAddress.id : 0, // Giữ nguyên ID nếu đang chỉnh sửa
      userId: Number(currentUser.id),
      fullName: form.fullName,
      phoneNumber: form.phone,
      province: province.name,
      district: district.name,
      ward: ward.name,
      addressDetail: form.address,
      defaultAddress: form.defaultAddress
    };

    // Gọi callback để lưu địa chỉ
    onSaveAddress(addressData);
  };

  return (
    <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">{isEdit ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input 
            type="text" 
            name="fullName"
            value={form.fullName}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input 
            type="text" 
            name="phone"
            value={form.phone}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
            <div className="relative">
              <select 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={locationState.selectedProvince || ''}
                onChange={handleProvinceChange}
                disabled={locationState.loading.provinces}
              >
                <option value="">Chọn Tỉnh/TP</option>
                {locationState.provinces.map(province => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
              {locationState.loading.provinces && (
                <div className="absolute right-2 top-2">
                  <FaSpinner className="animate-spin text-green-500" />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
            <div className="relative">
              <select 
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={locationState.selectedDistrict || ''}
                onChange={handleDistrictChange}
                disabled={!locationState.selectedProvince || locationState.loading.districts}
              >
                <option value="">Chọn Quận/Huyện</option>
                {locationState.districts.map(district => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
              {locationState.loading.districts && (
                <div className="absolute right-2 top-2">
                  <FaSpinner className="animate-spin text-green-500" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
          <div className="relative">
            <select 
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={locationState.selectedWard || ''}
              onChange={handleWardChange}
              disabled={!locationState.selectedDistrict || locationState.loading.wards}
            >
              <option value="">Chọn Phường/Xã</option>
              {locationState.wards.map(ward => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
            {locationState.loading.wards && (
              <div className="absolute right-2 top-2">
                <FaSpinner className="animate-spin text-green-500" />
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
          <input 
            type="text" 
            name="address"
            value={form.address}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Số nhà, tên đường, tòa nhà, v.v."
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="default-address"
            name="defaultAddress"
            checked={form.defaultAddress}
            onChange={handleInputChange}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-2"
          />
          <label htmlFor="default-address" className="text-sm text-gray-700">
            Đặt làm địa chỉ mặc định
          </label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            type="button"
            onClick={handleSaveAddress}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {isEdit ? 'Cập nhật' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;