
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './css/PromoBanner.css';

export default function PromoBanner() {
  const banners = [
    {
      id: 1,
      title: 'iPhone 15 Pro Max',
      subtitle: 'Giảm đến 5 triệu',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      title: 'Laptop Gaming',
      subtitle: 'Trả góp 0% lãi suất',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 3,
      title: 'Tai nghe Premium',
      subtitle: 'Mua 1 tặng 1',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  return (
    <section className="promo-banner-section">
      <Container>
        <Row className="g-3">
          {banners.map((banner) => (
            <Col key={banner.id} md={4} sm={12}>
              <div 
                className="promo-banner-card"
                style={{ background: banner.color }}
              >
                <div className="promo-content">
                  <h3 className="promo-title">{banner.title}</h3>
                  <p className="promo-subtitle">{banner.subtitle}</p>
                  <button className="btn btn-light btn-sm rounded-pill">
                    Xem ngay <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
                <div className="promo-image">
                  <img src={banner.image} alt={banner.title} />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}