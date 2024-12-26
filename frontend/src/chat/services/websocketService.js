class WebSocketService {
    constructor() {
        this.socket = null;
        this.messageHandlers = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isConnected = false;
    }

    async connect(chatId) {
        if (this.socket) {
            this.disconnect();
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Токен авторизации не найден');
        }

        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/?token=${token}`);

                this.socket.onopen = () => {
                    console.log('WebSocket соединение установлено');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.socket.onclose = (event) => {
                    console.log('WebSocket соединение закрыто:', event);
                    this.isConnected = false;
                    if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        setTimeout(() => this.connect(chatId), 1000 * this.reconnectAttempts);
                    }
                };

                this.socket.onerror = (error) => {
                    console.error('WebSocket ошибка:', error);
                    this.isConnected = false;
                    reject(error);
                };

                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.messageHandlers.forEach(handler => handler(data));
                    } catch (error) {
                        console.error('Ошибка обработки сообщения:', error);
                    }
                };
            } catch (error) {
                console.error('Ошибка создания WebSocket:', error);
                reject(error);
            }
        });
    }

    sendMessage(message) {
        if (!this.isConnected) {
            throw new Error('WebSocket не подключен');
        }
        this.socket.send(JSON.stringify({ message }));
    }

    addMessageHandler(handler) {
        this.messageHandlers.add(handler);
    }

    removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }
}

export default new WebSocketService(); 