import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import CreateChatModal from '../components/CreateChatModal';
import chatApi from '../api';
import '../css/ChatPage.css';
import websocketService from '../services/websocketService';
import { BreadCrumb } from '../../main/components/BreadCrumb';


const ChatPage = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const [showChatWindow, setShowChatWindow] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    // const loadChats = async () => {
    //     try {
    //         setLoading(true);
    //         const chatList = await chatApi.getChatList();
    //         setChats(chatList);
    //     } catch (error) {
    //         console.error('Error loading chats:', error);
    //         setError('Помилка завантаження чатів');
    //         if (error.response?.status === 401) {
    //             navigate('/login');
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated, navigate]);

    // useEffect(() => {
    //     if (!isAuthenticated) {
    //         navigate('/login');
    //         return;
    //     }

    //     loadChats();

    //     const intervalId = setInterval(() => {
    //         if (websocketService.isConnected) {
    //             loadChats();
    //         }
    //     }, 15000);

    //     return () => clearInterval(intervalId);
    // }, [isAuthenticated, navigate]);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
            if (window.innerWidth > 600) {
                setShowChatWindow(false); // Если расширили экран, показываем оба компонента
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    // const handleOpenCreateModal = useCallback(() => {
    //     console.log('handleOpenCreateModal called');
    //     if (!isAuthenticated) {
    //         alert('Будь ласка, увійдіть у систему');
    //         navigate('/login');
    //         return;
    //     }
    //     console.log('Setting showCreateModal to true');
    //     setShowCreateModal(true);
    // }, [isAuthenticated, navigate]);

    const handleCreateChat = async (username, message) => {
        try {
            if (!username.trim()) {
                alert('Будь ласка, введіть ім\'я користувача');
                return;
            }

            setLoading(true);
            setError(null);
            
            console.log('Creating chat with:', { username, message });
            const newChat = await chatApi.createChat(username, message);
            console.log('Chat created:', newChat);
            
            setShowCreateModal(false);
            // await loadChats(); 
            setSelectedChat(newChat);
            
        } catch (error) {
            console.error('Error creating chat:', error);
            
            if (error.response?.status === 401) {
                setError('Необхідна авторизація');
                navigate('/login');
            } 
            else if (error.response?.status === 404) {
                alert('Користувач не знайдений');
            }
            else if (error.response?.status === 400) {
                alert(error.response?.data?.error || 'Помилка при створенні чату');
            }
            else {
                setError('Помилка під час створення чату');
                alert('Невідома помилка: ' + (error.message || 'Спробуйте пізніше'));
            }
        } finally {
            setLoading(false);
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

    // if (loading && !chats.length) {
    //     return <div className="chat-page loading">Загрузка чатiв...</div>;
    // }

    return (
        <div className="chat-page">
             <BreadCrumb
                    items={[
                      { href: "/", label: "Головна" },
                      { href: "/chat", label: "ChatVerse" },
                    ]}
                  />
            {error && <div className="error-message">{error}</div>}
            <div className="chat-container">
            {!showChatWindow && (
                    <ChatList onOpenChat={() => isMobile && setShowChatWindow(true)} />
                )}
                {(showChatWindow || !isMobile) && <ChatWindow onClose={() => setShowChatWindow(false)} />}
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
