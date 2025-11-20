import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const token = useSelector((s) => s.auth.token)

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default App
