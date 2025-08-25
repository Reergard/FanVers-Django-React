import tokenService from '../../auth/tokenService';

class WebSocketService {
    constructor() {
        console.log('🔌 [WebSocketService] === CONSTRUCTOR START ===');
        console.log('🔌 [WebSocketService] Creating new WebSocket service instance');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        
        this.socket = null;
        this.messageHandlers = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isConnected = false;
        this.currentChatId = null;
        this.connectionCheckInterval = null;
        this.lastPingTime = null;
        
        console.log('🔌 [WebSocketService] Initial state:', {
            socket: this.socket,
            messageHandlers: this.messageHandlers.size,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            isConnected: this.isConnected,
            currentChatId: this.currentChatId
        });
        console.log('🔌 [WebSocketService] === CONSTRUCTOR END ===');
    }

    async connect(chatId) {
        console.log('🔌 [WebSocketService] === CONNECT START ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Chat ID:', chatId);
        console.log('🔌 [WebSocketService] Current socket state:', this.socket);
        console.log('🔌 [WebSocketService] Current connection state:', this.isConnected);
        console.log('🔌 [WebSocketService] Current chat ID:', this.currentChatId);
        console.log('🔌 [WebSocketService] Message handlers count:', this.messageHandlers.size);
        
        // Проверяем, не подключены ли мы уже к этому чату
        if (this.isConnected && this.currentChatId === chatId) {
            console.log('🔌 [WebSocketService] ⚠️ Already connected to chat', chatId, 'skipping connection');
            return;
        }
        
        if (this.socket) {
            console.log('🔌 [WebSocketService] ⚠️ Existing socket found, disconnecting...');
            this.disconnect();
        }

        try {
            // Получаем актуальный токен с автоматическим обновлением
            const token = await tokenService.getValidToken();
            console.log('🔌 [WebSocketService] Valid token obtained:', token ? `${token.substring(0, 20)}...` : 'None');
            
            if (!token) {
                console.log('🔌 [WebSocketService] ❌ No valid token available');
                throw new Error('Токен авторизації не знайдений або не дійсний');
            }

            const wsUrl = `ws://localhost:8000/ws/chat/${chatId}/?token=${token}`;
            console.log('🔌 [WebSocketService] WebSocket URL:', wsUrl);

            return new Promise((resolve, reject) => {
                try {
                    console.log('🔌 [WebSocketService] Creating new WebSocket instance...');
                    this.socket = new WebSocket(wsUrl);
                    console.log('🔌 [WebSocketService] WebSocket instance created:', this.socket);

                    this.socket.onopen = (event) => {
                        console.log('🔌 [WebSocketService] === WEBSOCKET ONOPEN ===');
                        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
                        console.log('🔌 [WebSocketService] Event:', event);
                        console.log('🔌 [WebSocketService] Socket readyState:', this.socket.readyState);
                        console.log('🔌 [WebSocketService] Socket URL:', this.socket.url);
                        
                        this.isConnected = true;
                        this.currentChatId = chatId;
                        this.reconnectAttempts = 0;
                        this.lastPingTime = Date.now();
                        
                        // Запускаем проверку соединения
                        this.startConnectionMonitoring();
                        
                        console.log('🔌 [WebSocketService] ✅ Connection established successfully');
                        console.log('🔌 [WebSocketService] New state:', {
                            isConnected: this.isConnected,
                            currentChatId: this.currentChatId,
                            reconnectAttempts: this.reconnectAttempts
                        });
                        console.log('🔌 [WebSocketService] === WEBSOCKET ONOPEN END ===');
                        
                        resolve();
                    };

                    this.socket.onclose = (event) => {
                        console.log('🔌 [WebSocketService] === WEBSOCKET ONCLOSE ===');
                        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
                        console.log('🔌 [WebSocketService] Event:', event);
                        console.log('🔌 [WebSocketService] Close code:', event.code);
                        console.log('🔌 [WebSocketService] Close reason:', event.reason);
                        console.log('🔌 [WebSocketService] Was clean:', event.wasClean);
                        console.log('🔌 [WebSocketService] Socket readyState:', this.socket.readyState);
                        
                        this.isConnected = false;
                        this.currentChatId = null;
                        this.stopConnectionMonitoring();
                        
                        console.log('🔌 [WebSocketService] Connection closed. Details:', {
                            code: event.code,
                            reason: event.reason,
                            wasClean: event.wasClean,
                            reconnectAttempts: this.reconnectAttempts,
                            maxReconnectAttempts: this.maxReconnectAttempts
                        });
                        
                        // Автоматическое переподключение только для неожиданных разрывов
                        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                            this.reconnectAttempts++;
                            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Экспоненциальная задержка, максимум 30 сек
                            console.log(`🔌 [WebSocketService] 🔄 Attempting reconnect #${this.reconnectAttempts} in ${delay}ms...`);
                            setTimeout(() => this.connect(chatId), delay);
                        } else {
                            console.log('🔌 [WebSocketService] ❌ Max reconnection attempts reached or connection was clean');
                        }
                        
                        console.log('🔌 [WebSocketService] === WEBSOCKET ONCLOSE END ===');
                    };

                    this.socket.onerror = (error) => {
                        console.log('🔌 [WebSocketService] === WEBSOCKET ONERROR ===');
                        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
                        console.log('🔌 [WebSocketService] Error:', error);
                        console.log('🔌 [WebSocketService] Error type:', error.type);
                        console.log('🔌 [WebSocketService] Error target:', error.target);
                        console.log('🔌 [WebSocketService] Socket readyState:', this.socket.readyState);
                        
                        this.isConnected = false;
                        this.currentChatId = null;
                        this.stopConnectionMonitoring();
                        
                        console.log('🔌 [WebSocketService] ❌ WebSocket error occurred');
                        console.log('🔌 [WebSocketService] === WEBSOCKET ONERROR END ===');
                        
                        reject(error);
                    };

                    this.socket.onmessage = (event) => {
                        console.log('🔌 [WebSocketService] === WEBSOCKET ONMESSAGE ===');
                        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
                        console.log('🔌 [WebSocketService] Event:', event);
                        console.log('🔌 [WebSocketService] Raw data:', event.data);
                        console.log('🔌 [WebSocketService] Data type:', typeof event.data);
                        
                        try {
                            const data = JSON.parse(event.data);
                            console.log('🔌 [WebSocketService] Parsed data:', data);
                            console.log('🔌 [WebSocketService] Message handlers count:', this.messageHandlers.size);
                            
                            // Обновляем время последнего сообщения
                            this.lastPingTime = Date.now();
                            
                            this.messageHandlers.forEach((handler, index) => {
                                console.log(`🔌 [WebSocketService] Calling handler #${index}:`, handler);
                                try {
                                    handler(data);
                                    console.log(`🔌 [WebSocketService] ✅ Handler #${index} executed successfully`);
                                } catch (handlerError) {
                                    console.log(`🔌 [WebSocketService] ❌ Handler #${index} error:`, handlerError);
                                }
                            });
                            
                            console.log('🔌 [WebSocketService] ✅ Message processed successfully');
                            
                        } catch (error) {
                            console.log('🔌 [WebSocketService] ❌ Error parsing message:', error);
                            console.log('🔌 [WebSocketService] Raw data that failed to parse:', event.data);
                        }
                        
                        console.log('🔌 [WebSocketService] === WEBSOCKET ONMESSAGE END ===');
                    };
                    
                    console.log('🔌 [WebSocketService] WebSocket event handlers attached');
                    console.log('🔌 [WebSocketService] === CONNECT END ===');
                    
                } catch (error) {
                    console.log('🔌 [WebSocketService] ❌ Error creating WebSocket:', error);
                    console.log('🔌 [WebSocketService] === CONNECT END ===');
                    reject(error);
                }
            });
        } catch (error) {
            console.log('🔌 [WebSocketService] ❌ Error getting valid token:', error);
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
                console.log('🔌 [WebSocketService] ⚠️ No activity for 2 minutes, checking connection...');
                
                try {
                    // Отправляем ping для проверки соединения
                    if (this.socket.readyState === WebSocket.OPEN) {
                        this.socket.send(JSON.stringify({ type: 'ping' }));
                        this.lastPingTime = now;
                        console.log('🔌 [WebSocketService] ✅ Ping sent, connection alive');
                    } else {
                        console.log('🔌 [WebSocketService] ❌ Socket not open, reconnecting...');
                        this.reconnect();
                    }
                } catch (error) {
                    console.log('🔌 [WebSocketService] ❌ Error during connection check:', error);
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
            console.log('🔌 [WebSocketService] 🔄 Forcing reconnection...');
            this.disconnect();
            setTimeout(() => {
                this.connect(this.currentChatId);
            }, 1000);
        }
    }

