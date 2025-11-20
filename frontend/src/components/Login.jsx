import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/authSlice'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector((s) => s.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await dispatch(login({ email, password })).unwrap()
      // on success, navigate to dashboard
      if (res?.token) navigate('/dashboard')
    } catch (err) {
      // error handled by slice
    }
  }

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Logging...' : 'Login'}</button>
        {error && <div className="error">{error}</div>}
        {token && <div className="success">Logged in</div>}
        <div style={{marginTop:10}}>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </div>
      </form>
    </div>
  )
}
