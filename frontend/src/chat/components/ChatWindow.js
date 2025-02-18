import React, { useState, useEffect, useRef } from "react";
import chatApi from "../api";
import "../css/ChatList.css";
import "../css/ChatWindow.css";
import webSocketService from "../services/websocketService";
import Status from "../../main/pages/img/status.png";
import ImgChat from "../../main/pages/img/hamster.webp";
import RightArrow from "../../main/pages/img/right-arrow.png";

const ChatWindow = ({ chat, onDeleteChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Завантаження повідомлень
  // useEffect(() => {
  //     const loadMessages = async () => {
  //         if (!chat?.id) return;

  //         try {
  //             setLoading(true);
  //             setError(null);
  //             const chatMessages = await chatApi.getChatMessages(chat.id);
  //             setMessages(chatMessages);
  //         } catch (error) {
  //             setError('Помилка завантаження повідомлень');
  //         } finally {
  //             setLoading(false);
  //         }
  //     };

  //     loadMessages();
  //     // Додаємо інтервал для періодичного оновлення
  //     const interval = setInterval(loadMessages, 5000);
  //     return () => clearInterval(interval);
  // }, [chat?.id]);

  useEffect(() => {
    if (!chat?.id) return;

    const connectWebSocket = async () => {
      try {
        await webSocketService.connect(chat.id);
        setWsConnected(true);

        webSocketService.addMessageHandler((data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: data.id,
              content: data.message,
              sender: { username: data.sender },
              created_at: data.timestamp,
            },
          ]);
        });
      } catch (error) {
        setError("Помилка підключення до чату");
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
      setNewMessage("");
    } catch (error) {
      setError("Помилка відправки повідомлення");
    }
  };

  const handleDeleteChat = async () => {
    try {
      await chatApi.deleteChat(chat.id);
      onDeleteChat(chat.id);
    } catch (error) {
      setError("Помилка при видаленні чату");
    }
  };

  // if (!chat) {
  //     return (
  //         <div className="chat-window empty-chat">
  //             <p>Оберіть чат для початку спілкування</p>
  //         </div>
  //     );
  // }

  // const otherParticipant = chat.participants?.find(
  //     p => p.username !== localStorage.getItem('username')
  // );

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="info-chat">
          <div className="img-chat">
            <img src={ImgChat} />
          </div>
          <div className="name-chat">Привид</div>
          <div className="status-chat-header">
            <img src={Status} />
          </div>
        </div>
        <div className="other-info-header">
          <span>Останній вхід:</span>
          <p>15.02.2023/Онлайн</p>
        </div>
        {/* <h3>{otherParticipant?.username || 'Чат'}</h3> */}
        {/* <button onClick={() => setShowDeleteModal(true)} className="delete-chat-button">
                    Видалити чат
                </button> */}
      </div>

      {/* {showDeleteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Ви впевнені що хочете видалити даний чат?</p>
                        <button onClick={handleDeleteChat}>Так</button>
                        <button onClick={() => setShowDeleteModal(false)}>Ні</button>
                    </div>
                </div>
            )} */}

      <div className="messages-container">
        <div className="message">
          <div className="img-chat">
            <img src={ImgChat} />
          </div>
          <span>
            Доброго дня. Чи не хотілиб ви перекласти мій авторський твір?
            Доброго дня. Чи не хотілиб ви перекласти мій авторський твір?
          </span>
        </div>
        <div className="message other_user">
          <div className="img-chat">
            <img src={ImgChat} />
          </div>
          <span>
            Доброго дня. Чи не хотілиб ви перекласти мій авторський твір?
            Доброго дня. Чи не хотілиб ви перекласти мій авторський твір?
          </span>
        </div>
        {/* {loading && <div className="loading">Завантаження повідомлень...</div>}
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
                        <p>У цьому чаті поки немає повідомлень</p>
                    </div>
                )}
                <div ref={messagesEndRef} /> */}
      </div>
      <div className="container-message-input-form">
        <form className="message-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введіть повідомлення..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newMessage.trim()}>
            <img src={RightArrow} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
