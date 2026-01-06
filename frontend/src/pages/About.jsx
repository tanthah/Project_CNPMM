
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/About.css';

export default function About() {
  const stats = [
    { icon: 'bi-shop', number: '50+', label: 'Cửa hàng trên toàn quốc' },
    { icon: 'bi-people', number: '500K+', label: 'Khách hàng tin dùng' },
    { icon: 'bi-box-seam', number: '1M+', label: 'Sản phẩm đã bán' },
    { icon: 'bi-award', number: '10+', label: 'Năm kinh nghiệm' }
  ];

  const values = [
    {
      icon: 'bi-shield-check',
      title: 'Chính hãng 100%',
      description: 'Cam kết sản phẩm chính hãng, nguồn gốc xuất xứ rõ ràng'
    },
    {
      icon: 'bi-truck',
      title: 'Giao hàng nhanh',
      description: 'Giao hàng toàn quốc, nhanh chóng trong 1-3 ngày'
    },
    {
      icon: 'bi-credit-card',
      title: 'Thanh toán linh hoạt',
      description: 'Hỗ trợ nhiều hình thức thanh toán, trả góp 0%'
    },
    {
      icon: 'bi-arrow-repeat',
      title: 'Đổi trả dễ dàng',
      description: 'Chính sách đổi trả linh hoạt trong 15 ngày'
    }
  ];

  const team = [
    {
      name: ' Sỹ Hoàng Vũ',
      role: '',
      image: 'https://via.placeholder.com/150'
    },
    {
      name: 'Ngô Đỗ Tấn Thành',
      role: '',
      image: 'https://via.placeholder.com/150'
    }
  ];

  return (
    <div className="about-page">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="about-hero">
          <Container>
            <Row className="align-items-center">
              <Col lg={6}>
                <h1 className="hero-title">
                  Về TV Shop
                </h1>
                <p className="hero-description">
                  Hệ thống bán lẻ điện thoại, laptop, tablet và phụ kiện công nghệ
                  chính hãng uy tín hàng đầu Việt Nam. Chúng tôi cam kết mang đến
                  cho khách hàng những sản phẩm chất lượng nhất với giá cả cạnh tranh.
                </p>
              </Col>
              <Col lg={6}>
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
                  alt="About UTE Shop"
                  className="hero-image"
                />
              </Col>
            </Row>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <Container>
            <Row>
              {stats.map((stat, idx) => (
                <Col key={idx} md={3} sm={6} className="mb-4">
                  <div className="stat-card">
                    <i className={`bi ${stat.icon} stat-icon`}></i>
                    <h3 className="stat-number">{stat.number}</h3>
                    <p className="stat-label">{stat.label}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Mission & Vision */}
        <section className="mission-section">
          <Container>
            <Row>
              <Col md={6} className="mb-4">
                <Card className="mission-card">
                  <Card.Body>
                    <div className="mission-icon">
                      <i className="bi bi-bullseye"></i>
                    </div>
                    <h3>Sứ mệnh</h3>
                    <p>
                      Mang công nghệ hiện đại đến gần hơn với mọi người,
                      giúp cuộc sống trở nên tiện lợi và hiện đại hơn.
                      Chúng tôi không chỉ bán sản phẩm mà còn cung cấp
                      giải pháp công nghệ toàn diện.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="mission-card">
                  <Card.Body>
                    <div className="mission-icon">
                      <i className="bi bi-eye"></i>
                    </div>
                    <h3>Tầm nhìn</h3>
                    <p>
                      Trở thành hệ thống bán lẻ công nghệ số 1 Việt Nam,
                      được khách hàng tin tưởng và lựa chọn. Mở rộng
                      quy mô lên 100+ cửa hàng trên toàn quốc trong 5 năm tới.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Core Values */}
        <section className="values-section">
          <Container>
            <h2 className="section-title text-center mb-5">
              Giá trị cốt lõi
            </h2>
            <Row>
              {values.map((value, idx) => (
                <Col key={idx} lg={3} md={6} xs={12} className="mb-4">
                  <Card className="value-card">
                    <Card.Body className="text-center">
                      <div className="value-icon">
                        <i className={`bi ${value.icon}`}></i>
                      </div>
                      <h5>{value.title}</h5>
                      <p className="text-muted small">{value.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <Container>
            <h2 className="section-title text-center mb-5">
              Đội ngũ lãnh đạo
            </h2>
            <Row>
              {team.map((member, idx) => (
                <Col key={idx} lg={3} md={6} xs={12} className="mb-4">
                  <Card className="team-card">
                    <Card.Img
                      variant="top"
                      src={member.image}
                      alt={member.name}
                      className="team-image"
                    />
                    <Card.Body className="text-center">
                      <h5 className="mb-1">{member.name}</h5>
                      <p className="text-muted small mb-0">{member.role}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>


      </main>

      <Footer />
    </div>
  );
}