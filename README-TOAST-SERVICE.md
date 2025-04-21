# Hướng dẫn sử dụng Toast Service

Tài liệu này hướng dẫn cách sử dụng hệ thống thông báo Toast trong ứng dụng thông qua `toastService`.

## Cách hoạt động

Hệ thống Toast được thiết kế để hoạt động như một service toàn cục, có thể được gọi từ bất kỳ đâu trong ứng dụng (cả trong component và service). Nó sử dụng cơ chế Event để giao tiếp giữa service và UI component.

## Cấu trúc hệ thống

1. **Toast Component (`components/Toast.tsx`)**: Hiển thị thông báo toast trên giao diện người dùng.
2. **Toast Service (`services/toastService.ts`)**: Service để gửi thông báo toast từ bất kỳ đâu trong ứng dụng.

## Cách sử dụng

### 1. Trong Component

```tsx
import { toastService } from '@/services/toastService';

function MyComponent() {
  const handleButtonClick = () => {
    // Hiển thị toast thành công
    toastService.success('Thao tác thành công!');
  };
  
  const handleErrorCase = () => {
    // Hiển thị toast lỗi
    toastService.error('Đã xảy ra lỗi!');
  };
  
  return (
    <div>
      <button onClick={handleButtonClick}>Hiển thị Toast thành công</button>
      <button onClick={handleErrorCase}>Hiển thị Toast lỗi</button>
    </div>
  );
}
```

### 2. Trong Service

```ts
import { toastService } from './toastService';

export const myService = {
  someAction: async () => {
    try {
      // Thực hiện một hành động nào đó
      const result = await api.post('/some-endpoint', data);
      
      // Hiển thị toast thành công
      toastService.success('Thao tác thành công!');
      
      return result;
    } catch (error) {
      // Hiển thị toast lỗi
      toastService.error(error.message || 'Đã xảy ra lỗi!');
      throw error;
    }
  }
};
```

### 3. Trong AuthService

AuthService đã được tích hợp sẵn với toastService để hiển thị thông báo trong các tác vụ:

- Đăng nhập (login)
- Đăng ký (register)
- Đăng xuất (logout)
- Đăng nhập bằng mạng xã hội (socialLogin)
- Refresh token

## Các loại thông báo

toastService hỗ trợ 4 loại thông báo:

1. **Success**: `toastService.success(message)`
   - Nền màu xanh lá
   - Dùng cho các thông báo thành công

2. **Error**: `toastService.error(message)`
   - Nền màu đỏ
   - Dùng cho các thông báo lỗi

3. **Info**: `toastService.info(message)`
   - Nền màu xanh dương
   - Dùng cho các thông báo thông tin

4. **Warning**: `toastService.warning(message)`
   - Nền màu vàng
   - Dùng cho các cảnh báo

## Ưu điểm của thiết kế này

1. **Tập trung**: Tất cả logic hiển thị thông báo nằm ở một nơi duy nhất.
2. **Dễ sử dụng**: Không cần truyền props hoặc context qua nhiều cấp component.
3. **Tách biệt**: UI và logic nghiệp vụ được tách biệt nhau.
4. **Linh hoạt**: Có thể gọi từ bất kỳ đâu, kể cả trong service hay utility function.

## Lưu ý

- Thông báo toast tự động biến mất sau 5 giây.
- Người dùng có thể đóng toast thủ công bằng nút X.
- Toast chỉ hiển thị ở phía client và cần "use client" directive.
- ToastContainer đã được đặt trong layout.tsx nên không cần thêm lại vào component khác. 