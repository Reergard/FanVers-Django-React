import React from 'react';
import '../css/ChatList.css';

const ChatList = ({ chats, selectedChat, onSelectChat, onCreateChat }) => {
    const handleCreateClick = (e) => {
        e.preventDefault();
        console.log('Create chat button clicked');
        if (typeof onCreateChat === 'function') {
            onCreateChat();
        } else {
            console.error('onCreateChat is not a function');
        }
    };

    return (
        <div className="chat-list">
            <button 
                className="create-chat-btn"
                onClick={handleCreateClick}
            >
                Создать новый чат
            </button>
            
            <div className="chats-container">
                {chats && chats.length > 0 ? (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                            onClick={() => onSelectChat(chat)}
                        >
                            <div className="chat-info">
                                <span className="chat-name">
                                    {chat.participants
                                        .filter(p => p.username !== localStorage.getItem('username'))
                                        .map(p => p.username)
                                        .join(', ')}
                                </span>
                                {chat.last_message && (
                                    <span className="last-message">
                                        {chat.last_message.content}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-chats">Нет активных чатов</div>
                )}
            </div>
        </div>
    );
};

export default ChatList;