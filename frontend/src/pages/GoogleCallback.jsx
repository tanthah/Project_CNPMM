// frontend/src/pages/GoogleCallback.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../redux/authSlice'
import { Container, Spinner, Alert } from 'react-bootstrap'
import api from '../api/axios'

export default function GoogleCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [error, setError] = useState(null)

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token')
            const userId = searchParams.get('userId')
            const errorParam = searchParams.get('error')

            if (errorParam) {
                setError('Đăng nhập Google thất bại. Vui lòng thử lại.')
                setTimeout(() => navigate('/login'), 3000)
                return
            }

            if (!token || !userId) {
                setError('Không nhận được thông tin đăng nhập.')
                setTimeout(() => navigate('/login'), 3000)
                return
            }

            try {
                // Lấy thông tin user từ server
                const response = await api.get(`/auth/google/user/${userId}`)

                if (response.data.success) {
                    const user = response.data.user

                    // Lưu vào Redux và localStorage
                    dispatch(setCredentials({ token, user }))
                    localStorage.setItem('token', token)
                    localStorage.setItem('user', JSON.stringify(user))

                    // Điều hướng theo role
                    if (user.role === 'admin') {
                        navigate('/admin/dashboard')
                    } else {
                        navigate('/dashboard')
                    }
                } else {
                    setError('Không thể lấy thông tin người dùng.')
                    setTimeout(() => navigate('/login'), 3000)
                }
            } catch (err) {
                console.error('Google callback error:', err)
                setError('Có lỗi xảy ra. Vui lòng thử lại.')
                setTimeout(() => navigate('/login'), 3000)
            }
        }

        handleCallback()
    }, [searchParams, navigate, dispatch])

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <div className="text-center">
                {error ? (
                    <Alert variant="danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                ) : (
                    <>
                        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                        <p className="mt-3 text-muted">Đang xử lý đăng nhập Google...</p>
                    </>
                )}
            </div>
        </Container>
    )
}
