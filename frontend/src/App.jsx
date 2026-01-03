// frontend/src/App.jsx - UPDATED WITH NOTIFICATIONS & CHATBOT
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './App.css'
import ScrollToTop from "./components/ScrollToTop";
import { SocketProvider } from './contexts/SocketContext';
import ChatWidget from './components/ChatWidget';
import ToastNotification from './components/ToastNotification';

// Public Pages
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import GoogleCallback from './pages/GoogleCallback.jsx'
import ReviewProfile from './pages/ReviewProfile.jsx'
import EditProfile from './pages/EditProfile.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Products from './pages/Products.jsx'
import CategoryProducts from './pages/CategoryProducts.jsx'
import About from './pages/About.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Orders from './pages/Orders.jsx'
import OrderDetail from './pages/OrderDetail.jsx'
import Reviews from './pages/Reviews'
import Wishlist from './pages/Wishlist'
import LoyaltyPoints from './pages/LoyaltyPoints'
import ViewedProducts from './pages/ViewedProducts.jsx'
import SearchResults from './pages/SearchResults.jsx'
import CustomerSupport from './pages/CustomerSupport.jsx'


// ✅ PROTECTED ROUTE COMPONENT
function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useSelector((s) => s.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { token, user } = useSelector((s) => s.auth)
  const isAdmin = user?.role === 'admin'

  return (
    <SocketProvider>
      <>
        <ScrollToTop />
        <Routes>
          {/* ========================================
              PUBLIC ROUTES
          ======================================== */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/category/:categoryId" element={<CategoryProducts />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Customer Support Pages */}
          <Route path="/contact" element={<CustomerSupport />} />
          <Route path="/shipping" element={<CustomerSupport />} />
          <Route path="/warranty" element={<CustomerSupport />} />
          <Route path="/return" element={<CustomerSupport />} />
          <Route path="/payment" element={<CustomerSupport />} />

          {/* ========================================
              PROTECTED CUSTOMER ROUTES
          ======================================== */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />

          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />

          <Route path="/orders/:orderId" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />

          <Route path="/review-profile" element={
            <ProtectedRoute>
              <ReviewProfile />
            </ProtectedRoute>
          } />

          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />

          <Route path="/reviews" element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          } />

          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />

          <Route path="/viewed" element={
            <ProtectedRoute>
              <ViewedProducts />
            </ProtectedRoute>
          } />

          <Route path="/loyalty" element={
            <ProtectedRoute>
              <LoyaltyPoints />
            </ProtectedRoute>
          } />

          {/* ========================================
              FALLBACK ROUTE
          ======================================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* FAQ Chatbot - Hiển thị trên mọi trang */}
        <ChatWidget />

        {/* Realtime Toast Notifications */}
        <ToastNotification />
      </>
    </SocketProvider>
  )
}

export default App
