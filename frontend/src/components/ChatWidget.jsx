import React, { useState, useEffect } from 'react';
import * as faqApi from '../api/faqApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComment,
    faTimes,
    faTruck,
    faCreditCard,
    faBoxOpen,
    faGift,
    faUser,
    faGlobe,
    // Icons for answers
    faPhone, faEnvelope, faMessage, faLocationDot, faClock, faMapMarkerAlt,
    faMoneyBillWave, faUniversity, faUndo, faExclamationCircle, faCheck,
    faStar, faUserCog, faLock, faMoneyBill, faMobileAlt, faShieldAlt, faKey,
    faCheckCircle, faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import './ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [faqs, setFaqs] = useState({});
    const [selectedFaq, setSelectedFaq] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFAQs();
    }, []);

    const loadFAQs = async () => {
        try {
            setLoading(true);
            const response = await faqApi.getAllFAQs();
            setFaqs(response.faqs || {});
        } catch (error) {
            console.error('Error loading FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const categoryNames = {
        shipping: { label: ' Vận chuyển', icon: faTruck },
        payment: { label: ' Thanh toán', icon: faCreditCard },
        return: { label: ' Đổi trả', icon: faBoxOpen },
        loyalty: { label: ' Tích điểm', icon: faGift },
        account: { label: ' Tài khoản', icon: faUser },
        general: { label: ' Khác', icon: faGlobe }
    };

    const handleFaqClick = (faq) => {
        setSelectedFaq(faq);
    };

    const handleBack = () => {
        setSelectedFaq(null);
    };

    const iconMap = {
        'fa-phone': faPhone,
        'fa-envelope': faEnvelope,
        'fa-message': faMessage,
        'fa-location-dot': faLocationDot,
        'fa-clock': faClock,
        'fa-map-marker-alt': faMapMarkerAlt,
        'fa-money-bill': faMoneyBill,
        'fa-money-bill-wave': faMoneyBillWave,
        'fa-university': faUniversity,
        'fa-undo': faUndo,
        'fa-exclamation-circle': faExclamationCircle,
        'fa-check': faCheck,
        'fa-star': faStar,
        'fa-user-cog': faUserCog,
        'fa-lock': faLock,
        'fa-truck': faTruck,
        'fa-credit-card': faCreditCard,
        'fa-mobile-alt': faMobileAlt,
        'fa-shield-alt': faShieldAlt,
        'fa-key': faKey,
        'fa-check-circle': faCheckCircle,
        'fa-user-plus': faUserPlus
    };

    const renderAnswer = (text) => {
        return text.split('\n').map((line, idx) => {
            // Regex to find <FontAwesomeIcon icon="..." />
            const parts = line.split(/(<FontAwesomeIcon icon="[^"]+" \/>)/g);

            return (
                <p key={idx} className="faq-answer-line">
                    {parts.map((part, i) => {
                        const match = part.match(/icon="([^"]+)"/);
                        if (match) {
                            // Extract icon name (remove fa-solid prefix if present)
                            const iconName = match[1].replace('fa-solid ', '');
                            const iconObj = iconMap[iconName];
                            return iconObj ? <FontAwesomeIcon key={i} icon={iconObj} className="me-2" /> : null;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className={`chat-widget-button ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Chatbox hỗ trợ"
            >
                {isOpen ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faComment} />}
                {!isOpen && <span className="chat-widget-label">Hỗ trợ</span>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-widget-window">
                    {/* Header */}
                    <div className="chat-widget-header">
                        <h3> Hỗ trợ khách hàng</h3>
                        <button
                            className="chat-widget-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Đóng"><FontAwesomeIcon icon={faTimes} /></button>
                    </div>

                    {/* Body */}
                    <div className="chat-widget-body">
                        {loading ? (
                            <div className="chat-widget-loading">Đang tải...</div>
                        ) : selectedFaq ? (
                            // Hiển thị câu trả lời
                            <div className="chat-widget-answer">
                                <button className="chat-widget-back" onClick={handleBack}>
                                    ← Quay lại
                                </button>
                                <div className="faq-question">
                                    <strong>{selectedFaq.question}</strong>
                                </div>
                                <div className="faq-answer">
                                    {renderAnswer(selectedFaq.answer)}
                                </div>
                            </div>
                        ) : (
                            // Hiển thị danh sách câu hỏi
                            <div className="chat-widget-faq-list">
                                <p className="chat-widget-intro">
                                    Xin chào! Tôi có thể giúp gì cho bạn?
                                </p>
                                {Object.entries(faqs).map(([category, faqList]) => (
                                    <div key={category} className="faq-category">
                                        <h4>
                                            <FontAwesomeIcon icon={categoryNames[category]?.icon || faGlobe} className="me-2" />
                                            {categoryNames[category]?.label || category}
                                        </h4>
                                        {faqList.map((faq) => (
                                            <button
                                                key={faq._id}
                                                className="faq-item"
                                                onClick={() => handleFaqClick(faq)}
                                            >
                                                <span className="faq-text">{faq.question}</span>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="chat-widget-footer">
                        <small>Powered by UTE Shop</small>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
