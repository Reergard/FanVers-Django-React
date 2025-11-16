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
        console.log('🔔 [GlobalWebSocket] === START CONNECT ===');
        console.log('🔔 [GlobalWebSocket] Time:', new Date().toISOString());
        console.log('🔔 [GlobalWebSocket] Current state:', {
            isConnected: this.isConnected,
            socketState: this.socket?.readyState,
            reconnectAttempts: this.reconnectAttempts
        });
        
        if (this.isConnected || this.socket?.readyState === WebSocket.OPEN) {
            console.log('🔔 [GlobalWebSocket] Already connected, skipping');
            return;
        }

        try {
            console.log('🔔 [GlobalWebSocket] Шаг 1: Получаем access token...');
            // Используем getAccessSync() для синхронного получения токена
            // или getValidAccess() если нужен refresh
            const token = tokenService.getAccessSync ? tokenService.getAccessSync() : null;
            console.log('🔔 [GlobalWebSocket] Шаг 1: Token получен:', token ? `${token.substring(0, 20)}...` : 'NULL');
            
            if (!token) {
                console.error('🔔 [GlobalWebSocket] Шаг 1: No token available');
                return;
            }

            const wsUrl = `ws://127.0.0.1:8000/ws/counter/?token=${token}`;
            console.log('🔔 [GlobalWebSocket] Шаг 2: Создаем WebSocket connection...');
            console.log('🔔 [GlobalWebSocket] Шаг 2: URL:', wsUrl.replace(token, 'TOKEN...'));

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('🔔 [GlobalWebSocket] === WEBSOCKET OPENED ===');
                console.log('🔔 [GlobalWebSocket] Time:', new Date().toISOString());
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('🔔 [GlobalWebSocket] Starting ping interval...');
                this.startPingInterval();
                console.log('🔔 [GlobalWebSocket] === CONNECTED ===');
            };

            this.socket.onmessage = (event) => {
                console.log('🔔 [GlobalWebSocket] === MESSAGE RECEIVED ===');
                console.log('🔔 [GlobalWebSocket] Time:', new Date().toISOString());
                console.log('🔔 [GlobalWebSocket] Raw data:', event.data);
                
                try {
                    const data = JSON.parse(event.data);
                    console.log('🔔 [GlobalWebSocket] Parsed data:', data);
                    
                    if (data.type === 'message') {
                        console.log('🔔 [GlobalWebSocket] Message type detected, updating counter...');
                        // Обновляем счетчик непрочитанных сообщений
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUsername = currentUser?.username;
                        console.log('🔔 [GlobalWebSocket] Current username:', currentUsername);
                        console.log('🔔 [GlobalWebSocket] Sender username:', data.sender?.username);
                        
                        if (currentUsername && data.sender?.username !== currentUsername) {
                            console.log('🔔 [GlobalWebSocket] Dispatching addMessage to Redux...');
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
                            console.log('🔔 [GlobalWebSocket] Counter updated in Redux');
                        } else {
                            console.log('🔔 [GlobalWebSocket] Message from self or no username, skipping counter update');
                        }
                    } else {
                        console.log('🔔 [GlobalWebSocket] Other message type:', data.type);
                    }
                } catch (error) {
                    console.error('🔔 [GlobalWebSocket] Error parsing message:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('🔔 [GlobalWebSocket] === WEBSOCKET CLOSED ===');
                console.log('🔔 [GlobalWebSocket] Time:', new Date().toISOString());
                console.log('🔔 [GlobalWebSocket] Close code:', event.code);
                console.log('🔔 [GlobalWebSocket] Close reason:', event.reason);
                console.log('🔔 [GlobalWebSocket] Was clean:', event.wasClean);
                this.isConnected = false;
                this.stopPingInterval();
                console.log('🔔 [GlobalWebSocket] Attempting reconnect...');
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error('🔔 [GlobalWebSocket] === WEBSOCKET ERROR ===');
                console.error('🔔 [GlobalWebSocket] Time:', new Date().toISOString());
                console.error('🔔 [GlobalWebSocket] Error:', error);
            };

        } catch (error) {
            console.error('🔔 [GlobalWebSocket] Connection error:', error);
        }
    }

    disconnect() {
        console.log('🔔 [GlobalWebSocket] === DISCONNECT ===');
        console.log('🔔 [GlobalWebSocket] Time:', new Date().toISOString());
        console.log('🔔 [GlobalWebSocket] Current state:', {
            isConnected: this.isConnected,
            socketState: this.socket?.readyState
        });
        
        if (this.socket) {
            console.log('🔔 [GlobalWebSocket] Closing WebSocket...');
            this.socket.close();
            this.socket = null;
            console.log('🔔 [GlobalWebSocket] WebSocket closed');
        } else {
            console.log('🔔 [GlobalWebSocket] No socket to disconnect');
        }
        this.isConnected = false;
        console.log('🔔 [GlobalWebSocket] Stopping ping interval...');
        this.stopPingInterval();
        console.log('🔔 [GlobalWebSocket] === DISCONNECTED ===');
    }

    startPingInterval() {
        console.log('🔔 [GlobalWebSocket] Starting ping interval (30 seconds)...');
        this.pingInterval = setInterval(() => {
            if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
                console.log('🔔 [GlobalWebSocket] Sending ping...');
                this.socket.send(JSON.stringify({ type: 'ping' }));
                this.lastPingTime = Date.now();
                console.log('🔔 [GlobalWebSocket] Ping sent, last ping time updated');
            } else {
                console.log('🔔 [GlobalWebSocket] Not connected or socket not open, skipping ping');
            }
        }, 30000); // Ping every 30 seconds
        console.log('🔔 [GlobalWebSocket] Ping interval started');
    }

    stopPingInterval() {
        if (this.pingInterval) {
            console.log('🔔 [GlobalWebSocket] Stopping ping interval...');
            clearInterval(this.pingInterval);
            this.pingInterval = null;
            console.log('🔔 [GlobalWebSocket] Ping interval stopped');
        } else {
            console.log('🔔 [GlobalWebSocket] No ping interval to stop');
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔔 [GlobalWebSocket] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            console.log(`🔔 [GlobalWebSocket] Delay: ${this.reconnectInterval}ms`);
            
            setTimeout(async () => {
                console.log(`🔔 [GlobalWebSocket] Reconnect timeout expired, calling connect...`);
                await this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('🔔 [GlobalWebSocket] Max reconnection attempts reached');
        }
    }
}

// Создаем единственный экземпляр
const globalWebSocketService = new GlobalWebSocketService();

export default globalWebSocketService;
