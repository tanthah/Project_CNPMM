import React from 'react'
import { Row, Col, Spinner, Alert } from 'react-bootstrap'
import ProductCard from './ProductCard'
import './ProductSection.css'

export default function ProductSection({ title, icon, products, loading, error, columns = 4 }) {
    // Calculate column size based on columns prop
    const colSize = {
        3: { xs: 12, sm: 6, md: 4, lg: 4 },
        4: { xs: 12, sm: 6, md: 4, lg: 3 },
        6: { xs: 12, sm: 6, md: 4, lg: 2 },
    }[columns] || { xs: 12, sm: 6, md: 4, lg: 3 }

    return (
        <section className="product-section">
            <div className="section-header mb-4">
                <h2 className="section-title">
                    <i className={`${icon} me-2`}></i>
                    {title}
                </h2>
            </div>

            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
                </div>
            )}

            {error && (
                <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </Alert>
            )}

            {!loading && !error && products && products.length === 0 && (
                <div className="empty-state text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <p className="text-muted mt-3">Chưa có sản phẩm nào</p>
                </div>
            )}

            {!loading && !error && products && products.length > 0 && (
                <Row className="g-3">
                    {products.map((product) => (
                        <Col key={product._id} {...colSize}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            )}
        </section>
    )
}
