import { Province, District, Ward } from '@/types/address';

// API URL từ provinces.open-api.vn
const API_BASE_URL = 'https://provinces.open-api.vn/api';

// Service xử lý các API liên quan đến địa chỉ Việt Nam
export const addressService = {
  // Lấy danh sách tỉnh/thành phố
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/`);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  // Lấy danh sách quận/huyện theo mã tỉnh/thành phố
  async getDistricts(provinceCode: number): Promise<District[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      const data = await response.json();
      return data.districts || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },

  // Lấy danh sách phường/xã theo mã quận/huyện
  async getWards(districtCode: number): Promise<Ward[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch wards');
      }
      const data = await response.json();
      return data.wards || [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  },
  
  // Lấy thông tin đầy đủ (nếu cần)
  async getFullData(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/?depth=3`);
      if (!response.ok) {
        throw new Error('Failed to fetch full data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching full data:', error);
      throw error;
    }
  }
};