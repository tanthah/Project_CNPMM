import React, { useEffect, useState } from 'react'
import { Button, Alert, Spinner, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { ReviewForm, ReviewCard, RatingSummary } from './ReviewForm'
import { fetchProductReviews, fetchPendingReviews } from '../redux/reviewSlice'
import { useNavigate } from 'react-router-dom'

export default function ProductReviewsSection({ productId }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((s) => s.auth)
  const { productReviews, reviewStats, pagination, loading, pendingReviews } = useSelector((s) => s.review)

  const [reviewSort, setReviewSort] = useState('newest')
  const [reviewPage, setReviewPage] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    if (!productId) return
    dispatch(fetchProductReviews({ productId, page: reviewPage, limit: 10, sort: reviewSort }))
  }, [productId, reviewSort, reviewPage, dispatch])

  useEffect(() => {
    if (token) dispatch(fetchPendingReviews())
  }, [token, dispatch])

  const eligibleItem = pendingReviews?.find((it) => it.product._id === productId)

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0">
          <i className="bi bi-star-half me-2"></i>
          Đánh giá sản phẩm
        </h5>
      </Card.Header>
      <Card.Body>
        <RatingSummary stats={reviewStats} />

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: '200px' }}
              value={reviewSort}
              onChange={(e) => {
                setReviewSort(e.target.value)
                setReviewPage(1)
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="rating-high">Đánh giá cao</option>
              <option value="rating-low">Đánh giá thấp</option>
            </select>
          </div>

          <div>
            <Button
              variant="primary"
              disabled={!token || !eligibleItem}
              onClick={() => {
                if (!token) {
                  navigate('/login')
                  return
                }
                if (eligibleItem) setShowReviewForm(true)
              }}
            >
              <i className="bi bi-pencil-square me-2"></i>
              Viết đánh giá
            </Button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && productReviews && productReviews.length === 0 && (
          <Alert variant="secondary">Chưa có đánh giá nào cho sản phẩm này</Alert>
        )}

        {!loading && productReviews && productReviews.length > 0 && (
          <div>
            {productReviews.map((rv) => (
              <ReviewCard key={rv._id} review={rv} />
            ))}

            {pagination && pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  disabled={reviewPage <= 1}
                  onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                >
                  <i className="bi bi-chevron-left"></i>
                </Button>
                <span className="small">Trang {pagination.currentPage} / {pagination.totalPages}</span>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  disabled={reviewPage >= pagination.totalPages}
                  onClick={() => setReviewPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  <i className="bi bi-chevron-right"></i>
                </Button>
              </div>
            )}
          </div>
        )}

        {eligibleItem && (
          <ReviewForm
            show={showReviewForm}
            onHide={() => setShowReviewForm(false)}
            orderItem={eligibleItem}
          />
        )}
      </Card.Body>
    </Card>
  )
}

