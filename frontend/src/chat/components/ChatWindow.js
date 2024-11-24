import React, { useState, useEffect, useRef } from 'react';
import chatApi from '../api';
import '../css/ChatWindow.css';
import webSocketService from '../services/websocketService';

const ChatWindow = ({ chat, onDeleteChat }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Загрузка сообщений
    useEffect(() => {
        const loadMessages = async () => {
            if (!chat?.id) return;
            
            try {
                setLoading(true);
                setError(null);
                const chatMessages = await chatApi.getChatMessages(chat.id);
                setMessages(chatMessages);
            } catch (error) {
                console.error('Error loading messages:', error);
                setError('Ошибка загрузки сообщений');
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
        // Добавляем интервал для периодического обновления
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [chat?.id]);

    useEffect(() => {
        if (!chat?.id) return;

        const connectWebSocket = async () => {
            try {
                await webSocketService.connect(chat.id);
                setWsConnected(true);
                
                webSocketService.addMessageHandler((data) => {
                    setMessages(prev => [...prev, {
                        id: data.id,
                        content: data.message,
                        sender: { username: data.sender },
                        created_at: data.timestamp
                    }]);
                });
            } catch (error) {
                console.error('WebSocket connection error:', error);
                setError('Ошибка подключения к чату');
            }
        };

        connectWebSocket();

        return () => {
            webSocketService.disconnect();
            setWsConnected(false);
        };
    }, [chat?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chat?.id || !wsConnected) return;

        try {
            setError(null);
            webSocketService.sendMessage(newMessage.trim());
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Ошибка отправки сообщения');
        }
    };

    const handleDeleteChat = async () => {
        try {
            console.log('Attempting to delete chat:', chat.id);
            await chatApi.deleteChat(chat.id);
            console.log('Chat deleted successfully');
            onDeleteChat(chat.id);
        } catch (error) {
            console.error('Error deleting chat:', error);
            setError('Ошибка при удалении чата');
        }
    };

    if (!chat) {
        return (
            <div className="chat-window empty-chat">
                <p>Выберите чат для начала общения</p>
            </div>
        );
    }

    const otherParticipant = chat.participants?.find(
        p => p.username !== localStorage.getItem('username')
    );

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>{otherParticipant?.username || 'Чат'}</h3>
                <button onClick={() => setShowDeleteModal(true)} className="delete-chat-button">
                    Удалить чат
                </button>
            </div>

            {showDeleteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Ви впевнені що хочете видалити даний чат?</p>
                        <button onClick={handleDeleteChat}>Так</button>
                        <button onClick={() => setShowDeleteModal(false)}>Ні</button>
                    </div>
                </div>
            )}

            <div className="messages-container">
                {loading && <div className="loading">Загрузка сообщений...</div>}
                {error && <div className="error-message">{error}</div>}
                {!loading && !error && Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${
                                message.sender.username === localStorage.getItem('username')
                                    ? 'sent'
                                    : 'received'
                            }`}
                        >
                            <div className="message-content">
                                <p>{message.content}</p>
                                <span className="message-time">
                                    {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-messages">
                        <p>В этом чате пока нет сообщений</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !newMessage.trim()}>
                    Отправить
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;