import tokenService from '../../auth/tokenService';
import { store } from '../../store';
import { addMessage } from '../chatSlice';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.messageHandlers = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isConnected = false;
        this.currentChatId = null;
        this.connectionCheckInterval = null;
        this.lastPingTime = null;
    }

    async connect(chatId) {
        // Проверяем, не подключены ли мы уже к этому чату
        if (this.isConnected && this.currentChatId === chatId) {
            return;
        }
        
        if (this.socket) {
            this.disconnect();
        }

        try {
            // Получаем актуальный токен с автоматическим обновлением
            // Используем getAccessSync() для синхронного получения токена
            const token = tokenService.getAccessSync ? tokenService.getAccessSync() : null;
            
            if (!token) {
                throw new Error('Токен авторизації не знайдений або не дійсний');
            }

            const wsUrl = `ws://127.0.0.1:8000/ws/chat/${chatId}/?token=${token}`;

            return new Promise((resolve, reject) => {
                try {
                    this.socket = new WebSocket(wsUrl);

                    this.socket.onopen = (event) => {
                        this.isConnected = true;
                        this.currentChatId = chatId;
                        this.reconnectAttempts = 0;
                        this.lastPingTime = Date.now();
                        
                        // Запускаем проверку соединения
                        this.startConnectionMonitoring();
                        
                        resolve();
                    };

                    this.socket.onclose = (event) => {
                        this.isConnected = false;
                        this.currentChatId = null;
                        this.stopConnectionMonitoring();
                        
                        // Автоматическое переподключение только для неожиданных разрывов
                        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                            this.reconnectAttempts++;
                            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Экспоненциальная задержка, максимум 30 сек
                            setTimeout(() => this.connect(chatId), delay);
                        }
                    };

                    this.socket.onerror = (error) => {
                        this.isConnected = false;
                        this.currentChatId = null;
                        this.stopConnectionMonitoring();
                        
                        reject(error);
                    };

                    this.socket.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            
                            // Обновляем время последнего сообщения
                            this.lastPingTime = Date.now();
                            
                            // Обновляем Redux store с новым сообщением
                            if (this.currentChatId) {
                                const newMessage = {
                                    id: data.id,
                                    content: data.message,
                                    sender: { username: data.sender },
                                    created_at: data.timestamp,
                                };
                                // Получаем текущего пользователя из localStorage
                                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                                const currentUsername = currentUser?.username;
                                
                                // Проверяем, что currentUsername существует
                                if (currentUsername) {
                                    store.dispatch(addMessage({ 
                                        chatId: this.currentChatId, 
                                        message: newMessage, 
                                        currentUsername: currentUsername
                                    }));
                                }
                            }
                            
                            this.messageHandlers.forEach((handler) => {
                                try {
                                    handler(data);
                                } catch (handlerError) {
                                    // Ignore handler errors
                                }
                            });
                            
                        } catch (error) {
                            // Ignore parsing errors
                        }
                    };
                    
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            throw error;
        }
    }

    // Мониторинг соединения
    startConnectionMonitoring() {
        this.connectionCheckInterval = setInterval(async () => {
            if (!this.isConnected || !this.socket) return;
            
            const now = Date.now();
            const timeSinceLastPing = this.lastPingTime ? now - this.lastPingTime : 0;
            
            // Если прошло больше 2 минут без сообщений, проверяем соединение
            if (timeSinceLastPing > 2 * 60 * 1000) {
                try {
                    // Отправляем ping для проверки соединения
                    if (this.socket.readyState === WebSocket.OPEN) {
                        this.socket.send(JSON.stringify({ type: 'ping' }));
                        this.lastPingTime = now;
                    } else {
                        this.reconnect();
                    }
                } catch (error) {
                    this.reconnect();
                }
            }
        }, 30 * 1000); // Проверяем каждые 30 секунд
    }

    stopConnectionMonitoring() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
        }
    }

    // Принудительное переподключение
    async reconnect() {
        if (this.currentChatId) {
            this.disconnect();
            setTimeout(() => {
                this.connect(this.currentChatId);
            }, 1000);
        }
    }

    sendMessage(message) {
        if (!this.isConnected) {
            throw new Error('WebSocket не підключений');
        }

        try {
            const messageData = JSON.stringify({ message });
            
            this.socket.send(messageData);
            this.lastPingTime = Date.now(); // Обновляем время последней активности
            
        } catch (error) {
            throw error;
        }
    }

    addMessageHandler(handler) {
        this.messageHandlers.add(handler);
    }

    removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
    }

    disconnect() {
        this.stopConnectionMonitoring();
        
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
            this.currentChatId = null;
        }
    }
}

export default new WebSocketService();
