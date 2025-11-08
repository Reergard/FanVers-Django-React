import tokenService from '../../auth/tokenService';
import { store } from '../../store';
import { addMessage } from '../chatSlice';

class GlobalWebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.pingInterval = null;
        this.lastPingTime = Date.now();
    }

    async connect() {
        if (this.isConnected || this.socket?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            // Используем getAccessSync() для синхронного получения токена
            // или getValidAccess() если нужен refresh
            const token = tokenService.getAccessSync ? tokenService.getAccessSync() : null;
            if (!token) {
                return;
            }

            const wsUrl = `ws://127.0.0.1:8000/ws/counter/?token=${token}`;

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.startPingInterval();
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'message') {
                        // Обновляем счетчик непрочитанных сообщений
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUsername = currentUser?.username;
                        
                        if (currentUsername && data.sender?.username !== currentUsername) {
                            store.dispatch(addMessage({ 
                                chatId: data.chat_id, 
                                message: {
                                    id: data.id,
                                    content: data.message,
                                    sender: { username: data.sender?.username },
                                    created_at: data.timestamp
                                }, 
                                currentUsername: currentUsername
                            }));
                        }
                    }
                } catch (error) {
                    // Ignore parsing errors
                }
            };

            this.socket.onclose = () => {
                this.isConnected = false;
                this.stopPingInterval();
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                // Connection errors are handled by onclose
            };

        } catch (error) {
            // Connection errors are handled by onerror/onclose
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
        this.stopPingInterval();
    }

    startPingInterval() {
        this.pingInterval = setInterval(() => {
            if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }));
                this.lastPingTime = Date.now();
            }
        }, 30000); // Ping every 30 seconds
    }

    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            
            setTimeout(async () => {
                await this.connect();
            }, this.reconnectInterval);
        }
    }
}

// Создаем единственный экземпляр
const globalWebSocketService = new GlobalWebSocketService();

export default globalWebSocketService;