    sendMessage(message) {
        console.log('🔌 [WebSocketService] === SEND_MESSAGE START ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Message:', message);
        console.log('🔌 [WebSocketService] Connection state:', this.isConnected);
        console.log('🔌 [WebSocketService] Current chat ID:', this.currentChatId);
        console.log('🔌 [WebSocketService] Socket state:', this.socket);
        
        if (!this.isConnected) {
            console.log('🔌 [WebSocketService] ❌ WebSocket not connected');
            throw new Error('WebSocket не підключений');
        }

        try {
            const messageData = JSON.stringify({ message });
            console.log('🔌 [WebSocketService] Sending data:', messageData);
            
            this.socket.send(messageData);
            this.lastPingTime = Date.now(); // Обновляем время последней активности
            console.log('🔌 [WebSocketService] ✅ Message sent successfully');
            
        } catch (error) {
            console.log('🔌 [WebSocketService] ❌ Error sending message:', error);
            throw error;
        }
        
        console.log('🔌 [WebSocketService] === SEND_MESSAGE END ===');
    }

    addMessageHandler(handler) {
        console.log('🔌 [WebSocketService] === ADD_MESSAGE_HANDLER START ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Handler:', handler);
        console.log('🔌 [WebSocketService] Current handlers count:', this.messageHandlers.size);
        
        this.messageHandlers.add(handler);
        
        console.log('🔌 [WebSocketService] ✅ Handler added successfully');
        console.log('🔌 [WebSocketService] New handlers count:', this.messageHandlers.size);
        console.log('🔌 [WebSocketService] === ADD_MESSAGE_HANDLER END ===');
    }

