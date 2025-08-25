import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './ChatPage.css';

const ChatPage = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [username, setUsername] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);
    const [showUsernameModal, setShowUsernameModal] = useState(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const connectToWebSocket = () => {
        if (!username.trim()) {
            console.log('🔌 [ChatPage] ❌ Empty username');
            alert('Будь ласка, введіть ім\'я користувача');
            return;
        }

        const wsUrl = `ws://localhost:8000/ws/chat/${roomId}/`;
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
            console.log('🔌 [ChatPage] ✅ WebSocket connected');
            setIsConnected(true);
            setShowUsernameModal(false);
            
            // Відправляємо повідомлення про підключення користувача
            websocket.send(JSON.stringify({
                type: 'user_join',
                username: username,
                room: roomId
            }));
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('🔌 [ChatPage] 📨 Received message:', data);
                
                if (data.type === 'chat_message') {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        username: data.username,
                        message: data.message,
                        timestamp: new Date().toLocaleTimeString(),
                        isOwn: data.username === username
                    }]);
                } else if (data.type === 'user_join') {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        username: 'System',
                        message: `${data.username} приєднався до чату`,
                        timestamp: new Date().toLocaleTimeString(),
                        isSystem: true
                    }]);
                } else if (data.type === 'user_leave') {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        username: 'System',
                        message: `${data.username} покинув чат`,
                        timestamp: new Date().toLocaleTimeString(),
                        isSystem: true
                    }]);
                }
            } catch (error) {
                console.error('🔌 [ChatPage] ❌ Error parsing message:', error);
            }
        };

        websocket.onclose = () => {
            console.log('🔌 [ChatPage] ❌ WebSocket disconnected');
            setIsConnected(false);
            setMessages(prev => [...prev, {
                id: Date.now(),
                username: 'System',
                message: 'З\'єднання з сервером втрачено. Спробуйте перепідключитися.',
                timestamp: new Date().toLocaleTimeString(),
                isSystem: true
            }]);
        };

        websocket.onerror = (error) => {
            console.error('🔌 [ChatPage] ❌ WebSocket error:', error);
            setIsConnected(false);
        };

        setWs(websocket);
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !ws || !isConnected) return;

        const messageData = {
            type: 'chat_message',
            message: newMessage.trim(),
            username: username,
            room: roomId
        };

        ws.send(JSON.stringify(messageData));
        setNewMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const disconnect = () => {
        if (ws) {
            ws.close();
        }
        setIsConnected(false);
        setMessages([]);
        setShowUsernameModal(true);
    };

    useEffect(() => {
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [ws]);

    if (showUsernameModal) {
        return (
            <div className="username-modal">
                <div className="username-modal-content">
                    <h2>Введіть ваше ім\'я</h2>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ваше ім\'я"
                        onKeyPress={(e) => e.key === 'Enter' && connectToWebSocket()}
                    />
                    <button onClick={connectToWebSocket} disabled={!username.trim()}>
                        Приєднатися до чату
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <div className="chat-header">
                <h2>Чат - Кімната {roomId}</h2>
                <div className="connection-status">
                    <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? '🟢 Підключено' : '🔴 Відключено'}
                    </span>
                    <button onClick={disconnect} className="disconnect-btn">
                        Відключитися
                    </button>
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${msg.isOwn ? 'own-message' : ''} ${msg.isSystem ? 'system-message' : ''}`}
                    >
                        {!msg.isSystem && (
                            <div className="message-header">
                                <span className="username">{msg.username}</span>
                                <span className="timestamp">{msg.timestamp}</span>
                            </div>
                        )}
                        <div className="message-content">{msg.message}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введіть повідомлення..."
                    disabled={!isConnected}
                />
                <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    className="send-btn"
                >
                    Надіслати
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
