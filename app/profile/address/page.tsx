'use client';

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaPlus } from 'react-icons/fa';
import { toastService } from '@/services/toastService';
import { shippingAddressService } from '@/services/shippingAddressService';
import { AddressType } from '@/types/address';
import AddressForm from '@/components/checkout/AddressForm';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAddress: (address: AddressType) => void;
  editAddress?: AddressType;
  isEdit?: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaveAddress,
  editAddress,
  isEdit = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <AddressForm 
        onSaveAddress={onSaveAddress}
        onClose={onClose}
        editAddress={editAddress}
        isEdit={isEdit}
      />
    </div>
  );
};

export default function AddressPage() {
  // State
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [currentEditAddress, setCurrentEditAddress] = useState<AddressType | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Fetch user addresses
  useEffect(() => {
    fetchUserAddresses();
  }, []);

  const fetchUserAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const userAddresses = await shippingAddressService.getAddresses();
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      toastService.error('Không thể tải danh sách địa chỉ');
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Handler functions
  // Handle saving address (create or update)
  const handleAddressModalSave = async (addressData: AddressType) => {
    try {
      if (isEditMode && addressData.id) {
        // Update existing address
        await shippingAddressService.updateAddress(addressData.id, addressData);
      } else {
        // Create new address
        await shippingAddressService.createAddress(addressData);
      }
      
      // Refresh addresses list
      fetchUserAddresses();
      setShowAddressModal(false);
      setCurrentEditAddress(undefined);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  // Handle edit address
  const handleEditAddress = (address: AddressType) => {
    setCurrentEditAddress(address);
    setIsEditMode(true);
    setShowAddressModal(true);
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await shippingAddressService.deleteAddress(addressId);
        fetchUserAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  // Handle set default address
  const handleSetDefaultAddress = async (addressId: number) => {
    try {
      await shippingAddressService.setDefaultAddress(addressId);
      fetchUserAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Địa chỉ của tôi</h2>
          <p className="text-sm text-gray-500">Quản lý địa chỉ giao hàng</p>
        </div>
        <button
          onClick={() => {
            setIsEditMode(false);
            setCurrentEditAddress(undefined);
            setShowAddressModal(true);
          }}
          className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaPlus size={14} />
          <span>Thêm địa chỉ mới</span>
        </button>
      </div>
      
      <div className="p-6">
        {isLoadingAddresses ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-green-500 text-2xl" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
            <button 
              onClick={() => {
                setIsEditMode(false);
                setCurrentEditAddress(undefined);
                setShowAddressModal(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Thêm địa chỉ mới
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div 
                key={address.id}
                className={`border ${address.defaultAddress ? 'border-green-500' : 'border-gray-200'} rounded-lg p-4 relative`}
              >
                {address.defaultAddress && (
                  <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Mặc định
                  </span>
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{address.fullName}</h4>
                  <span className="text-gray-600">{address.phoneNumber}</span>
                </div>
                
                <p className="text-gray-700 mb-3">
                  {address.addressDetail}, {address.ward}, {address.district}, {address.province}
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Chỉnh sửa
                  </button>
                  
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Xóa
                  </button>
                  
                  {!address.defaultAddress && (
                    <button
                      onClick={() => handleSetDefaultAddress(address.id)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Modal */}
      <AddressModal 
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setCurrentEditAddress(undefined);
          setIsEditMode(false);
        }}
        onSaveAddress={handleAddressModalSave}
        editAddress={currentEditAddress}
        isEdit={isEditMode}
      />
    </div>
  );
} 