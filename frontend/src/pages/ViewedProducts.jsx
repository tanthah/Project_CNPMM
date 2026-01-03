import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import viewedProductApi from '../api/viewedProductApi'
import { useNotification } from '../components/NotificationProvider'

export default function ViewedProducts() {
  const { token } = useSelector((s) => s.auth)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const notify = useNotification()

  const loadViewed = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await viewedProductApi.getViewedProducts(40)
      setProducts(res.data.products || [])
    } catch (e) {
      setError('Không tải được lịch sử đã xem')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    setLoading(true)
    setError('')
    try {
      await viewedProductApi.clearViewedHistory()
      setProducts([])
    } catch (e) {
      setError('Không thể xóa lịch sử đã xem')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await viewedProductApi.removeFromViewed(productId);
      setProducts(prev => prev.filter(p => p._id !== productId))
    } catch (err) {
      notify.error(err);
    }
  }

  useEffect(() => {
    loadViewed()
  }, [token])

  if (loading) {
      return (
        <>
          <Header />
          <Container className="py-5 text-center">
            <Spinner animation="border" />
            <p className="mt-3">Đang tải...</p>
          </Container>
          <Footer />
        </>
      );
    }

  return (
    <div className="viewed-products-page">
      <Header />
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-2">
            <i className="bi bi-clock-history me-2"></i>
            Sản phẩm đã xem ({products.length})
          </h3>
          {products.length > 0 && (
            <Button variant="outline-danger" size="sm" onClick={handleClear}>
              <i className="bi bi-trash me-1"></i>
              Xóa lịch sử
            </Button>
          )}
        </div>

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" />
          </div>
        )}

        {error && (
          <Alert variant="danger" className="my-3">{error}</Alert>
        )}

        {!loading && products.length === 0 && (
          <Alert variant="info" className="my-4">
            Chưa có sản phẩm nào trong lịch sử đã xem
          </Alert>
        )}

        <Row className="g-3">
          {products.map((p) => (
            <Col key={p._id} xs={6} md={3} lg={3}>
              <div className="d-flex flex-column h-100">
                <ProductCard product={p} />
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => handleRemove(p._id)}
                >
                  <i className="bi bi-clock-history me-2"></i>
                  xoá khỏi lịch sử
                </Button>
              </div>
            </Col>

          ))}
        </Row>
      </Container>
      <Footer />
    </div>
  )
}
