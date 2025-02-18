import React from "react";
import "../css/ChatList.css";
import Status from "../../main/pages/img/status.png";
import ImgChat from "../../main/pages/img/hamster.webp";

const ChatList = ({ chats, selectedChat, onSelectChat, onCreateChat }) => {
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
      <button className="create-chat-btn" onClick={handleCreateClick}>
        Створити чат
      </button>

      <div className="chats-container">
        <div className="existing-chats">
          <div className="one-chat">
            <div className="info-chat">
              <div className="img-chat">
                <img src={ImgChat} />
              </div>
              <div className="name-chat">Привид</div>
            </div>
            <div className="status-chat">
              <img src={Status} />
            </div>
          </div>
          <div className="one-chat">
            <div className="info-chat">
              <div className="img-chat">
                <img src={ImgChat} />
              </div>
              <div className="name-chat">Привид</div>
            </div>
            <div className="status-chat">
              <img src={Status} />
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
