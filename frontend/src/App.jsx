import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import EditProfile from './pages/EditProfile.jsx'
import OtpForm from './components/otpForm.jsx'

function App() {
  const token = useSelector((s) => s.auth.token)

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/edit-profile" element={token ? <EditProfile /> : <Navigate to="/login" replace />}/>
      <Route path="/otp" element={<OtpForm />} />
      
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default App

