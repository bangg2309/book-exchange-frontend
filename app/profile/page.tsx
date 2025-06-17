'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaEdit } from 'react-icons/fa';
import { authService } from '@/services/authService';
import { toastService } from '@/services/toastService';
import { userService } from '@/services/userService';
import { cloudinaryService } from '@/services/cloudinaryService';
import { User } from '@/types/user';

export default function ProfilePage() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<{
    fullName: string;
    email: string;
    phone: string;
    avatar: string | null;
  }>({
    fullName: '',
    email: '',
    phone: '',
    avatar: null
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch user information
  useEffect(() => {
    // Check if logged in
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user profile from API
        const userProfile = await userService.getMyInfo();
        setUser(userProfile);
        
        // Initialize edited profile with current values
        setEditedProfile({
          fullName: userProfile.fullName || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          avatar: userProfile.avatar
        });
      } catch (error) {
        console.error('Không thể tải thông tin người dùng:', error);
        toastService.error('Không thể tải thông tin người dùng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Xử lý chỉnh sửa thông tin cá nhân
  const handleEditProfile = () => {
    if (user) {
      setEditedProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar
      });
      setIsEditingProfile(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setAvatarFile(null);
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Kiểm tra kích thước file
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toastService.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      
      // Kiểm tra loại file
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toastService.error('Chỉ chấp nhận file ảnh định dạng JPG, PNG');
        return;
      }
      
      setAvatarFile(file);
      
      // Preview avatar
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // Tạo một đối tượng Image để kiểm tra kích thước
          const img = document.createElement('img');
          img.onload = function() {
            setEditedProfile(prev => ({
              ...prev,
              avatar: event.target?.result as string
            }));
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsUpdatingProfile(true);
      
      let avatarUrl = user.avatar || undefined;
      
      // Upload avatar if changed
      if (avatarFile) {
        const uploadResult = await cloudinaryService.uploadImage(avatarFile, 'book-exchange/avatars');
        if (uploadResult) {
          avatarUrl = uploadResult.secureUrl;
        } else {
          toastService.error('Không thể tải lên ảnh đại diện');
          setIsUpdatingProfile(false);
          return;
        }
      }
      
      // Update user profile using the new API endpoint
      const updatedUser = await userService.updateProfile({
        fullName: editedProfile.fullName,
        email: editedProfile.email,
        phone: editedProfile.phone,
        avatar: avatarUrl
      });
      
      // Update local state
      setUser(updatedUser);
      setIsEditingProfile(false);
      setAvatarFile(null);
      
      toastService.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      toastService.error('Không thể cập nhật thông tin người dùng');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold">Hồ sơ của tôi</h2>
        <p className="text-sm text-gray-500">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>
      
      {isLoading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p>Đang tải thông tin...</p>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 md:border-r md:border-gray-100 md:pr-8">
              {isEditingProfile ? (
                // Form chỉnh sửa thông tin
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-3 items-center">
                    <label className="text-right pr-4 text-gray-500">Tên đăng nhập:</label>
                    <div className="col-span-2">{user?.username || "N/A"}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <label htmlFor="fullName" className="text-right pr-4 text-gray-500">Họ và tên:</label>
                    <div className="col-span-2">
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={editedProfile.fullName}
                        onChange={handleProfileInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <label htmlFor="email" className="text-right pr-4 text-gray-500">Email:</label>
                    <div className="col-span-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={editedProfile.email || ''}
                        onChange={handleProfileInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <label htmlFor="phone" className="text-right pr-4 text-gray-500">Số điện thoại:</label>
                    <div className="col-span-2">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={editedProfile.phone || ''}
                        onChange={handleProfileInputChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <label className="text-right pr-4 text-gray-500">Ngày tham gia:</label>
                    <div className="col-span-2">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <div className="col-span-2 col-start-2 flex space-x-3">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isUpdatingProfile}
                        className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition disabled:bg-gray-400"
                      >
                        {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        disabled={isUpdatingProfile}
                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition disabled:bg-gray-200"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Hiển thị thông tin
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-3 items-center">
                    <label className="text-right pr-4 text-gray-500">Tên đăng nhập:</label>
                    <div className="col-span-2">{user?.username || "N/A"}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <label className="text-right pr-4 text-gray-500">Họ và tên:</label>
                    <div className="col-span-2">{user?.fullName || "Chưa cập nhật"}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <label className="text-right pr-4 text-gray-500">Email:</label>
                    <div className="col-span-2">{user?.email || "Chưa cập nhật"}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <label className="text-right pr-4 text-gray-500">Số điện thoại:</label>
                    <div className="col-span-2">{user?.phone || "Chưa cập nhật"}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <label className="text-right pr-4 text-gray-500">Ngày tham gia:</label>
                    <div className="col-span-2">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 items-center">
                    <div className="col-span-2 col-start-2">
                      <button 
                        onClick={handleEditProfile}
                        className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
                      >
                        Sửa hồ sơ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="md:w-1/3 md:pl-8 mt-8 md:mt-0 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl border-4 border-white shadow-lg overflow-hidden mb-4">
                {isEditingProfile ? (
                  editedProfile.avatar ? (
                    <div className="relative w-full h-full">
                      <div className="w-full h-full">
                        <img 
                          src={editedProfile.avatar} 
                          alt={user?.username || ''} 
                          className="w-full h-full object-cover"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaEdit className="text-white text-2xl" />
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaEdit className="text-gray-400 text-2xl" />
                    </div>
                  )
                ) : (
                  user?.avatar ? (
                    <div className="w-full h-full">
                      <Image 
                        src={user.avatar} 
                        alt={user.username} 
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <span className="font-medium">{user?.username?.substring(0, 2).toUpperCase() || "AV"}</span>
                  )
                )}
              </div>
              
              {isEditingProfile ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
                  >
                    Chọn ảnh
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleEditProfile}
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
                >
                  Thay đổi ảnh
                </button>
              )}
              
              <p className="text-gray-500 text-xs mt-2 text-center">
                Dụng lượng file tối đa 5 MB<br />
                Định dạng: .JPEG, .PNG
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}