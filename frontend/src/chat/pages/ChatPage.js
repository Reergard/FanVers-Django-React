import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import CreateChatModal from '../components/CreateChatModal';
import chatApi from '../../api/chat/api';
import '../css/ChatPage.css';
import websocketService from '../services/websocketService';
import { BreadCrumb } from '../../main/components/BreadCrumb';

const ChatPage = () => {
    console.log('🔌 [ChatPage] === COMPONENT RENDER ===');
    console.log('🔌 [ChatPage] Time:', new Date().toISOString());
    
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const [showChatWindow, setShowChatWindow] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    console.log('🔌 [ChatPage] Current state:', {
        isMobile,
        showChatWindow,
        isAuthenticated,
        chatsCount: chats.length,
        selectedChatId: selectedChat?.id,
        showCreateModal,
        loading,
        error
    });

    const loadChats = async () => {
        console.log('🔌 [ChatPage] === LOAD_CHATS FUNCTION START ===');
        console.log('🔌 [ChatPage] Time:', new Date().toISOString());
        console.log('🔌 [ChatPage] Current chats count:', chats.length);
        console.log('🔌 [ChatPage] WebSocket connected:', websocketService.isConnected);
        
        try {
            console.log('🔌 [ChatPage] Setting loading to true...');
            setLoading(true);
            
            console.log('🔌 [ChatPage] Calling chatApi.getChatList...');
            const chatList = await chatApi.getChatList();
            console.log('🔌 [ChatPage] ✅ Chats loaded:', chatList);
            console.log('🔌 [ChatPage] New chats count:', chatList.length);
            
            setChats(chatList);
            console.log('🔌 [ChatPage] ✅ Chats state updated');
            
        } catch (error) {
            console.log('🔌 [ChatPage] ❌ Error loading chats:', error);
            console.log('🔌 [ChatPage] Error response status:', error.response?.status);
            setError('Помилка завантаження чатів');
            
            if (error.response?.status === 401) {
                console.log('🔌 [ChatPage] ⚠️ 401 Unauthorized, redirecting to login...');
                navigate('/login');
            }
        } finally {
            console.log('🔌 [ChatPage] Setting loading to false...');
            setLoading(false);
            console.log('🔌 [ChatPage] === LOAD_CHATS FUNCTION END ===');
        }
    };

    useEffect(() => {
        console.log('🔌 [ChatPage] === AUTH_CHECK useEffect START ===');
        console.log('🔌 [ChatPage] Time:', new Date().toISOString());
        console.log('🔌 [ChatPage] isAuthenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('🔌 [ChatPage] ❌ User not authenticated, redirecting to login...');
            navigate('/login');
            return;
        }
        
        console.log('🔌 [ChatPage] ✅ User authenticated');
        console.log('🔌 [ChatPage] === AUTH_CHECK useEffect END ===');
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        console.log('🔌 [ChatPage] === MAIN_LOAD useEffect START ===');
        console.log('🔌 [ChatPage] Time:', new Date().toISOString());
        console.log('🔌 [ChatPage] isAuthenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('🔌 [ChatPage] ❌ User not authenticated, redirecting to login...');
            navigate('/login');
            return;
        }

        console.log('🔌 [ChatPage] Loading chats...');
        loadChats();

        console.log('🔌 [ChatPage] Setting up chat refresh interval...');
        const intervalId = setInterval(() => {
            console.log('🔌 [ChatPage] === REFRESH_INTERVAL ===');
            console.log('🔌 [ChatPage] Time:', new Date().toISOString());
            console.log('🔌 [ChatPage] WebSocket connected:', websocketService.isConnected);
            
            if (websocketService.isConnected) {
                console.log('🔌 [ChatPage] WebSocket connected, refreshing chats...');
                loadChats();
            } else {
                console.log('🔌 [ChatPage] WebSocket not connected, skipping refresh');
            }
        }, 15000);

        console.log('🔌 [ChatPage] ✅ Chat refresh interval set to 15 seconds');
        
        return () => {
            console.log('🔌 [ChatPage] === MAIN_LOAD useEffect CLEANUP ===');
            console.log('🔌 [ChatPage] Time:', new Date().toISOString());
            console.log('🔌 [ChatPage] Clearing interval...');
            clearInterval(intervalId);
            console.log('🔌 [ChatPage] ✅ Interval cleared');
            console.log('🔌 [ChatPage] === MAIN_LOAD useEffect CLEANUP END ===');
        };
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        console.log('🔌 [ChatPage] === RESIZE useEffect START ===');
        console.log('🔌 [ChatPage] Time:', new Date().toISOString());
        console.log('🔌 [ChatPage] Window width:', window.innerWidth);
        console.log('🔌 [ChatPage] Current isMobile:', isMobile);
        
        const handleResize = () => {
            console.log('🔌 [ChatPage] === RESIZE_HANDLER ===');
            console.log('🔌 [ChatPage] Time:', new Date().toISOString());
            console.log('🔌 [ChatPage] New window width:', window.innerWidth);
            console.log('🔌 [ChatPage] New isMobile:', window.innerWidth <= 600);
            
            const newIsMobile = window.innerWidth <= 600;
            setIsMobile(newIsMobile);
            
            if (window.innerWidth > 600) {
                console.log('🔌 [ChatPage] Desktop view, hiding chat window...');
                setShowChatWindow(false);
            }
            
            console.log('🔌 [ChatPage] ✅ Resize handled');
        };
        
        console.log('🔌 [ChatPage] Adding resize event listener...');
        window.addEventListener("resize", handleResize);
        
        return () => {
            console.log('🔌 [ChatPage] === RESIZE useEffect CLEANUP ===');
            console.log('🔌 [ChatPage] Time:', new Date().toISOString());
            console.log('🔌 [ChatPage] Removing resize event listener...');
            window.removeEventListener("resize", handleResize);
            console.log('🔌 [ChatPage] ✅ Resize event listener removed');
            console.log('🔌 [ChatPage] === RESIZE useEffect CLEANUP END ===');
        };
    }, []);

    const handleOpenCreateModal = useCallback(() => {
        console.log('🔌 [ChatPage] === HANDLE_OPEN_CREATE_MODAL ===');
        console.log('🔌 [ChatPage] Time:', new Date().toISOString());
        console.log('🔌 [ChatPage] isAuthenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('🔌 [ChatPage] ❌ User not authenticated, showing alert...');
            alert('Будь ласка, увійдіть у систему');
            navigate('/login');
            return;
        }
        
        console.log('🔌 [ChatPage] Setting showCreateModal to true...');
        setShowCreateModal(true);
        console.log('🔌 [ChatPage] ✅ Create modal opened');
    }, [isAuthenticated, navigate]);

    const handleCreateChat = async (username, message) => {
        console.log('🔌 [ChatPage] === HANDLE_CREATE_CHAT START ===');
        console.log('🔌 [ChatPage] Time:', new Date().toISOString());
        console.log('🔌 [ChatPage] Username:', username);
        console.log('🔌 [ChatPage] Message:', message);
        
        try {
            if (!username.trim()) {
                console.log('🔌 [ChatPage] ❌ Empty username');
                alert('Будь ласка, введіть ім\'я користувача');
                return;
            }

            console.log('🔌 [ChatPage] Setting loading to true...');
            setLoading(true);
            setError(null);
            
            console.log('🔌 [ChatPage] Creating chat with:', { username, message });
            const newChat = await chatApi.createChat(username, message);
            console.log('🔌 [ChatPage] ✅ Chat created:', newChat);
            
            console.log('🔌 [ChatPage] Closing create modal...');
            setShowCreateModal(false);
            
            console.log('🔌 [ChatPage] Reloading chats...');
            await loadChats();
            
            console.log('🔌 [ChatPage] Setting selected chat...');
            setSelectedChat(newChat);
            console.log('🔌 [ChatPage] ✅ Chat creation completed successfully');
            
        } catch (error) {
            console.log('🔌 [ChatPage] ❌ Error creating chat:', error);
            console.log('🔌 [ChatPage] Error response status:', error.response?.status);
            console.log('🔌 [ChatPage] Error response data:', error.response?.data);
            
            if (error.response?.status === 401) {
                console.log('🔌 [ChatPage] ⚠️ 401 Unauthorized, redirecting to login...');
                setError('Необхідна авторизація');
                navigate('/login');
            } 
            else if (error.response?.status === 404) {
                console.log('🔌 [ChatPage] ⚠️ 404 User not found');
                alert('Користувач не знайдений');
            }
            else if (error.response?.status === 400) {
                console.log('🔌 [ChatPage] ⚠️ 400 Bad request');
                alert(error.response?.data?.error || 'Помилка при створенні чату');
            }
            else {
                console.log('🔌 [ChatPage] ⚠️ Unknown error');
                setError('Помилка під час створення чату');
                alert('Невідома помилка: ' + (error.message || 'Спробуйте пізніше'));
            }
        } finally {
            console.log('🔌 [ChatPage] Setting loading to false...');
            setLoading(false);
            console.log('🔌 [ChatPage] === HANDLE_CREATE_CHAT END ===');
        }
    };

    const handleCloseModal = () => {
        console.log('🔌 [ChatPage] === HANDLE_CLOSE_MODAL ===');
        console.log('🔌 [ChatPage] Time:', new Date().toISOString());
        console.log('🔌 [ChatPage] Closing create modal...');
        
        setShowCreateModal(false);
        console.log('🔌 [ChatPage] ✅ Create modal closed');
    };

    const handleSelectChat = (chat) => {
        console.log('🔌 [ChatPage] === HANDLE_SELECT_CHAT ===');
        console.log('🔌 [ChatPage] Time:', new Date().toISOString());
        console.log('🔌 [ChatPage] Selected chat:', chat);
        console.log('🔌 [ChatPage] Current selected chat:', selectedChat);
        console.log('🔌 [ChatPage] isMobile:', isMobile);
        
        setSelectedChat(chat);
        console.log('🔌 [ChatPage] ✅ Selected chat updated');
        
        if (isMobile) {
            console.log('🔌 [ChatPage] Mobile view, showing chat window...');
            setShowChatWindow(true);
        }
        
        console.log('🔌 [ChatPage] ✅ Chat selection completed');
    };

    const handleDeleteChat = (chatId) => {
        console.log('🔌 [ChatPage] === HANDLE_DELETE_CHAT ===');
        console.log('🔌 [ChatPage] Time:', new Date().toISOString());
        console.log('🔌 [ChatPage] Chat ID to delete:', chatId);
        console.log('🔌 [ChatPage] Current chats count:', chats.length);
        console.log('🔌 [ChatPage] Current selected chat ID:', selectedChat?.id);
        
        console.log('🔌 [ChatPage] Filtering out deleted chat...');
        setChats(chats.filter(chat => chat.id !== chatId));
        
        if (selectedChat?.id === chatId) {
            console.log('🔌 [ChatPage] Deleted chat was selected, clearing selection...');
            setSelectedChat(null);
        }
        
        console.log('🔌 [ChatPage] ✅ Chat deletion completed');
    };

    if (loading && !chats.length) {
        return <div className="chat-page loading">Завантаження чатів...</div>;
    }

    return (
        <div className="chat-page">
            <BreadCrumb 
                items={[
                    { label: 'Головна', path: '/' },
                    { label: 'Чат', path: '/chat' }
                ]}
            />
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            <div className="chat-container">
                <ChatList 
                    chats={chats}
                    selectedChat={selectedChat}
                    onSelectChat={handleSelectChat}
                    onCreateChat={handleOpenCreateModal}
                    onOpenChat={() => isMobile && setShowChatWindow(true)} 
                />
                
                {/* Исправляем логику рендеринга ChatWindow */}
                {selectedChat && (
                    <ChatWindow 
                        key={`chat-${selectedChat.id}`} // Добавляем уникальный ключ
                        chat={selectedChat}
                        onDeleteChat={handleDeleteChat}
                        onClose={() => setShowChatWindow(false)} 
                    />
                )}
            </div>
            
            {showCreateModal && (
                <CreateChatModal
                    onClose={handleCloseModal}
                    onCreateChat={handleCreateChat}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default ChatPage;
