import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../api/axios'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await axios.post('/auth/register', { name, email, password })
      setSuccess('Đăng ký thành công!')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Đăng ký</h2>
        <label>
          Tên
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Mật khẩu
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <div style={{marginTop:10}}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </form>
    </div>
  )
}
