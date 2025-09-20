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

    connect() {
        if (this.isConnected || this.socket?.readyState === WebSocket.OPEN) {
            console.log('🔔 [GlobalWebSocket] Already connected');
            return;
        }

        try {
            const token = tokenService.getAccessToken();
            if (!token) {
                console.error('🔔 [GlobalWebSocket] No token available');
                return;
            }

            const wsUrl = `ws://127.0.0.1:8000/ws/counter/?token=${token}`;
            console.log('🔔 [GlobalWebSocket] Connecting to:', wsUrl);

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('🔔 [GlobalWebSocket] ✅ Connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.startPingInterval();
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('🔔 [GlobalWebSocket] Received:', data);
                    
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
                            console.log('🔔 [GlobalWebSocket] ✅ Counter updated');
                        }
                    }
                } catch (error) {
                    console.error('🔔 [GlobalWebSocket] Error parsing message:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('🔔 [GlobalWebSocket] ❌ Disconnected');
                this.isConnected = false;
                this.stopPingInterval();
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error('🔔 [GlobalWebSocket] ❌ Error:', error);
            };

        } catch (error) {
            console.error('🔔 [GlobalWebSocket] Connection error:', error);
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
            console.log(`🔔 [GlobalWebSocket] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('🔔 [GlobalWebSocket] Max reconnection attempts reached');
        }
    }
}

// Создаем единственный экземпляр
const globalWebSocketService = new GlobalWebSocketService();

export default globalWebSocketService;