    removeMessageHandler(handler) {
        console.log('🔌 [WebSocketService] === REMOVE_MESSAGE_HANDLER START ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Handler:', handler);
        console.log('🔌 [WebSocketService] Current handlers count:', this.messageHandlers.size);
        
        const removed = this.messageHandlers.delete(handler);
        
        console.log('🔌 [WebSocketService] Handler removal result:', removed);
        console.log('🔌 [WebSocketService] New handlers count:', this.messageHandlers.size);
        console.log('🔌 [WebSocketService] === REMOVE_MESSAGE_HANDLER END ===');
    }

    disconnect() {
        console.log('🔌 [WebSocketService] === DISCONNECT START ===');
        console.log('🔌 [WebSocketService] Time:', new Date().toISOString());
        console.log('🔌 [WebSocketService] Current socket:', this.socket);
        console.log('🔌 [WebSocketService] Current connection state:', this.isConnected);
        console.log('🔌 [WebSocketService] Current chat ID:', this.currentChatId);
        console.log('🔌 [WebSocketService] Message handlers count:', this.messageHandlers.size);
        
        this.stopConnectionMonitoring();
        
        if (this.socket) {
            console.log('🔌 [WebSocketService] Closing WebSocket connection...');
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
            this.currentChatId = null;
            console.log('🔌 [WebSocketService] ✅ WebSocket connection closed');
        } else {
            console.log('🔌 [WebSocketService] ⚠️ No socket to disconnect');
        }
        
        console.log('🔌 [WebSocketService] Final state:', {
            socket: this.socket,
            isConnected: this.isConnected,
            currentChatId: this.currentChatId,
            messageHandlers: this.messageHandlers.size
        });
        console.log('🔌 [WebSocketService] === DISCONNECT END ===');
    }
}

console.log('🔌 [WebSocketService] Creating WebSocket service instance...');
export default new WebSocketService(); 