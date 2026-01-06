import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import productApi from '../api/productApi'

export default function SimilarProductsSection({ productId }) {
  const navigate = useNavigate()
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await productApi.getSimilarProducts(productId, 8)
        if (!mounted) return
        setSimilarProducts(res.data.products || [])
        setLoading(false)
      } catch (err) {
        if (!mounted) return
        setError('Không thể tải sản phẩm tương tự')
        setLoading(false)
      }
    }
    if (productId) load()
    return () => { mounted = false }
  }, [productId])

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0">
          <i className="bi bi-grid me-2"></i>
          Sản phẩm tương tự
        </h5>
      </Card.Header>
      <Card.Body>
        {loading && (
          <div className="text-center py-4"><Spinner animation="border" /></div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && similarProducts.length === 0 && (
          <Alert variant="secondary">Không có sản phẩm tương tự</Alert>
        )}

        {!loading && !error && similarProducts.length > 0 && (
          <Row className="g-3">
            {similarProducts.map(p => (
              <Col key={p._id} lg={3} md={4} xs={6}>
                <Card
                  className="h-100 product-card-small"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigate(`/product/${p._id}`)
                    window.scrollTo(0, 0)
                  }}
                >
                  <Card.Img
                    variant="top"
                    src={p.images[0]}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title className="small" style={{ height: '40px', overflow: 'hidden' }}>
                      {p.name}
                    </Card.Title>
                    <div className="text-danger fw-bold">
                      {p.finalPrice?.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="small text-muted mt-1">
                      <i className="bi bi-star-fill text-warning me-1"></i>
                      {p.rating?.toFixed(1) || 0} ({p.numReviews || 0})
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  )
}
