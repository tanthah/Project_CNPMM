// frontend/src/pages/CustomerSupport.jsx
import React from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/CustomerSupport.css';

export default function CustomerSupport() {
    return (
        <div className="customer-support-page">
            <Header />

            <Container className="py-5">
                <div className="text-center mb-5">
                    <h1 className="fw-bold">
                        <i className="bi bi-headset me-2 text-primary"></i>
                        Hỗ Trợ Khách Hàng
                    </h1>
                    <p className="text-muted">
                        Mọi thông tin về chính sách vận chuyển, bảo hành, đổi trả và thanh toán
                    </p>
                </div>

                <Accordion defaultActiveKey="0" className="support-accordion">
                    {/* Chính sách vận chuyển */}
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>
                            <span className="policy-icon">🚚</span>
                            <span className="policy-title">Chính Sách Vận Chuyển</span>
                        </Accordion.Header>
                        <Accordion.Body>
                            <Row>
                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-globe me-2"></i>
                                                1. Phạm vi giao hàng
                                            </h5>
                                            <ul className="policy-list">
                                                <li>Giao hàng toàn quốc</li>
                                                <li>Nhận hàng tại nhà hoặc tại bưu cục theo yêu cầu</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-clock me-2"></i>
                                                2. Thời gian giao hàng
                                            </h5>
                                            <ul className="policy-list">
                                                <li><strong>Nội thành:</strong> 1 – 2 ngày làm việc</li>
                                                <li><strong>Ngoại thành / Tỉnh:</strong> 2 – 5 ngày làm việc</li>
                                                <li className="text-muted small">(Không tính Chủ nhật & ngày lễ)</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-cash-coin me-2"></i>
                                                3. Phí vận chuyển
                                            </h5>
                                            <ul className="policy-list">
                                                <li><strong>Miễn phí</strong> cho đơn hàng từ 500.000đ</li>
                                                <li>Đơn hàng dưới mức miễn phí: tính theo bảng giá đơn vị vận chuyển</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-search me-2"></i>
                                                4. Kiểm tra hàng khi nhận
                                            </h5>
                                            <ul className="policy-list">
                                                <li>Khách hàng được kiểm tra ngoại quan trước khi thanh toán</li>
                                                <li>Nếu phát hiện lỗi, móp méo → từ chối nhận hàng và liên hệ ngay shop</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* Chính sách bảo hành */}
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>
                            <span className="policy-icon">🛡️</span>
                            <span className="policy-title">Chính Sách Bảo Hành</span>
                        </Accordion.Header>
                        <Accordion.Body>
                            <Row>
                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-calendar-check me-2"></i>
                                                1. Thời gian bảo hành
                                            </h5>
                                            <ul className="policy-list">
                                                <li><strong>Điện thoại / Tablet / Laptop:</strong> 6 – 12 tháng (tùy sản phẩm)</li>
                                                <li><strong>Phụ kiện</strong> (tai nghe, sạc, cáp…): 1 – 6 tháng</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-check-circle me-2"></i>
                                                2. Điều kiện bảo hành
                                            </h5>
                                            <ul className="policy-list check-list">
                                                <li>✔️ Sản phẩm còn trong thời hạn bảo hành</li>
                                                <li>✔️ Lỗi kỹ thuật do nhà sản xuất</li>
                                                <li>✔️ Tem bảo hành còn nguyên vẹn</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card warning-card">
                                        <Card.Body>
                                            <h5 className="text-danger">
                                                <i className="bi bi-x-circle me-2"></i>
                                                3. Trường hợp không bảo hành
                                            </h5>
                                            <ul className="policy-list cross-list">
                                                <li>❌ Rơi vỡ, vào nước, cháy nổ</li>
                                                <li>❌ Hư hỏng do sử dụng sai cách</li>
                                                <li>❌ Tự ý sửa chữa, thay linh kiện ngoài</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-tools me-2"></i>
                                                4. Hình thức bảo hành
                                            </h5>
                                            <ul className="policy-list">
                                                <li>Sửa chữa miễn phí</li>
                                                <li>Đổi sản phẩm tương đương nếu không thể sửa</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* Chính sách đổi trả */}
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>
                            <span className="policy-icon">🔄</span>
                            <span className="policy-title">Chính Sách Đổi Trả</span>
                        </Accordion.Header>
                        <Accordion.Body>
                            <Row>
                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-calendar me-2"></i>
                                                1. Thời gian đổi trả
                                            </h5>
                                            <ul className="policy-list">
                                                <li><strong>7 ngày</strong> kể từ ngày nhận hàng (đối với lỗi kỹ thuật)</li>
                                                <li>Không áp dụng đổi trả với phụ kiện đã qua sử dụng (trừ lỗi NSX)</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-check-circle me-2"></i>
                                                2. Điều kiện đổi trả
                                            </h5>
                                            <ul className="policy-list check-list">
                                                <li>✔️ Sản phẩm còn mới, đầy đủ hộp, phụ kiện</li>
                                                <li>✔️ Không trầy xước, không rơi vỡ</li>
                                                <li>✔️ Có hóa đơn mua hàng</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={12} className="mb-4">
                                    <Card className="h-100 policy-card warning-card">
                                        <Card.Body>
                                            <h5 className="text-danger">
                                                <i className="bi bi-x-circle me-2"></i>
                                                3. Trường hợp không hỗ trợ đổi trả
                                            </h5>
                                            <Row>
                                                <Col md={4}>
                                                    <p className="mb-0">❌ Sản phẩm bị hư hỏng do người dùng</p>
                                                </Col>
                                                <Col md={4}>
                                                    <p className="mb-0">❌ Quá thời gian quy định</p>
                                                </Col>
                                                <Col md={4}>
                                                    <p className="mb-0">❌ Không còn phụ kiện kèm theo</p>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* Hướng dẫn thanh toán */}
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>
                            <span className="policy-icon">💳</span>
                            <span className="policy-title">Hướng Dẫn Thanh Toán</span>
                        </Accordion.Header>
                        <Accordion.Body>
                            <Row>
                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-cash me-2"></i>
                                                1. Thanh toán khi nhận hàng (COD)
                                            </h5>
                                            <ul className="policy-list">
                                                <li>Thanh toán trực tiếp cho nhân viên giao hàng</li>
                                                <li>Áp dụng toàn quốc</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-credit-card me-2"></i>
                                                2. Chuyển khoản ngân hàng
                                            </h5>
                                            <ul className="policy-list">
                                                <li>Chuyển khoản trước khi giao hàng</li>
                                                <li>Thông tin tài khoản sẽ được gửi qua email sau khi đặt hàng</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-wallet2 me-2"></i>
                                                3. Ví điện tử
                                            </h5>
                                            <ul className="policy-list">
                                                <li>Hỗ trợ: Momo, VNPay, ZaloPay</li>
                                                <li>Thanh toán nhanh chóng, tiện lợi</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} className="mb-4">
                                    <Card className="h-100 policy-card">
                                        <Card.Body>
                                            <h5 className="text-primary">
                                                <i className="bi bi-shop me-2"></i>
                                                4. Thanh toán tại cửa hàng
                                            </h5>
                                            <ul className="policy-list">
                                                <li>Thanh toán trực tiếp khi đến nhận hàng</li>
                                                <li>Hỗ trợ tiền mặt và thẻ ngân hàng</li>
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* FAQ - Câu hỏi thường gặp */}
                    <Accordion.Item eventKey="4">
                        <Accordion.Header>
                            <span className="policy-icon">❓</span>
                            <span className="policy-title">Câu Hỏi Thường Gặp (FAQ)</span>
                        </Accordion.Header>
                        <Accordion.Body>
                            {/* FAQ 1: Đặt hàng & Giao hàng */}
                            <div className="faq-section mb-4">
                                <h5 className="text-primary mb-3">
                                    <span className="me-2">📦</span>
                                    1. Đặt hàng & Giao hàng
                                </h5>
                                <Accordion className="faq-inner-accordion">
                                    <Accordion.Item eventKey="faq-1-1">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Làm thế nào để đặt hàng trên website?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span> Bạn chỉ cần chọn sản phẩm → Thêm vào giỏ hàng → Điền thông tin → Chọn hình thức thanh toán → Xác nhận đơn hàng.
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="faq-1-2">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Tôi có được kiểm tra hàng trước khi nhận không?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span> Có. Bạn được kiểm tra ngoại quan sản phẩm trước khi thanh toán.
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="faq-1-3">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Thời gian giao hàng mất bao lâu?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span>
                                                <ul className="mt-2 mb-0">
                                                    <li><strong>Nội thành:</strong> 1 – 2 ngày</li>
                                                    <li><strong>Ngoại thành / Tỉnh:</strong> 2 – 5 ngày</li>
                                                    <li className="text-muted small">(Không tính ngày lễ, Chủ nhật)</li>
                                                </ul>
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="faq-1-4">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Phí vận chuyển được tính như thế nào?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span> Miễn phí vận chuyển với đơn hàng từ 500.000đ. Đơn hàng dưới mức này sẽ tính phí theo đơn vị vận chuyển.
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>

                            {/* FAQ 2: Bảo hành & Hỗ trợ kỹ thuật */}
                            <div className="faq-section mb-4">
                                <h5 className="text-primary mb-3">
                                    <span className="me-2">🛡️</span>
                                    2. Bảo hành & Hỗ trợ kỹ thuật
                                </h5>
                                <Accordion className="faq-inner-accordion">
                                    <Accordion.Item eventKey="faq-2-1">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Sản phẩm có được bảo hành không?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span> Tất cả sản phẩm đều được bảo hành chính hãng hoặc bảo hành tại cửa hàng theo từng loại sản phẩm.
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="faq-2-2">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Thời gian bảo hành là bao lâu?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span>
                                                <ul className="mt-2 mb-0">
                                                    <li><strong>Điện thoại / Laptop / Tablet:</strong> 6 – 12 tháng</li>
                                                    <li><strong>Phụ kiện:</strong> 1 – 6 tháng</li>
                                                </ul>
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="faq-2-3">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Trường hợp nào không được bảo hành?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span>
                                                <ul className="mt-2 mb-0">
                                                    <li>Rơi vỡ, vào nước</li>
                                                    <li>Tự ý sửa chữa</li>
                                                    <li>Hư hỏng do sử dụng sai cách</li>
                                                </ul>
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>

                            {/* FAQ 3: Đổi trả & Hoàn tiền */}
                            <div className="faq-section mb-4">
                                <h5 className="text-primary mb-3">
                                    <span className="me-2">🔄</span>
                                    3. Đổi trả & Hoàn tiền
                                </h5>
                                <Accordion className="faq-inner-accordion">
                                    <Accordion.Item eventKey="faq-3-1">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Tôi có thể đổi trả sản phẩm không?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span> Có. Bạn có thể đổi trả trong 7 ngày nếu sản phẩm bị lỗi kỹ thuật từ nhà sản xuất.
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="faq-3-2">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Đổi trả có mất phí không?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span>
                                                <ul className="mt-2 mb-0">
                                                    <li><strong>Lỗi từ nhà sản xuất:</strong> Miễn phí</li>
                                                    <li><strong>Lỗi từ người dùng:</strong> Không hỗ trợ đổi trả</li>
                                                </ul>
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="faq-3-3">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Bao lâu tôi nhận được tiền hoàn?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span> Trong vòng 3 – 7 ngày làm việc sau khi shop nhận lại sản phẩm hợp lệ.
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>

                            {/* FAQ 4: Thanh toán */}
                            <div className="faq-section mb-4">
                                <h5 className="text-primary mb-3">
                                    <span className="me-2">💳</span>
                                    4. Thanh toán
                                </h5>
                                <Accordion className="faq-inner-accordion">
                                    <Accordion.Item eventKey="faq-4-1">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Website hỗ trợ những hình thức thanh toán nào?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span>
                                                <ul className="mt-2 mb-0">
                                                    <li>Thanh toán khi nhận hàng (COD)</li>
                                                    <li>Chuyển khoản ngân hàng</li>
                                                    <li>Ví điện tử (Momo, ZaloPay, VNPay)</li>
                                                    <li>Thẻ ATM / Visa / MasterCard</li>
                                                </ul>
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="faq-4-2">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Thanh toán online có an toàn không?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span> Có. Website sử dụng kết nối bảo mật (HTTPS) và cổng thanh toán uy tín.
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>

                            {/* FAQ 5: Tài khoản & Bảo mật */}
                            <div className="faq-section mb-4">
                                <h5 className="text-primary mb-3">
                                    <span className="me-2">🔐</span>
                                    5. Tài khoản & Bảo mật
                                </h5>
                                <Accordion className="faq-inner-accordion">
                                    <Accordion.Item eventKey="faq-5-1">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Tôi có cần đăng ký tài khoản để mua hàng không?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span> Không bắt buộc, nhưng đăng ký tài khoản giúp bạn theo dõi đơn hàng và bảo hành dễ dàng hơn.
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="faq-5-2">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Thông tin cá nhân của tôi có được bảo mật không?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span> Chúng tôi cam kết không chia sẻ thông tin khách hàng cho bên thứ ba nếu không có sự đồng ý.
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>

                            {/* FAQ 6: Liên hệ & Hỗ trợ */}
                            <div className="faq-section">
                                <h5 className="text-primary mb-3">
                                    <span className="me-2">📞</span>
                                    6. Liên hệ & Hỗ trợ
                                </h5>
                                <Accordion className="faq-inner-accordion">
                                    <Accordion.Item eventKey="faq-6-1">
                                        <Accordion.Header>
                                            <span className="faq-question">❓ Tôi cần hỗ trợ thì liên hệ bằng cách nào?</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p className="mb-0">
                                                <span className="text-primary">👉</span>
                                                <ul className="mt-2 mb-0">
                                                    <li><strong>Hotline:</strong> 1900 xxxx</li>
                                                    <li><strong>Email:</strong> support@tvshop.com</li>
                                                    <li><strong>Fanpage / Zalo:</strong> hỗ trợ 24/7</li>
                                                </ul>
                                            </p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

                {/* Contact Section */}
                <div className="contact-section mt-5 text-center">
                    <Card className="bg-primary text-white">
                        <Card.Body className="py-4">
                            <h4>
                                <i className="bi bi-question-circle me-2"></i>
                                Bạn cần hỗ trợ thêm?
                            </h4>
                            <p className="mb-3">Liên hệ với chúng tôi qua các kênh sau:</p>
                            <div className="d-flex justify-content-center gap-4 flex-wrap">
                                <div>
                                    <i className="bi bi-telephone-fill me-2"></i>
                                    <strong>Hotline:</strong> 1900 xxxx
                                </div>
                                <div>
                                    <i className="bi bi-envelope-fill me-2"></i>
                                    <strong>Email:</strong> support@tvshop.com
                                </div>
                                <div>
                                    <i className="bi bi-clock-fill me-2"></i>
                                    <strong>Giờ làm việc:</strong> 8:00 - 22:00
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </Container>

            <Footer />
        </div>
    );
}

