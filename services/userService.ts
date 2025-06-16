import api from './api';
import { ApiResponse } from '@/types/apiResponse';
import { User, UserPage, Role, CreateUserRequest, UpdateProfileRequest } from '@/types/user';
import { toastService } from '@/services/toastService';
import axios, { AxiosError } from 'axios';

// Helper for consistent error handling
const handleApiError = (error: any, defaultMessage: string, context: string = ''): never => {
  if (error.response && error.response.data) {
    const errorData = error.response.data;
    const errorMessage = errorData.message || defaultMessage;
    
    console.error(`Backend error ${context}:`, errorMessage, 'Code:', errorData.code);
    throw new Error(errorMessage);
  }
  
  console.error(`Error ${context}:`, error);
  throw error;
};

// Helper for consistent response handling
const processApiResponse = <T>(response: ApiResponse<T> | undefined, errorMessage: string): T => {
  if (!response || !response.result) {
    throw new Error(errorMessage);
  }
  return response.result;
};

export const userService = {
  getMyInfo: async (): Promise<User> => {
    try {
      console.log('[getMyInfo] Fetching user profile information');
      const { data } = await api.get<ApiResponse<User>>('/users/my-info');
      console.log('[getMyInfo] Response:', data);
      return processApiResponse(data, 'Invalid user profile response from server');
    } catch (error: any) {
      console.error('[getMyInfo] Error:', error.response?.data || error.message);
      return handleApiError(error, 'An error occurred while fetching user profile', 'fetching user profile');
    }
  },
  
  updateProfile: async (profileData: UpdateProfileRequest): Promise<User> => {
    try {
      console.log('[updateProfile] Updating user profile with data:', profileData);
      const { data } = await api.put<ApiResponse<User>>('/users/update-profile', profileData);
      console.log('[updateProfile] Response:', data);
      return processApiResponse(data, 'Invalid response when updating user profile');
    } catch (error: any) {
      console.error('[updateProfile] Error:', error.response?.data || error.message);
      return handleApiError(error, 'An error occurred while updating user profile', 'updating user profile');
    }
  },

  getUsers: async (page: number = 0, size: number = 5): Promise<UserPage> => {
    try {
      const { data } = await api.get<ApiResponse<UserPage>>(`/users?page=${page}&size=${size}`);
      return processApiResponse(data, 'Invalid users response from server');
    } catch (error: any) {
      return handleApiError(error, 'An error occurred while fetching users', 'fetching users');
    }
  },
  
  getUserById: async (id: string): Promise<User> => {
    try {
      const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
      return processApiResponse(data, `Invalid user response for ID ${id}`);
    } catch (error: any) {
      return handleApiError(error, `An error occurred while fetching user ${id}`, `fetching user ${id}`);
    }
  },
  
  createUser: async (userData: Partial<CreateUserRequest>): Promise<User> => {
    try {
      // Đảm bảo dữ liệu gửi đi đúng định dạng mà API yêu cầu
      const formattedData: any = {
        username: userData.username || "",
        email: userData.email || null,
        avatar: userData.avatar || "",
        phone: userData.phone || null,
        status: userData.status !== undefined ? userData.status : 1
      };
      
      // Thêm mật khẩu (bắt buộc cho tạo mới)
      if (userData.password) {
        formattedData.password = userData.password;
      }
      
      // Chuyển đổi vai trò thành mảng chuỗi
      if (userData.roles && Array.isArray(userData.roles)) {
        formattedData.roles = userData.roles.map((role: any) => 
          typeof role === 'string' ? role : role.name
        );
      } else {
        formattedData.roles = [];
      }
      
      console.log(`[createUser] Calling POST to /users with data:`, formattedData);
      
      const { data } = await api.post<ApiResponse<User>>('/users', formattedData);
      
      console.log(`[createUser] Response:`, data);
      
      return processApiResponse(data, 'Invalid response when creating user');
    } catch (error: any) {
      console.error(`[createUser] Error:`, error.response?.data || error.message);
      return handleApiError(error, 'An error occurred while creating the user', 'creating user');
    }
  },
  
  updateUser: async (id: string, userData: Partial<User> & { password?: string }): Promise<User> => {
    try {
      // Đảm bảo dữ liệu gửi đi đúng định dạng mà API yêu cầu
      const formattedData: any = {
        email: userData.email || null,
        avatar: userData.avatar || "",
        phone: userData.phone || null,
        status: userData.status !== undefined ? userData.status : 1
      };
      
      // Chỉ gửi mật khẩu nếu không rỗng
      if (userData.password && userData.password.trim() !== "") {
        formattedData.password = userData.password;
      }
      
      // Chuyển đổi vai trò thành mảng chuỗi
      if (userData.roles && Array.isArray(userData.roles)) {
        formattedData.roles = userData.roles.map((role: any) => 
          typeof role === 'string' ? role : role.name
        );
      } else {
        formattedData.roles = [];
      }
      
      console.log(`[updateUser] Calling PUT to /users/${id} with data:`, formattedData);
      
      const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, formattedData);
      
      console.log(`[updateUser] Response:`, data);
      
      return processApiResponse(data, `Invalid response when updating user ${id}`);
    } catch (error: any) {
      console.error(`[updateUser] Error:`, error.response?.data || error.message);
      return handleApiError(error, `An error occurred while updating user ${id}`, `updating user ${id}`);
    }
  },
  
  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      handleApiError(error, `An error occurred while deleting user ${id}`, `deleting user ${id}`);
    }
  },
  
  getRoles: async (): Promise<Role[]> => {
    try {
      const { data } = await api.get<ApiResponse<Role[]>>('/roles');
      
      if (!data || !data.result) {
        return getDefaultRoles();
      }
      
      return data.result;
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || 'Failed to fetch roles';
        console.error('Backend error fetching roles:', errorMessage, 'Code:', errorData.code);
      } else {
        console.error('Error fetching roles:', error);
      }
      
      // For roles, we return defaults instead of throwing
      return getDefaultRoles();
    }
  },

  /**
   * Change user password
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      console.log('[changePassword] Sending request to change password');
      
      const { data } = await api.put<ApiResponse<void>>('/users/change-password', {
        oldPassword,
        newPassword
      });
      
      console.log('[changePassword] Response:', data);
      
      if (data.code === 1000) {
        toastService.success('Đổi mật khẩu thành công');
        return true;
      }
      
      toastService.error(data.message || 'Không thể đổi mật khẩu');
      return false;
    } catch (error: any) {
      console.error('[changePassword] Error:', error.response?.data || error.message);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        toastService.error(axiosError.response?.data?.message || 'Không thể đổi mật khẩu');
      } else {
        toastService.error('Không thể đổi mật khẩu');
      }
      return false;
    }
  }
};

// Default roles utility
const getDefaultRoles = (): Role[] => [
  { name: 'ADMIN', description: 'Quản trị viên', permissions: [] },
  { name: 'USER', description: 'Người dùng', permissions: [] }
]; 