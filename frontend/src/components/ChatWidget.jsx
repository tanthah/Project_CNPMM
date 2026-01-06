import React, { useState, useEffect, useRef } from 'react';
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
    faRobot,
    // Icons for answers
    faPhone, faEnvelope, faMessage, faLocationDot, faClock, faMapMarkerAlt,
    faMoneyBillWave, faUniversity, faUndo, faExclamationCircle, faCheck,
    faStar, faUserCog, faLock, faMoneyBill, faMobileAlt, faShieldAlt, faKey,
    faCheckCircle, faUserPlus, faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import './css/ChatWidget.css';
import io from 'socket.io-client';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [faqs, setFaqs] = useState({});
    const [loading, setLoading] = useState(false);
    const [isLiveChat, setIsLiveChat] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const chatBodyRef = useRef(null);
    const socket = useRef(null);
    const userSessionId = useRef('guest_' + Math.random().toString(36).substr(2, 9));

    // Initial greeting message
    const greetingMessage = {
        type: 'bot',
        content: (
            <div>
                <p>Chào mừng bạn đến với Trợ lý ảo TV Shop.</p>
                <p>Trước tiên, vui lòng chọn loại dịch vụ bạn yêu cầu.</p>
            </div>
        ),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const [categories, setCategories] = useState([]);

    // ... (keep useEffect for socket)

    useEffect(() => {
        loadData();

        // Initialize Socket.IO connection
        socket.current = io('http://localhost:5000', {
            transports: ['websocket', 'polling']
        });

        socket.current.on('connect', () => {
            console.log('ChatWidget connected to socket server');
        });

        socket.current.on('receive_message', (data) => {
            // Only handle messages from others/server
            if (data.sender !== 'client') {
                const botMsg = {
                    type: 'bot',
                    content: data.message,
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, botMsg]);
            }
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [faqsRes, catsRes] = await Promise.all([
                faqApi.getAllFAQs(),
                faqApi.getCategories()
            ]);

            const fetchedFaqs = faqsRes.faqs || {};
            setFaqs(fetchedFaqs);

            // API returns { success: true, categories: [...] }
            // So catsRes (response.data) contains .categories
            const catsArray = (catsRes && Array.isArray(catsRes.categories)) ? catsRes.categories : [];
            setCategories(catsArray);

            // Create a map for easy lookup
            const catMap = {};
            catsArray.forEach(cat => {
                catMap[cat.slug] = { label: cat.name, icon: faGlobe }; // Default icon
                // If you want specific icons, you might need to map based on slug keyword or add icon field in DB
                if (cat.slug === 'shipping') catMap[cat.slug].icon = faTruck;
                else if (cat.slug === 'payment') catMap[cat.slug].icon = faCreditCard;
                else if (cat.slug === 'return') catMap[cat.slug].icon = faBoxOpen;
                else if (cat.slug === 'loyalty') catMap[cat.slug].icon = faGift;
                else if (cat.slug === 'account') catMap[cat.slug].icon = faUser;
            });

            // Construct Main Menu Message locally to use fresh data
            const menuMsg = {
                type: 'bot',
                contentType: 'options',
                content: (
                    <div className="bot-options-container">
                        {Object.keys(fetchedFaqs).length > 0 ? Object.keys(fetchedFaqs).map(catKey => (
                            <button
                                key={catKey}
                                className="option-button"
                                onClick={() => handleCategoryClick(catKey, fetchedFaqs, catMap)}
                            >
                                {catMap[catKey]?.label || catKey}
                            </button>
                        )) : <p>Đang tải danh mục...</p>}
                        <button className="option-button" onClick={handleLiveChatClick}>
                            Chat với tư vấn viên
                        </button>
                    </div>
                ),
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            };

            setMessages([greetingMessage, menuMsg]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Removed hardcoded categoryNames

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

    // Helper to render rich text with icons
    const renderAnswerText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, idx) => {
            const parts = line.split(/(<FontAwesomeIcon icon="[^"]+" \/>)/g);
            return (
                <div key={idx} className="answer-line">
                    {parts.map((part, i) => {
                        const match = part.match(/icon="([^"]+)"/);
                        if (match) {
                            const iconName = match[1].replace('fa-solid ', '');
                            const iconObj = iconMap[iconName];
                            return iconObj ? <FontAwesomeIcon key={i} icon={iconObj} className="me-2 text-primary" /> : null;
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </div>
            );
        });
    };

    const handleCategoryClick = (category, overrideFaqs = null, catMap = null) => {
        let categoryLabel = category;
        if (catMap && catMap[category]) {
            categoryLabel = catMap[category].label;
        } else {
            // Fallback if catMap not passed (e.g. from existing buttons if any? No, only new buttons)
            // Try to find in current categories state
            const found = categories.find(c => c.slug === category);
            if (found) categoryLabel = found.name;
        }

        const currentFaqs = overrideFaqs || faqs;
        const categoryQuestions = currentFaqs[category] || [];

        // 1. User message
        const userMsg = {
            type: 'user',
            content: categoryLabel,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        // 2. Bot reply with questions
        const botMsg = {
            type: 'bot',
            contentType: 'options',
            content: (
                <div className="bot-options-container">
                    <p className="mb-2">Dưới đây là các câu hỏi thường gặp về <strong>{categoryLabel}</strong>:</p>
                    {categoryQuestions.map(q => (
                        <button
                            key={q._id}
                            className="option-button"
                            onClick={() => handleQuestionClick(q)}
                        >
                            {q.question}
                        </button>
                    ))}
                </div>
            ),
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg, botMsg]);
    };

    const handleQuestionClick = (question) => {
        // 1. User message
        const userMsg = {
            type: 'user',
            content: question.question,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        // 2. Bot reply with answer
        const botMsg = {
            type: 'bot',
            content: (
                <div className="bot-answer-container">
                    {renderAnswerText(question.answer)}
                </div>
            ),
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg, botMsg]);
    };


    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const msgContent = inputValue;
        setInputValue('');

        // Emit to server
        socket.current.emit('send_message', {
            userId: userSessionId.current,
            message: msgContent,
            name: 'Khách hàng' // Có thể lấy user name thật nếu có
        });

        // Add to UI immediately for better UX
        const userMsg = {
            type: 'user',
            content: msgContent,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleLiveChatClick = () => {
        setIsLiveChat(true);
        const userMsg = {
            type: 'user',
            content: 'Chat với tư vấn viên',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        const botMsg = {
            type: 'bot',
            content: 'Hệ thống đang kết nối bạn với nhân viên tư vấn. Bạn có thể bắt đầu nhắn tin ngay bây giờ.',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg, botMsg]);

        // Join chat room
        socket.current.emit('join_chat', {
            userId: userSessionId.current,
            name: 'Khách hàng'
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
                {!isOpen && <div className="chat-notification-badge">1</div>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-widget-window">
                    {/* Header */}
                    <div className="chat-widget-header">
                        <div className="d-flex align-items-center gap-2">
                            <div className="header-logo">

                            </div>
                            <div>
                                <h3 className="mb-0" style={{ fontSize: '16px', fontWeight: 'bold' }}>TV Shop Support</h3>
                                <small style={{ fontSize: '11px', opacity: 0.9 }}>Luôn sẵn sàng hỗ trợ</small>
                            </div>
                        </div>
                        <div className="header-controls">
                            <button
                                className="chat-widget-close"
                                onClick={() => setIsOpen(false)}
                                aria-label="Đóng"><FontAwesomeIcon icon={faTimes} /></button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="chat-widget-body" ref={chatBodyRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.type} ${msg.contentType === 'options' ? 'options-mode' : ''}`}>
                                {msg.type === 'bot' && (
                                    <div className="bot-avatar">
                                        <FontAwesomeIcon icon={faRobot} />
                                    </div>
                                )}
                                <div className="message-content-wrapper">
                                    <div className="message-bubble">
                                        {msg.contentType === 'options' ? msg.content : <div className="text-content">{msg.content}</div>}
                                    </div>
                                    <span className="message-time">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Input */}
                    {isLiveChat && (
                        <div className="chat-widget-input-area">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                onClick={handleSendMessage}
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatWidget;
