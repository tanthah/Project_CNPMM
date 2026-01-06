import React, { useEffect, useState, useMemo } from 'react'
import { Alert, Spinner, Button, Form, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductComments, createComment, toggleLikeComment } from '../redux/commentSlice'
import { useNavigate } from 'react-router-dom'

// Recursive Comment Item Component
const CommentItem = ({ comment, childrenComments, onReply, onLike, submitting, replyToId, setReplyToId, replyText, setReplyText, handleReplySubmit, token, currentUser, depth = 0 }) => {
  const isReplying = replyToId === comment._id;
  const isLiked = comment.likes?.includes(currentUser?._id);
  const [isExpanded, setIsExpanded] = useState(false);

  // Cap indentation at 3 levels to avoid squeezing content too much
  const isNested = comment.parentId && depth < 3;

  return (
    <div className={`border-bottom pb-3 mb-3 ${isNested ? 'ms-4 border-start ps-3' : ''}`}>
      <div className="d-flex align-items-start">
        <img
          src={comment.isAdmin ? '/admin-avatar.png' : (comment.userId?.avatar || 'https://via.placeholder.com/40')}
          alt={comment.isAdmin ? 'Admin' : comment.userId?.name}
          className="rounded-circle me-2"
          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
        />
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center">
            <strong className={comment.isAdmin ? 'text-danger' : ''}>
              {comment.isAdmin ? (
                <>
                  <i className="bi bi-shield-check me-1"></i>
                  QTV
                </>
              ) : (comment.userId?.name || 'Người dùng')}
            </strong>
            <small className="text-muted">{new Date(comment.createdAt).toLocaleString('vi-VN')}</small>
          </div>
          <p className="mb-1">{comment.content}</p>

          {/* Action Buttons */}
          <div className="d-flex gap-3 text-muted small mt-1 align-items-center">
            <span
              className="cursor-pointer hover-text-primary"
              style={{ cursor: 'pointer' }}
              onClick={() => onReply(comment._id)}
            >
              <i className="bi bi-reply me-1"></i> Trả lời
            </span>

            <span
              className={`cursor-pointer ${isLiked ? 'text-danger' : 'hover-text-danger'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onLike(comment._id)}
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
              {comment.likes?.length > 0 ? comment.likes.length : 'Thích'}
            </span>

            {/* Toggle Replies Button */}
            {childrenComments && childrenComments.length > 0 && (
              <span
                className="cursor-pointer text-primary fw-bold"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <i className="bi bi-chevron-up me-1"></i>
                    Thu gọn
                  </>
                ) : (
                  <>
                    <i className="bi bi-chevron-down me-1"></i>
                    Xem {childrenComments.length} câu trả lời
                  </>
                )}
              </span>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-2">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Viết câu trả lời..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="mb-2"
                autoFocus
              />
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setReplyToId(null)}>Hủy</Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleReplySubmit(comment._id);
                    setIsExpanded(true); // Auto expand to see new reply
                  }}
                  disabled={submitting || !replyText.trim()}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Children Recursively */}
      {isExpanded && childrenComments && childrenComments.length > 0 && (
        <div className="mt-3">
          {childrenComments.map(child => (
            <CommentItem
              key={child._id}
              comment={child}
              childrenComments={child.children}
              onReply={onReply}
              onLike={onLike}
              submitting={submitting}
              replyToId={replyToId}
              setReplyToId={setReplyToId}
              replyText={replyText}
              setReplyText={setReplyText}
              handleReplySubmit={handleReplySubmit}
              token={token}
              currentUser={currentUser}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProductCommentsSection({ productId }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, user: currentUser } = useSelector((s) => s.auth)
  const { productComments, pagination, loading, submitting, error } = useSelector((s) => s.comments)

  const [commentPage, setCommentPage] = useState(1)
  const [commentText, setCommentText] = useState('')

  // Reply State
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!productId) return
    dispatch(fetchProductComments({ productId, page: commentPage, limit: 100 })) // Increased limit for threading
  }, [productId, commentPage, dispatch])

  // Build Tree Structure
  const commentTree = useMemo(() => {
    if (!productComments) return [];

    const map = {};
    const roots = [];

    // First pass: Initialize map and add children array
    productComments.forEach(c => {
      map[c._id] = { ...c, children: [] };
    });

    // Second pass: Link children to parents
    productComments.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });

    // Sort roots by date desc (newest first)
    // Sort children by date asc (oldest first - logical for conversation)
    roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const sortChildren = (nodes) => {
      nodes.forEach(node => {
        if (node.children.length > 0) {
          node.children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          sortChildren(node.children);
        }
      });
    };
    sortChildren(roots);

    return roots;
  }, [productComments]);

  const handleMainSubmit = async () => {
    if (!token) {
      navigate('/login')
      return
    }
    if (!commentText.trim()) return
    try {
      await dispatch(createComment({ productId, content: commentText.trim() })).unwrap()
      setCommentText('')
    } catch (err) { }
  }

  const handleReplySubmit = async (parentId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!replyText.trim()) return;

    try {
      await dispatch(createComment({ productId, content: replyText.trim(), parentId })).unwrap();
      setReplyText('');
      setReplyToId(null);
    } catch (err) { }
  };

  const onReply = (id) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setReplyToId(id);
    setReplyText('');
  };

  const handleLike = async (commentId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await dispatch(toggleLikeComment(commentId)).unwrap();
    } catch (err) { }
  };

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
            <Button variant="primary" onClick={handleMainSubmit} disabled={submitting || !commentText.trim()}>
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </Button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && commentTree.length === 0 && (
          <Alert variant="secondary">Chưa có bình luận nào cho sản phẩm này</Alert>
        )}

        {!loading && commentTree.length > 0 && (
          <div className="mt-4">
            {commentTree.map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                childrenComments={c.children}
                onReply={onReply}
                onLike={handleLike}
                submitting={submitting}
                replyToId={replyToId}
                setReplyToId={setReplyToId}
                replyText={replyText}
                setReplyText={setReplyText}
                handleReplySubmit={handleReplySubmit}
                token={token}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
