# TV Shop - E-commerce

Trang web bán hàng trực tuyến TV Shop (Khách hàng).

## 🚀 Công Nghệ Sử Dụng

### Frontend (`/frontend`)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Library**: [React 19](https://react.dev/)
*   **Styling**: Bootstrap 5, React Bootstrap
*   **State Management**: Redux Toolkit
*   **Router**: React Router DOM 7
*   **Real-time**: Socket.io Client

### Backend (`/backend`)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB
*   **Authentication**: JWT, Google OAuth2, Nodemailer (OTP)
*   **Real-time**: Socket.io

## 🛠️ Cài Đặt & Chạy Dự Án

### Yêu cầu tiên quyết
*   Node.js
*   MongoDB

### 1. Khởi chạy Backend (Port 5000)

```bash
cd backend
npm install

# Tạo file .env
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/UTE_Shop
# CLOUDINARY_...

# Chạy server
npm run dev
```

### 2. Khởi chạy Frontend (Default Vite Port)

```bash
cd frontend
npm install

# Chạy server development
npm run dev
```

## ✨ Tính Năng Chính
*   **Trang chủ**: Banner, sản phẩm nổi bật, danh mục.
*   **Sản phẩm**: Xem chi tiết, đánh giá, bình luận.
*   **Giỏ hàng & Thanh toán**: Thêm vào giỏ, checkout, áp dụng mã giảm giá.
*   **Tài khoản**: Đăng ký/Đăng nhập (Email, Google), Quên mật khẩu (OTP), Lịch sử đơn hàng, Hồ sơ cá nhân.
*   **Chat**: Nhắn tin trực tiếp với Admin để được hỗ trợ.
