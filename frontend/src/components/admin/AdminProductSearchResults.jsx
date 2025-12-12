import React from 'react'
import { Card, Table, Badge, Button, Form } from 'react-bootstrap'

export default function AdminProductSearchResults({ results = [], onClear, onEdit, onDelete, onToggle }) {
  return (
    <Card className="mb-4">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <div>
          <strong>Kết quả tìm kiếm</strong>
          <Badge bg="primary" className="ms-2">{results.length}</Badge>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={onClear}>
          Xóa kết quả
        </Button>
      </Card.Header>
      <Card.Body className="pt-0">
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Giảm giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th style={{ width: '150px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Không có kết quả</td>
                </tr>
              ) : (
                results.map(product => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="product-thumb"
                      />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <br />
                      <small className="text-muted">{product.brand}</small>
                    </td>
                    <td>
                      <Badge bg="secondary">{product.categoryId?.name || 'N/A'}</Badge>
                    </td>
                    <td>
                      <strong className="text-danger">{product.finalPrice?.toLocaleString('vi-VN')}đ</strong>
                      {product.discount > 0 && (
                        <>
                          <br />
                          <small className="text-muted text-decoration-line-through">
                            {product.price?.toLocaleString('vi-VN')}đ
                          </small>
                        </>
                      )}
                    </td>
                    <td>
                      {product.discount > 0 && (
                        <Badge bg="danger">-{product.discount}%</Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={product.stock > 0 ? 'success' : 'danger'}>{product.stock}</Badge>
                    </td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={product.isActive}
                        onChange={() => onToggle(product._id)}
                      />
                    </td>
                    <td>
                      <div className="btn-group-actions">
                        <Button variant="outline-primary" size="sm" onClick={() => onEdit(product)} title="Sửa">
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => onDelete(product._id)} title="Xóa">
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  )
}

