import React, { useEffect, useState } from 'react'
import { Alert, Spinner, Button, Form, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductComments, createComment } from '../redux/commentSlice'
import { useNavigate } from 'react-router-dom'

export default function ProductCommentsSection({ productId }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((s) => s.auth)
  const { productComments, pagination, loading, submitting, error } = useSelector((s) => s.comments)

  const [commentPage, setCommentPage] = useState(1)
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (!productId) return
    dispatch(fetchProductComments({ productId, page: commentPage, limit: 10 }))
  }, [productId, commentPage, dispatch])

  const handleSubmit = async () => {
    if (!token) {
      navigate('/login')
      return
    }
    if (!commentText.trim()) return
    try {
      await dispatch(createComment({ productId, content: commentText.trim() })).unwrap()
      setCommentText('')
    } catch (err) {}
  }

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0">
          <i className="bi bi-chat-left-dots me-2"></i>
          Bình luận sản phẩm
        </h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="mb-3">
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Viết bình luận của bạn..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="d-flex justify-content-end mt-2">
            <Button variant="primary" onClick={handleSubmit} disabled={submitting || !commentText.trim()}>
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </Button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && productComments && productComments.length === 0 && (
          <Alert variant="secondary">Chưa có bình luận nào cho sản phẩm này</Alert>
        )}

        {!loading && productComments && productComments.length > 0 && (
          <div>
            {productComments.map((c) => (
              <div key={c._id} className="border-bottom pb-3 mb-3">
                <div className="d-flex align-items-start">
                  <img
                    src={c.userId?.avatar || 'https://via.placeholder.com/40'}
                    alt={c.userId?.name}
                    className="rounded-circle me-2"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <strong>{c.userId?.name || 'Người dùng'}</strong>
                      <small className="text-muted">{new Date(c.createdAt).toLocaleString('vi-VN')}</small>
                    </div>
                    <p className="mb-1">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {pagination && pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={commentPage <= 1}
                  onClick={() => setCommentPage((p) => Math.max(1, p - 1))}
                >
                  <i className="bi bi-chevron-left"></i>
                </Button>
                <span className="small">Trang {pagination.currentPage} / {pagination.totalPages}</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={commentPage >= pagination.totalPages}
                  onClick={() => setCommentPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  <i className="bi bi-chevron-right"></i>
                </Button>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
