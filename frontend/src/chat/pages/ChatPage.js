import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import CreateChatModal from '../components/CreateChatModal';
import chatApi from '../api';
import '../css/ChatPage.css';
import websocketService from '../services/websocketService';

const ChatPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Вынесем loadChats как отдельную функцию
    const loadChats = async () => {
        try {
            setLoading(true);
            const chatList = await chatApi.getChatList();
            setChats(chatList);
        } catch (error) {
            console.error('Error loading chats:', error);
            setError('Ошибка загрузки чатов');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        loadChats();

        const intervalId = setInterval(() => {
            if (websocketService.isConnected) {
                loadChats();
            }
        }, 15000);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, navigate]);

    const handleOpenCreateModal = useCallback(() => {
        console.log('handleOpenCreateModal called');
        if (!isAuthenticated) {
            alert('Пожалуйста, войдите в систему');
            navigate('/login');
            return;
        }
        console.log('Setting showCreateModal to true');
        setShowCreateModal(true);
    }, [isAuthenticated, navigate]);

    const handleCreateChat = async (username, message) => {
        try {
            console.log('Creating chat with:', { username, message });
            const newChat = await chatApi.createChat(username, message);
            console.log('Chat created:', newChat);
            setShowCreateModal(false);
            await loadChats(); // Теперь функция доступна здесь
            setSelectedChat(newChat);
        } catch (error) {
            console.error('Error creating chat:', error);
            setError('Ошибка при создании чата');
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                console.error('Error creating chat:', error);
                alert('Ошибка при создании чата: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    const handleCloseModal = () => {
        console.log('Closing modal');
        setShowCreateModal(false);
    };

    const handleDeleteChat = (chatId) => {
        setChats(chats.filter(chat => chat.id !== chatId));
        setSelectedChat(null);
    };

    if (loading && !chats.length) {
        return <div className="chat-page loading">Загрузка чатов...</div>;
    }

    return (
        <div className="chat-page">
            {error && <div className="error-message">{error}</div>}
            <div className="chat-container">
                <ChatList
                    chats={chats}
                    selectedChat={selectedChat}
                    onSelectChat={setSelectedChat}
                    onCreateChat={handleOpenCreateModal}
                    loading={loading}
                />
                {selectedChat && (
                    <ChatWindow
                        chat={selectedChat}
                        onDeleteChat={handleDeleteChat}
                    />
                )}
            </div>
            {showCreateModal && (
                <CreateChatModal
                    onClose={handleCloseModal}
                    onSubmit={handleCreateChat}
                />
            )}
        </div>
    );
};

export default ChatPage;
