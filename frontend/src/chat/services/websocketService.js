class WebSocketService {
    constructor() {
        this.socket = null;
        this.messageHandlers = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async connect(chatId) {
        if (this.socket) {
            this.socket.close();
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/?token=${token}`);

            this.socket.onopen = () => {
                this.reconnectAttempts = 0;
                resolve();
            };

            this.socket.onclose = (event) => {
                if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(chatId), 1000 * this.reconnectAttempts);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.messageHandlers.forEach(handler => handler(data));
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };
        });
    }

    sendMessage(message) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ message }));
        }
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
        }
    }
}

export default new WebSocketService(); 