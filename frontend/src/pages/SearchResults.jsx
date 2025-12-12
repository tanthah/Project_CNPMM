import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Spinner, Alert, Form } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import productApi from '../api/productApi'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const q = searchParams.get('query') || ''
    setQuery(q)
    setPage(1)
  }, [])

  useEffect(() => {
    fetchResults()
  }, [query, page])

  const fetchResults = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await productApi.searchFuzzy(query, page, 16)
      setProducts(res.data.products || [])
      setTotalPages(res.data.pagination?.totalPages || 0)
      setLoading(false)
    } catch (err) {
      setError('Không thể tải kết quả tìm kiếm')
      setLoading(false)
    }
  }

  const handleQueryChange = (e) => {
    const q = e.target.value
    setQuery(q)
    setSearchParams(q ? { query: q } : {})
    setPage(1)
  }

  return (
    <div className="search-results-page">
      <Header />
      <Container className="py-4">
        <h3 className="mb-3">
          <i className="bi bi-search me-2"></i>
          Kết quả tìm kiếm
        </h3>

        <Form.Control 
          type="text" 
          placeholder="Nhập từ khóa..." 
          value={query}
          onChange={handleQueryChange}
          className="mb-3"
        />

        {loading && (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        )}

        {error && (
          <Alert variant="danger">{error}</Alert>
        )}

        {!loading && !error && products.length === 0 && (
          <Alert variant="secondary">Không có sản phẩm phù hợp</Alert>
        )}

        {!loading && !error && products.length > 0 && (
          <Row className="g-3">
            {products.map((p) => (
              <Col key={p._id} xs={6} md={3}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
            <button 
              className="btn btn-outline-secondary btn-sm" 
              disabled={page <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <span className="small">Trang {page} / {totalPages}</span>
            <button 
              className="btn btn-outline-secondary btn-sm" 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </Container>
      <Footer />
    </div>
  )
}

