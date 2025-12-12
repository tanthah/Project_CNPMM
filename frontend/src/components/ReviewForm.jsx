import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { createReview, clearError, clearSuccess } from '../redux/reviewSlice';

// Review Form Component
export function ReviewForm({ show, onHide, orderItem }) {
  const dispatch = useDispatch();
  const { submitting, error, successMessage } = useSelector((s) => s.review);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(createReview({
        productId: orderItem.product._id,
        orderId: orderItem.orderId,
        rating,
        comment
      })).unwrap();
      
      setTimeout(() => {
        dispatch(clearSuccess());
        onHide();
      }, 2000);
    } catch (err) {
      console.error('Review error:', err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Đánh giá sản phẩm</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="success">
            <i className="bi bi-check-circle me-2"></i>
            {successMessage}
          </Alert>
        )}
        
        <div className="text-center mb-3">
          <img 
            src={orderItem.product.images[0]} 
            alt={orderItem.product.name}
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
          />
          <h6 className="mt-2">{orderItem.product.name}</h6>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 text-center">
            <Form.Label className="fw-bold">Đánh giá của bạn</Form.Label>
            <div className="star-rating" style={{ fontSize: '2rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`bi ${
                    star <= (hover || rating) ? 'bi-star-fill' : 'bi-star'
                  }`}
                  style={{
                    color: star <= (hover || rating) ? '#ffc107' : '#dee2e6',
                    cursor: 'pointer',
                    marginRight: '5px'
                  }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                ></i>
              ))}
            </div>
            <div className="text-muted small mt-1">
              {rating === 1 && 'Rất tệ'}
              {rating === 2 && 'Tệ'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Tốt'}
              {rating === 5 && 'Tuyệt vời'}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nhận xét của bạn</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>

          <div className="alert alert-info small">
            <i className="bi bi-gift me-2"></i>
            <strong>Phần thưởng:</strong> Nhận 50 điểm tích lũy + Mã giảm giá 5%
          </div>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={submitting || !rating}
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Review Card Component
export function ReviewCard({ review }) {
  return (
    <div className="review-card border-bottom pb-3 mb-3">
      <div className="d-flex align-items-start">
        <img 
          src={review.userId?.avatar || 'https://via.placeholder.com/50'}
          alt={review.userId?.name}
          className="rounded-circle me-3"
          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
        />
        
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <strong>{review.userId?.name || 'Người dùng'}</strong>
              {review.isVerifiedPurchase && (
                <span className="badge bg-success ms-2 small">
                  <i className="bi bi-patch-check me-1"></i>
                  Đã mua hàng
                </span>
              )}
              <div className="text-warning small">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i 
                    key={star}
                    className={star <= review.rating ? 'bi bi-star-fill' : 'bi bi-star'}
                  ></i>
                ))}
              </div>
            </div>
            <small className="text-muted">
              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
            </small>
          </div>
          
          <p className="mt-2 mb-2">{review.comment}</p>
          
          {review.images && review.images.length > 0 && (
            <div className="d-flex gap-2 mb-2">
              {review.images.map((img, idx) => (
                <img 
                  key={idx}
                  src={img}
                  alt={`Review ${idx + 1}`}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          )}
          
          {review.reply && (
            <div className="bg-light p-3 rounded mt-2">
              <strong className="text-primary">
                <i className="bi bi-shop me-1"></i>
                Phản hồi từ shop
              </strong>
              <p className="mb-0 mt-1">{review.reply.content}</p>
              <small className="text-muted">
                {new Date(review.reply.repliedAt).toLocaleDateString('vi-VN')}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Rating Summary Component
export function RatingSummary({ stats }) {
  if (!stats) return null;
  
  const { averageRating, totalReviews, ratingBreakdown } = stats;
  
  return (
    <div className="rating-summary bg-light p-4 rounded mb-4">
      <div className="row align-items-center">
        <div className="col-md-4 text-center border-end">
          <h1 className="display-3 mb-0">{averageRating.toFixed(1)}</h1>
          <div className="text-warning mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <i 
                key={star}
                className={star <= Math.round(averageRating) ? 'bi bi-star-fill' : 'bi bi-star'}
                style={{ fontSize: '1.5rem' }}
              ></i>
            ))}
          </div>
          <p className="text-muted mb-0">{totalReviews} đánh giá</p>
        </div>
        
        <div className="col-md-8">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingBreakdown[rating] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="d-flex align-items-center mb-2">
                <span className="me-2" style={{ minWidth: '60px' }}>
                  {rating} <i className="bi bi-star-fill text-warning"></i>
                </span>
                <div className="progress flex-grow-1" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="ms-2 text-muted small" style={{ minWidth: '40px' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default { ReviewForm, ReviewCard, RatingSummary };