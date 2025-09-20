import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import chatApi from "../../api/chat/api";
import ConfirmationModal from "../../components/ConfirmationModal";
import "../css/ChatList.css";
import "../css/ChatWindow.css";
import webSocketService from "../services/websocketService";
import Status from "../../main/pages/img/status.png";
import { ProfileImage } from "../../main/components/Header/ProfileImage";
import { FALLBACK_IMAGES, IMAGE_SIZES } from "../../constants/fallbackImages";
import RightArrow from "../../main/pages/img/right-arrow.png";
import { markMessagesAsRead, addMessage, markChatAsRead } from "../chatSlice";

const ChatWindow = ({ chat, onDeleteChat, onClose }) => {
  console.log('🔌 [ChatWindow] === COMPONENT RENDER ===');
  console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
  console.log('🔌 [ChatWindow] Props:', { chat, onDeleteChat, onClose });
  console.log('🔌 [ChatWindow] Chat ID:', chat?.id);
  console.log('🔌 [ChatWindow] Chat participants:', chat?.participants);
  
  const dispatch = useDispatch();
  // Получаем текущего пользователя из Redux store
  const { userInfo } = useSelector(state => state.auth);
  const currentUsername = userInfo?.username;
  
  // Отладочная информация для проверки Redux state
  console.log('🔍 [ChatWindow] Redux auth state:', useSelector(state => state.auth));
  console.log('🔍 [ChatWindow] userInfo:', userInfo);
  console.log('🔍 [ChatWindow] currentUsername:', currentUsername);
  
  // Добавляем fallback для currentUsername
  const username = currentUsername || localStorage.getItem('username');
  console.log('🔍 [ChatWindow] Final username:', username);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  console.log('🔌 [ChatWindow] Current state:', {
    messagesCount: messages.length,
    newMessage,
    loading,
    error,
    wsConnected,
    showDeleteModal
  });

  useEffect(() => {
    console.log('🔌 [ChatWindow] === LOAD_MESSAGES useEffect START ===');
    console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
    console.log('🔌 [ChatWindow] Chat ID:', chat?.id);
    console.log('🔌 [ChatWindow] Loading state:', loading);
    
    if (!chat?.id) {
      console.log('🔌 [ChatWindow] ❌ No chat ID, skipping message load');
      return;
    }

    const loadMessages = async () => {
      console.log('🔌 [ChatWindow] === LOAD_MESSAGES FUNCTION START ===');
      console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
      console.log('🔌 [ChatWindow] Chat ID:', chat.id);
      
      try {
        console.log('🔌 [ChatWindow] Setting loading to true...');
        setLoading(true);
        setError(null);
        
        console.log('🔌 [ChatWindow] Calling chatApi.getChatMessages...');
        const chatMessages = await chatApi.getChatMessages(chat.id);
        console.log('🔌 [ChatWindow] ✅ Messages loaded:', chatMessages);
        console.log('🔌 [ChatWindow] Messages count:', chatMessages.length);
        
        setMessages(chatMessages);
        console.log('🔌 [ChatWindow] ✅ Messages state updated');
        
        // Отмечаем сообщения как прочитанные в Redux
        console.log('🔌 [ChatWindow] Marking messages as read in Redux...');
        dispatch(markMessagesAsRead(chat.id));
        console.log('🔌 [ChatWindow] ✅ Messages marked as read in Redux');
        
        // Отмечаем чат как прочитанный на сервере
        console.log('🔌 [ChatWindow] Marking chat as read on server...');
        dispatch(markChatAsRead(chat.id));
        console.log('🔌 [ChatWindow] ✅ Chat marked as read on server');
        
      } catch (error) {
        console.log('🔌 [ChatWindow] ❌ Error loading messages:', error);
        setError('Помилка завантаження повідомлень');
      } finally {
        console.log('🔌 [ChatWindow] Setting loading to false...');
        setLoading(false);
        console.log('🔌 [ChatWindow] === LOAD_MESSAGES FUNCTION END ===');
      }
    };

    loadMessages();
    console.log('🔌 [ChatWindow] === LOAD_MESSAGES useEffect END ===');
  }, [chat?.id, dispatch]);

  // WebSocket connection
  useEffect(() => {
    console.log('🔌 [ChatWindow] === WEBSOCKET useEffect START ===');
    console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
    console.log('🔌 [ChatWindow] Chat ID:', chat?.id);
    console.log('🔌 [ChatWindow] Current wsConnected state:', wsConnected);
    
    if (!chat?.id) {
      console.log('🔌 [ChatWindow] ❌ No chat ID, skipping WebSocket connection');
      return;
    }

    // Создаем обработчик сообщений и сохраняем ссылку
    const messageHandler = (data) => {
      console.log('🔌 [ChatWindow] === MESSAGE_HANDLER START ===');
      console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
      console.log('🔌 [ChatWindow] Received data:', data);
      console.log('🔌 [ChatWindow] Current messages count:', messages.length);
      
      const newMessage = {
        id: data.id,
        content: data.message,
        sender: { username: data.sender },
        created_at: data.timestamp,
      };
      
      setMessages((prev) => {
        const newMessages = [...prev, newMessage];
        console.log('🔌 [ChatWindow] New messages array:', newMessages);
        return newMessages;
      });
      
      // Добавляем сообщение в Redux store
      dispatch(addMessage({ chatId: chat.id, message: newMessage, currentUsername: username }));
      
      console.log('🔌 [ChatWindow] ✅ Messages state updated');
      console.log('🔌 [ChatWindow] === MESSAGE_HANDLER END ===');
    };

    const connectWebSocket = async () => {
      console.log('🔌 [ChatWindow] === CONNECT_WEBSOCKET FUNCTION START ===');
      console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
      console.log('🔌 [ChatWindow] Chat ID:', chat.id);
      console.log('🔌 [ChatWindow] WebSocket service state:', webSocketService.isConnected);
      
      try {
        // Проверяем, не подключены ли мы уже к этому чату
        if (webSocketService.isConnected && webSocketService.currentChatId === chat.id) {
          console.log('🔌 [ChatWindow] ⚠️ Already connected to this chat, skipping connection');
          return;
        }
        
        // Отключаем предыдущее соединение если есть
        if (webSocketService.isConnected) {
          console.log('🔌 [ChatWindow] ⚠️ Existing WebSocket connection found, disconnecting...');
          webSocketService.disconnect();
        }
        
        console.log('🔌 [ChatWindow] Connecting to WebSocket...');
        await webSocketService.connect(chat.id);
        console.log('🔌 [ChatWindow] ✅ WebSocket connected successfully');
        
        setWsConnected(true);
        setError(null); // Очищаем ошибки при успешном подключении
        console.log('🔌 [ChatWindow] ✅ wsConnected state set to true');

        // Добавляем обработчик
        console.log('🔌 [ChatWindow] Adding message handler...');
        webSocketService.addMessageHandler(messageHandler);
        console.log('🔌 [ChatWindow] ✅ Message handler added');
        
      } catch (error) {
        console.log('🔌 [ChatWindow] ❌ WebSocket connection error:', error);
        setError("Помилка підключення до чату");
        setWsConnected(false);
        
        // Автоматическое переподключение через 5 секунд
        setTimeout(() => {
          if (chat?.id) {
            console.log('🔌 [ChatWindow] 🔄 Attempting automatic reconnection...');
            connectWebSocket();
          }
        }, 5000);
      }
      
      console.log('🔌 [ChatWindow] === CONNECT_WEBSOCKET FUNCTION END ===');
    };

    // Используем setTimeout чтобы избежать двойного подключения при StrictMode
    const connectionTimeout = setTimeout(() => {
      connectWebSocket();
    }, 100); // Увеличиваем задержку для стабильности

    // Очищаем при смене чата или размонтировании
    return () => {
      console.log('🔌 [ChatWindow] === WEBSOCKET useEffect CLEANUP ===');
      console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
      console.log('🔌 [ChatWindow] Chat ID:', chat?.id);
      console.log('🔌 [ChatWindow] Clearing connection timeout...');
      
      clearTimeout(connectionTimeout);
      
      console.log('🔌 [ChatWindow] Removing message handler...');
      webSocketService.removeMessageHandler(messageHandler);
      console.log('🔌 [ChatWindow] ✅ Message handler removed');
      console.log('🔌 [ChatWindow] === WEBSOCKET useEffect CLEANUP END ===');
    };
  }, [chat?.id]); // Зависимость от chat?.id для переподключения при смене чата

  // Дополнительный эффект для мониторинга соединения
  useEffect(() => {
    if (!wsConnected || !chat?.id) return;

    // Проверяем состояние соединения каждые 30 секунд
    const connectionCheckInterval = setInterval(() => {
      if (!webSocketService.isConnected) {
        console.log('🔌 [ChatWindow] ⚠️ WebSocket connection lost, reconnecting...');
        setWsConnected(false);
        setError("З\'єднання втрачено, перепідключаємося...");
        
        // Переподключаемся
        setTimeout(() => {
          if (chat?.id) {
            webSocketService.connect(chat.id)
              .then(() => {
                setWsConnected(true);
                setError(null);
                console.log('🔌 [ChatWindow] ✅ Reconnection successful');
              })
              .catch((error) => {
                console.log('🔌 [ChatWindow] ❌ Reconnection failed:', error);
                setError("Помилка перепідключення");
              });
          }
        }, 1000);
      }
    }, 30 * 1000);

    return () => clearInterval(connectionCheckInterval);
  }, [wsConnected, chat?.id]);

  // Убираем конфликтующий useEffect который отключает WebSocket
  // useEffect(() => {
  //   return () => {
  //     // Отключаем WebSocket только при полном выходе из чата
  //     webSocketService.disconnect();
  //     setWsConnected(false);
  //   };
  // }, []); // Пустой массив зависимостей - выполняется только при размонтировании

  const scrollToBottom = () => {
    console.log('🔌 [ChatWindow] === SCROLL_TO_BOTTOM ===');
    console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
    console.log('🔌 [ChatWindow] messagesEndRef:', messagesEndRef.current);
    
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log('🔌 [ChatWindow] ✅ Scroll to bottom executed');
  };

  useEffect(() => {
    console.log('🔌 [ChatWindow] === SCROLL useEffect START ===');
    console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
    console.log('🔌 [ChatWindow] Messages count:', messages.length);
    
    scrollToBottom();
    console.log('🔌 [ChatWindow] === SCROLL useEffect END ===');
  }, [messages]);

  const handleSendMessage = async (e) => {
    console.log('🔌 [ChatWindow] === HANDLE_SEND_MESSAGE START ===');
    console.log('🔌 [ChatWindow] Time:', new Date().toISOString());
    console.log('🔌 [ChatWindow] Event:', e);
    console.log('🔌 [ChatWindow] New message:', newMessage);
    console.log('🔌 [ChatWindow] Chat ID:', chat?.id);
    console.log('🔌 [ChatWindow] WebSocket connected:', wsConnected);
    
    e.preventDefault();
    if (!newMessage.trim() || !chat?.id) {
      console.log('🔌 [ChatWindow] ❌ Invalid message or chat ID');
      return;
    }

    try {
      console.log('🔌 [ChatWindow] Clearing error and setting loading...');
      setError(null);
      setLoading(true);
      
      if (wsConnected) {
        console.log('🔌 [ChatWindow] WebSocket connected, sending via WebSocket...');
        webSocketService.sendMessage(newMessage.trim());
        console.log('🔌 [ChatWindow] ✅ Message sent via WebSocket');
      } else {
        console.log('🔌 [ChatWindow] WebSocket not connected, sending via API...');
        const response = await chatApi.sendMessage(chat.id, newMessage.trim());
        console.log('🔌 [ChatWindow] ✅ Message sent via API:', response);
        setMessages(prev => [...prev, response]);
      }
      
      console.log('🔌 [ChatWindow] Clearing new message input...');
      setNewMessage("");
      console.log('🔌 [ChatWindow] ✅ Message sent successfully');
      
    } catch (error) {
      console.log('🔌 [ChatWindow] ❌ Error sending message:', error);
      setError("Помилка відправки повідомлення");
    } finally {
      console.log('🔌 [ChatWindow] Setting loading to false...');
      setLoading(false);
    }
    
    console.log('🔌 [ChatWindow] === HANDLE_SEND_MESSAGE END ===');
  };

  const handleDeleteChat = async () => {
    try {
      await chatApi.deleteChat(chat.id);
      onDeleteChat(chat.id);
    } catch (error) {
      setError("Помилка при видаленні чату");
      console.error('Error deleting chat:', error);
    }
  };

  const getOtherParticipant = () => {
    if (!chat?.participants || chat.participants.length === 0) return null;
    
    // Отладочная информация
    console.log('🔍 [ChatWindow] getOtherParticipant:', {
      currentUsername,
      participants: chat.participants.map(p => p.username),
      chatId: chat.id
    });
    
    // Используем username из Redux store вместо localStorage
    // Если currentUsername не определен, используем localStorage как fallback
    const finalUsername = currentUsername || localStorage.getItem('username');
    const otherParticipant = chat.participants.find(p => p.username !== finalUsername) || chat.participants[0];
    
    console.log('🔍 [ChatWindow] Selected participant:', otherParticipant?.username);
    return otherParticipant;
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  if (!chat) {
    return (
      <div className="chat-window empty-chat">
        <p>Оберіть чат для початку спілкування</p>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="info-chat window">
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
          <div className="name-chat">
            {otherParticipant?.username || 'Невідомий користувач'}
          </div>
          <div className="status-chat-header">
            <img src={Status} alt="Статус чату" />
          </div>
        </div>
        <button className="back-btn" onClick={onClose}>
          ←
        </button>
        <div className="other-info-header">
          <span>Останній вхід:</span>
          <p>15.02.2023/Онлайн</p>
        </div>
        <button onClick={() => setShowDeleteModal(true)} className="delete-chat-button">
          Видалити чат
        </button>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteChat}
        message="Ви впевнені що хочете видалити даний чат?"
        type="confirmation"
      />

      <div className="messages-container">
        {loading && <div className="loading">Завантаження повідомлень...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && Array.isArray(messages) && messages.length > 0 ? (
          messages.map((message) => {
            const finalUsername = currentUsername || localStorage.getItem('username');
            const isOwnMessage = message.sender?.username === finalUsername;
            return (
              <div
                key={message.id}
                className={`message ${isOwnMessage ? 'sent' : 'other_user'}`}
              >
                <div className="img-chat">
                  <ProfileImage
                    src={isOwnMessage ? null : otherParticipant?.profile_image}
                    alt={`Аватар ${isOwnMessage ? 'вас' : otherParticipant?.username || 'користувача'}`}
                    className="chat-avatar"
                    size={IMAGE_SIZES.USER_LIST}
                    fallbackSmall={FALLBACK_IMAGES.SMALL}
                    fallbackLarge={FALLBACK_IMAGES.LARGE}
                  />
                </div>
                <div className="message-content">
                  <span>{message.content}</span>
                  <span className="message-time">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-messages">
            <p>У цьому чаті поки немає повідомлень</p>
          </div>
        )}
        <div ref={messagesEndRef} />
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
            <img src={RightArrow} alt="Відправити" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
