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
        console.log('🔌 [WebSocketService] === START CONNECT ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Chat ID:', chatId);
        console.log('🔌 [WebSocketService] Current state:', {
            isConnected: this.isConnected,
            currentChatId: this.currentChatId,
            socketState: this.socket?.readyState,
            reconnectAttempts: this.reconnectAttempts
        });
        
        // Проверяем, не подключены ли мы уже к этому чату
        if (this.isConnected && this.currentChatId === chatId) {
            console.log('🔌 [WebSocketService] Already connected to this chat, skipping');
            return;
        }
        
        if (this.socket) {
            console.log('🔌 [WebSocketService] Existing socket found, disconnecting...');
            this.disconnect();
        }

        try {
            console.log('🔌 [WebSocketService] Шаг 1: Получаем access token...');
            // Получаем актуальный токен с автоматическим обновлением
            // Используем getAccessSync() для синхронного получения токена
            const token = tokenService.getAccessSync ? tokenService.getAccessSync() : null;
            console.log('🔌 [WebSocketService] Шаг 1: Token получен:', token ? `${token.substring(0, 20)}...` : 'NULL');
            
            if (!token) {
                console.error('🔌 [WebSocketService] Шаг 1: No token available');
                throw new Error('Токен авторизації не знайдений або не дійсний');
            }

            const wsUrl = `ws://127.0.0.1:8000/ws/chat/${chatId}/?token=${token}`;
            console.log('🔌 [WebSocketService] Шаг 2: Создаем WebSocket connection...');
            console.log('🔌 [WebSocketService] Шаг 2: URL:', wsUrl.replace(token, 'TOKEN...'));

            return new Promise((resolve, reject) => {
                try {
                    this.socket = new WebSocket(wsUrl);
                    console.log('🔌 [WebSocketService] Шаг 2: WebSocket instance created');

                    this.socket.onopen = (event) => {
                        console.log('🔌 [WebSocketService] === WEBSOCKET OPENED ===');
                        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
                        console.log('🔌 [WebSocketService] Event:', event);
                        this.isConnected = true;
                        this.currentChatId = chatId;
                        this.reconnectAttempts = 0;
                        this.lastPingTime = Date.now();
                        console.log('🔌 [WebSocketService] State updated:', {
                            isConnected: this.isConnected,
                            currentChatId: this.currentChatId,
                            reconnectAttempts: this.reconnectAttempts
                        });
                        
                        // Запускаем проверку соединения
                        console.log('🔌 [WebSocketService] Starting connection monitoring...');
                        this.startConnectionMonitoring();
                        console.log('🔌 [WebSocketService] === CONNECTED ===');
                        resolve();
                    };

                    this.socket.onclose = (event) => {
                        console.log('🔌 [WebSocketService] === WEBSOCKET CLOSED ===');
                        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
                        console.log('🔌 [WebSocketService] Close code:', event.code);
                        console.log('🔌 [WebSocketService] Close reason:', event.reason);
                        console.log('🔌 [WebSocketService] Was clean:', event.wasClean);
                        this.isConnected = false;
                        this.currentChatId = null;
                        this.stopConnectionMonitoring();
                        
                        // Автоматическое переподключение только для неожиданных разрывов
                        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                            this.reconnectAttempts++;
                            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Экспоненциальная задержка, максимум 30 сек
                            console.log(`🔌 [WebSocketService] Attempting reconnect #${this.reconnectAttempts} in ${delay}ms...`);
                            setTimeout(() => this.connect(chatId), delay);
                        } else {
                            console.log('🔌 [WebSocketService] Max reconnection attempts reached or connection was clean');
                        }
                    };

                    this.socket.onerror = (error) => {
                        console.error('🔌 [WebSocketService] === WEBSOCKET ERROR ===');
                        console.error('🔌 [WebSocketService] Time:', new Date().toISOString());
                        console.error('🔌 [WebSocketService] Error:', error);
                        this.isConnected = false;
                        this.currentChatId = null;
                        this.stopConnectionMonitoring();
                        
                        reject(error);
                    };

                    this.socket.onmessage = (event) => {
                        console.log('🔌 [WebSocketService] === MESSAGE RECEIVED ===');
                        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
                        console.log('🔌 [WebSocketService] Raw data:', event.data);
                        
                        try {
                            const data = JSON.parse(event.data);
                            console.log('🔌 [WebSocketService] Parsed data:', data);
                            
                            // Обновляем время последнего сообщения
                            this.lastPingTime = Date.now();
                            console.log('🔌 [WebSocketService] Last ping time updated');
                            
                            // Обновляем Redux store с новым сообщением
                            if (this.currentChatId) {
                                console.log('🔌 [WebSocketService] Updating Redux store...');
                                const newMessage = {
                                    id: data.id,
                                    content: data.message,
                                    sender: { username: data.sender },
                                    created_at: data.timestamp,
                                };
                                // Получаем текущего пользователя из localStorage
                                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                                const currentUsername = currentUser?.username;
                                console.log('🔌 [WebSocketService] Current username:', currentUsername);
                                
                                // Проверяем, что currentUsername существует
                                if (currentUsername) {
                                    console.log('🔌 [WebSocketService] Dispatching addMessage to Redux...');
                                    store.dispatch(addMessage({ 
                                        chatId: this.currentChatId, 
                                        message: newMessage, 
                                        currentUsername: currentUsername
                                    }));
                                    console.log('🔌 [WebSocketService] Message added to Redux');
                                } else {
                                    console.warn('🔌 [WebSocketService] No currentUsername, skipping Redux update');
                                }
                            } else {
                                console.warn('🔌 [WebSocketService] No currentChatId, skipping Redux update');
                            }
                            
                            console.log('🔌 [WebSocketService] Calling message handlers...');
                            console.log('🔌 [WebSocketService] Handlers count:', this.messageHandlers.size);
                            this.messageHandlers.forEach((handler, index) => {
                                try {
                                    console.log(`🔌 [WebSocketService] Calling handler #${index}...`);
                                    handler(data);
                                    console.log(`🔌 [WebSocketService] Handler #${index} executed`);
                                } catch (handlerError) {
                                    console.error(`🔌 [WebSocketService] Handler #${index} error:`, handlerError);
                                }
                            });
                            
                        } catch (error) {
                            console.error('🔌 [WebSocketService] Error parsing message:', error);
                        }
                    };
                    
                } catch (error) {
                    console.error('🔌 [WebSocketService] Error creating WebSocket:', error);
                    reject(error);
                }
            });
        } catch (error) {
            console.error('🔌 [WebSocketService] Connection error:', error);
            throw error;
        }
    }

    // Мониторинг соединения
    startConnectionMonitoring() {
        console.log('🔌 [WebSocketService] Starting connection monitoring...');
        this.connectionCheckInterval = setInterval(async () => {
            if (!this.isConnected || !this.socket) {
                console.log('🔌 [WebSocketService] Monitoring: Not connected, skipping check');
                return;
            }
            
            const now = Date.now();
            const timeSinceLastPing = this.lastPingTime ? now - this.lastPingTime : 0;
            console.log('🔌 [WebSocketService] Monitoring: Time since last ping:', timeSinceLastPing, 'ms');
            
            // Если прошло больше 2 минут без сообщений, проверяем соединение
            if (timeSinceLastPing > 2 * 60 * 1000) {
                console.log('🔌 [WebSocketService] Monitoring: No activity for 2 minutes, checking connection...');
                try {
                    // Отправляем ping для проверки соединения
                    if (this.socket.readyState === WebSocket.OPEN) {
                        console.log('🔌 [WebSocketService] Monitoring: Sending ping...');
                        this.socket.send(JSON.stringify({ type: 'ping' }));
                        this.lastPingTime = now;
                        console.log('🔌 [WebSocketService] Monitoring: Ping sent');
                    } else {
                        console.warn('🔌 [WebSocketService] Monitoring: Socket not open, reconnecting...');
                        this.reconnect();
                    }
                } catch (error) {
                    console.error('🔌 [WebSocketService] Monitoring: Error during check:', error);
                    this.reconnect();
                }
            }
        }, 30 * 1000); // Проверяем каждые 30 секунд
        console.log('🔌 [WebSocketService] Connection monitoring started');
    }

    stopConnectionMonitoring() {
        if (this.connectionCheckInterval) {
            console.log('🔌 [WebSocketService] Stopping connection monitoring...');
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
            console.log('🔌 [WebSocketService] Connection monitoring stopped');
        } else {
            console.log('🔌 [WebSocketService] No monitoring interval to stop');
        }
    }

    // Принудительное переподключение
    async reconnect() {
        console.log('🔌 [WebSocketService] === FORCE RECONNECT ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Current chat ID:', this.currentChatId);
        
        if (this.currentChatId) {
            console.log('🔌 [WebSocketService] Disconnecting...');
            this.disconnect();
            console.log('🔌 [WebSocketService] Waiting 1 second before reconnect...');
            setTimeout(() => {
                console.log('🔌 [WebSocketService] Reconnect timeout expired, calling connect...');
                this.connect(this.currentChatId);
            }, 1000);
        } else {
            console.warn('🔌 [WebSocketService] No currentChatId, cannot reconnect');
        }
    }

    sendMessage(message) {
        console.log('🔌 [WebSocketService] === SEND MESSAGE ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Message:', message);
        console.log('🔌 [WebSocketService] Connection state:', this.isConnected);
        console.log('🔌 [WebSocketService] Current chat ID:', this.currentChatId);
        
        if (!this.isConnected) {
            console.error('🔌 [WebSocketService] Not connected, cannot send message');
            throw new Error('WebSocket не підключений');
        }

        try {
            const messageData = JSON.stringify({ message });
            console.log('🔌 [WebSocketService] Serialized message:', messageData);
            
            this.socket.send(messageData);
            this.lastPingTime = Date.now(); // Обновляем время последней активности
            console.log('🔌 [WebSocketService] Message sent successfully');
            console.log('🔌 [WebSocketService] Last ping time updated');
            
        } catch (error) {
            console.error('🔌 [WebSocketService] Error sending message:', error);
            throw error;
        }
    }

    addMessageHandler(handler) {
        console.log('🔌 [WebSocketService] === ADD MESSAGE HANDLER ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Current handlers count:', this.messageHandlers.size);
        this.messageHandlers.add(handler);
        console.log('🔌 [WebSocketService] Handler added, new count:', this.messageHandlers.size);
    }

    removeMessageHandler(handler) {
        console.log('🔌 [WebSocketService] === REMOVE MESSAGE HANDLER ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Current handlers count:', this.messageHandlers.size);
        const removed = this.messageHandlers.delete(handler);
        console.log('🔌 [WebSocketService] Handler removed:', removed);
        console.log('🔌 [WebSocketService] New handlers count:', this.messageHandlers.size);
    }

    disconnect() {
        console.log('🔌 [WebSocketService] === DISCONNECT ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Current state:', {
            isConnected: this.isConnected,
            currentChatId: this.currentChatId,
            socketState: this.socket?.readyState
        });
        
        this.stopConnectionMonitoring();
        
        if (this.socket) {
            console.log('🔌 [WebSocketService] Closing WebSocket...');
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
            this.currentChatId = null;
            console.log('🔌 [WebSocketService] WebSocket closed');
        } else {
            console.log('🔌 [WebSocketService] No socket to disconnect');
        }
    }
}

export default new WebSocketService();
