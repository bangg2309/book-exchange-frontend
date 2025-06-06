import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { User, Role } from '@/types/user';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userData: Partial<User> & { password?: string }) => Promise<void>;
  availableRoles: Role[];
}

export default function UserFormModal({ isOpen, onClose, user, onSave, availableRoles }: UserFormModalProps) {
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
    username: '',
    email: '',
    avatar: null,
    phone: null,
    status: 1,
    roles: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const isNewUser = !user;

  useEffect(() => {
    console.log("[UserFormModal] user prop changed:", user);
    console.log("[UserFormModal] isNewUser:", isNewUser);
    
    if (user) {
      console.log("[UserFormModal] Setting up form for existing user with ID:", user.id);
      setFormData({
        id: user.id,
        email: user.email || '',
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        roles: user.roles,
        password: '',
      });
      setSelectedRoles(user.roles.map(role => role.name));
    } else {
      console.log("[UserFormModal] Setting up form for new user");
      setFormData({
        id: null,
        username: '',
        email: '',
        password: '',
        avatar: null,
        phone: null,
        status: 1,
        roles: [],
      });
      setSelectedRoles([]);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? parseInt(value, 10) : value
    }));
  };

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleName)) {
        return prev.filter(r => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      let userData: any = { 
        ...formData,
        roles: selectedRoles,
      };
      
      if (!isNewUser && user) {
        userData.id = user.id;
        userData.username = user.username;
      }
      
      console.log("[handleSubmit] Final userData to save:", userData);
      console.log("[handleSubmit] isNewUser:", isNewUser);
      console.log("[handleSubmit] Original user:", user);
      
      await onSave(userData);
      
      onClose();
    } catch (err: any) {
      console.error('Error saving user:', err);
      
      setError(err.message || 'Không thể lưu thông tin người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={isNewUser ? formData.username : (user?.username || '')}
                onChange={handleChange}
                required
                disabled={!isNewUser}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${!isNewUser ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
              />
              {!isNewUser && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Tên đăng nhập không thể thay đổi sau khi tạo
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Chưa xác thực</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isNewUser ? 'Mật khẩu' : 'Mật khẩu (để trống nếu không thay đổi)'}
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  required={isNewUser}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vai trò
              </label>
              <div className="space-y-2 border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto dark:border-gray-600">
                {availableRoles.map(role => (
                  <div key={role.name} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-${role.name}`}
                      checked={selectedRoles.includes(role.name)}
                      onChange={() => handleRoleToggle(role.name)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600"
                    />
                    <label
                      htmlFor={`role-${role.name}`}
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      {role.name}
                      {role.description && ` (${role.description})`}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 