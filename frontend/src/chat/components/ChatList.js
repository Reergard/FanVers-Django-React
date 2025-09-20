import React from "react";
import { useSelector } from 'react-redux';
import "../css/ChatList.css";
import Status from '../../main/pages/img/status.png';
import { ProfileImage } from '../../main/components/Header/ProfileImage';
import { FALLBACK_IMAGES, IMAGE_SIZES } from "../../constants/fallbackImages";
import Message from '../../main/pages/img/message.svg';

const ChatList = ({
  chats,
  selectedChat,
  onSelectChat,
  onCreateChat,
  onOpenChat,
}) => {
  // Получаем текущего пользователя из Redux store
  const { userInfo } = useSelector(state => state.auth);
  const currentUsername = userInfo?.username;
  
  // Отладочная информация для проверки Redux state
  console.log('🔍 [ChatList] Redux auth state:', useSelector(state => state.auth));
  console.log('🔍 [ChatList] userInfo:', userInfo);
  console.log('🔍 [ChatList] currentUsername:', currentUsername);
  
  // Добавляем fallback для currentUsername
  const username = currentUsername || localStorage.getItem('username');
  console.log('🔍 [ChatList] Final username:', username);

  const handleCreateClick = (e) => {
    e.preventDefault();
    console.log("Create chat button clicked");
    if (typeof onCreateChat === "function") {
      onCreateChat();
    } else {
      console.error("onCreateChat is not a function");
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat.participants || chat.participants.length === 0) return null;
    
    // Отладочная информация
    console.log('🔍 [ChatList] getOtherParticipant:', {
      currentUsername,
      participants: chat.participants.map(p => p.username),
      chatId: chat.id
    });
    
    // Используем username из Redux store вместо localStorage
    // Если currentUsername не определен, используем localStorage как fallback
    const finalUsername = currentUsername || localStorage.getItem('username');
    const otherParticipant = chat.participants.find(p => p.username !== finalUsername) || chat.participants[0];
    
    console.log('🔍 [ChatList] Selected participant:', otherParticipant?.username);
    return otherParticipant;
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="chat-list">
      <div className="block-create-chat">
        <div className="line-create"></div>
        <button className="create-chat-btn" onClick={handleCreateClick}>
          <img src={Message} alt="Створити чат" />
          <span>Створити чат</span>
        </button>
      </div>
      <div className="chats-container">
        <div className="existing-chats">
          {chats && chats.length > 0 ? (
            chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              const lastMessage = chat.last_message;
              
              return (
                <div 
                  key={chat.id} 
                  className={`one-chat ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="info-chat">
                    <div className="img-chat">
                      <ProfileImage
                        src={otherParticipant?.profile_image}
                        alt={`Аватар ${otherParticipant?.username || 'користувача'}`}
                        className="chat-avatar"
                        size={IMAGE_SIZES.USER_LIST}
                        fallbackSmall={FALLBACK_IMAGES.SMALL}
                        fallbackLarge={FALLBACK_IMAGES.LARGE}
                      />
                    </div>
                    <div className="name-chat-block">
                      <div className="name-chat">
                        {otherParticipant?.username || 'Невідомий користувач'}
                      </div>
                      <div className="message-list-chat">
                        {lastMessage ? truncateMessage(lastMessage.content) : 'Немає повідомлень'}
                      </div>
                    </div>
                  </div>
                  <div className="status-chat">
                    <img src={Status} alt="Статус чату" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-chats">Немає активних чатів</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
