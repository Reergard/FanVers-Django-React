import React from "react";
import "../css/ChatList.css";
import Status from "../../main/pages/img/status.png";
import { ProfileImage } from "../../main/components/Header/ProfileImage";
import { FALLBACK_IMAGES, IMAGE_SIZES } from "../../constants/fallbackImages";
import Message from "../../main/pages/img/message.svg";

const ChatList = ({
  chats,
  selectedChat,
  onSelectChat,
  onCreateChat,
  onOpenChat,
}) => {
  const handleCreateClick = (e) => {
    e.preventDefault();
    console.log("Create chat button clicked");
    if (typeof onCreateChat === "function") {
      onCreateChat();
    } else {
      console.error("onCreateChat is not a function");
    }
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
          <div className="one-chat" onClick={onOpenChat}>
            <div className="info-chat">
              <div className="img-chat">
                <ProfileImage
                  src={null} // Нет изображения, используем fallback
                  alt="Аватар чату"
                  className="chat-avatar"
                  size={IMAGE_SIZES.USER_LIST}
                  fallbackSmall={FALLBACK_IMAGES.SMALL}
                  fallbackLarge={FALLBACK_IMAGES.LARGE}
                />
              </div>
              <div className="name-chat-block">
                <div className="name-chat">Привид</div>
                <div className="message-list-chat">
                  Доброго дня. Чи не хотілиб ви перекласти...
                </div>
              </div>
            </div>
            <div className="status-chat">
              <img src={Status} alt="Статус чату" />
            </div>
          </div>
          <div className="one-chat" onClick={onOpenChat}>
            <div className="info-chat">
              <div className="img-chat">
                <ProfileImage
                  src={null} // Нет изображения, используем fallback
                  alt="Аватар чату"
                  className="chat-avatar"
                  size={IMAGE_SIZES.USER_LIST}
                  fallbackSmall={FALLBACK_IMAGES.SMALL}
                  fallbackLarge={FALLBACK_IMAGES.LARGE}
                />
              </div>
              <div className="name-chat-block">
                <div className="name-chat">Привид</div>
                <div className="message-list-chat">
                  Доброго дня. Чи не хотілиб ви перекласти...
                </div>
              </div>
            </div>
            <div className="status-chat">
              <img src={Status} alt="Статус чату" />
            </div>
          </div>
        </div>
        {/* {chats && chats.length > 0 ? (
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
                    <div className="no-chats">Немає активних чатів</div>
                )} */}
      </div>
    </div>
  );
};

export default ChatList;
