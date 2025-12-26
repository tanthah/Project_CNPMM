import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button } from 'react-bootstrap';
import io from 'socket.io-client';
import './css/AdminDashboard.css'; // Reuse dashboard styles for now

const AdminChat = () => {
    const [activeChats, setActiveChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState({}); // { userId: [msg1, msg2] }
    const [reply, setReply] = useState('');
    const socket = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Connect to socket
        socket.current = io('http://localhost:4000');

        socket.current.emit('admin_join_chat');

        socket.current.on('new_chat_request', (data) => {
            setActiveChats(prev => {
                if (prev.find(c => c.userId === data.userId)) return prev;
                return [...prev, data];
            });
            // Init empty messages array if new
            setMessages(prev => ({
                ...prev,
                [data.userId]: prev[data.userId] || []
            }));

            // Optionally play sound or notification
            alert(`New support request from ${data.userId}`);
        });

        socket.current.on('receive_message', (data) => {
            const { userId, message, from, timestamp } = data;

            // If message from user, ensure they are in active chats
            if (from === 'user') {
                setActiveChats(prev => {
                    if (prev.find(c => c.userId === userId)) return prev;
                    return [...prev, { userId, name: data.name || 'Guest' }];
                });
            }

            setMessages(prev => {
                const chatMsgs = prev[userId] || [];
                return {
                    ...prev,
                    [userId]: [...chatMsgs, { from, message, timestamp }]
                };
            });
        });

        return () => {
            if (socket.current) socket.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, selectedChat]);

    const handleSendReply = (e) => {
        e.preventDefault();
        if (!reply.trim() || !selectedChat) return;

        socket.current.emit('admin_reply', {
            userId: selectedChat,
            message: reply
        });

        // Add to local UI
        setMessages(prev => ({
            ...prev,
            [selectedChat]: [...(prev[selectedChat] || []), {
                from: 'bot', // admin is bot side in user view
                message: reply,
                timestamp: new Date()
            }]
        }));

        setReply('');
    };

    return (
        <Container fluid className="p-4 admin-dashboard">
            <h2 className="mb-4">Hỗ trợ trực tuyến</h2>
            <Row>
                <Col md={4}>
                    <Card style={{ height: '70vh' }}>
                        <Card.Header>Khách hàng đang chờ</Card.Header>
                        <ListGroup variant="flush" style={{ overflowY: 'auto', height: '100%' }}>
                            {activeChats.length === 0 && <div className="p-3 text-muted text-center">Chưa có yêu cầu nào</div>}
                            {activeChats.map(chat => (
                                <ListGroup.Item
                                    key={chat.userId}
                                    action
                                    active={selectedChat === chat.userId}
                                    onClick={() => setSelectedChat(chat.userId)}
                                >
                                    <strong>{chat.name || 'Khách hàng'}</strong>
                                    <br />
                                    <small className="text-muted">ID: {chat.userId}</small>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card style={{ height: '70vh' }}>
                        <Card.Header>
                            {selectedChat ? `Chat với: ${selectedChat}` : 'Chọn khách hàng để chat'}
                        </Card.Header>
                        <Card.Body className="d-flex flex-column">
                            {selectedChat ? (
                                <>
                                    <div className="flex-grow-1 mb-3" style={{ overflowY: 'auto', border: '1px solid #eee', padding: '15px', borderRadius: '5px' }}>
                                        {(messages[selectedChat] || []).map((msg, idx) => (
                                            <div key={idx} className={`d-flex mb-2 ${msg.from === 'bot' ? 'justify-content-end' : 'justify-content-start'}`}>
                                                <div style={{
                                                    maxWidth: '70%',
                                                    padding: '10px 15px',
                                                    borderRadius: '15px',
                                                    background: msg.from === 'bot' ? '#007bff' : '#f1f0f0',
                                                    color: msg.from === 'bot' ? 'white' : 'black'
                                                }}>
                                                    {msg.message}
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '5px', textAlign: 'right' }}>
                                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <Form onSubmit={handleSendReply}>
                                        <div className="d-flex gap-2">
                                            <Form.Control
                                                type="text"
                                                placeholder="Nhập tin nhắn..."
                                                value={reply}
                                                onChange={e => setReply(e.target.value)}
                                            />
                                            <Button type="submit" variant="primary">Gửi</Button>
                                        </div>
                                    </Form>
                                </>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                    Vui lòng chọn một cuộc hội thoại bên trái
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminChat;
