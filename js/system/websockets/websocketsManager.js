export class WebSocketManager {
    constructor() {
        this.reconnectionInterval = 5000;
        this.sockets = new Map();
        this.reconnectionTimers = new Map();
        this.pendingConnections = new Map();
        this.activeSocketKey = new Set();
    }
    initialize(key, url, onMessage) {
        if (!this.reconnectionTimers.has(key))
            console.log(`Initializing WebSocket "${key}"...`);
        if (this.sockets.has(key)) {
            console.warn(`WebSocket "${key}" is already existing.`);
            return;
        }
        this.pendingConnections.set(key, { url, onMessage });
        const socket = new WebSocket(url);
        socket.onopen = () => {
            console.log(`WebSocket "${key}" successfully connected.`);
            this.handleSocketSuccess(key);
        };
        socket.onmessage = (event) => {
            onMessage(event.data);
        };
        socket.onerror = () => { };
        socket.onclose = () => {
            console.log(`WebSocket "${key}" closed.`);
            this.sockets.delete(key);
            const processedSocketKey = key.split('-')[0] + '-secondary';
            this.sockets.delete(processedSocketKey);
            this.pendingConnections.delete(processedSocketKey);
            if (this.activeSocketKey.has(key)) {
                console.log(`The active WebSocket "${key}" was closed. Reinitializing all WebSockets...`);
                this.activeSocketKey.delete(key);
                this.activeSocketKey.delete(processedSocketKey);
                this.reinitializeAll();
            }
            else {
                if (!this.activeSocketKey.size)
                    this.scheduleReconnection(key, url, onMessage);
            }
        };
        this.sockets.set(key, socket);
    }
    handleSocketSuccess(key) {
        console.log(`WebSocket "${key}" is now the active connection.`);
        this.activeSocketKey.add(key);
        this.disconnectAllExcept(key);
        this.clearReconnectionTimers(key);
    }
    scheduleReconnection(key, url, onMessage) {
        if (this.reconnectionTimers.has(key))
            return;
        console.log(`Scheduling reconnection for WebSocket "${key}" in ${this.reconnectionInterval}ms.`);
        const timer = setTimeout(() => {
            console.log(`Reconnecting WebSocket "${key}"...`);
            this.initialize(key, url, onMessage);
            this.reconnectionTimers.delete(key);
        }, this.reconnectionInterval);
        this.reconnectionTimers.set(key, timer);
    }
    disconnectAllExcept(key) {
        const processedSocketKey = key.split('-')[0];
        this.sockets.forEach((socket, socketKey) => {
            if (socketKey !== key && !socketKey.startsWith(processedSocketKey)) {
                console.log(`Closing WebSocket "${socketKey}" because "${key}" is now active.`);
                socket.close();
                this.sockets.delete(socketKey);
            }
        });
    }
    clearReconnectionTimers(key) {
        if (key) {
            const processedSocketKey = key.split('-')[0];
            this.reconnectionTimers.forEach((timer, timerKey) => {
                if (timerKey !== key && !timerKey.startsWith(processedSocketKey)) {
                    clearTimeout(timer);
                }
            });
        }
        else {
            this.reconnectionTimers.forEach((timer) => clearTimeout(timer));
        }
        this.reconnectionTimers.clear();
    }
    reinitializeAll() {
        console.log(`Reinitializing all WebSockets...`);
        this.pendingConnections.forEach((connection, key) => {
            this.initialize(key, connection.url, connection.onMessage);
        });
    }
    sendMessage(key, message) {
        const socket = this.sockets.get(key);
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.error(`Cannot send message. WebSocket "${key}" is not connected.`);
            return;
        }
        socket.send(message);
        console.log(`Message sent to WebSocket "${key}": ${message}`);
    }
    disconnectAll() {
        console.log(`Disconnecting all WebSockets.`);
        this.sockets.forEach((socket, key) => {
            console.log(`Closing WebSocket "${key}".`);
            socket.close();
        });
        this.sockets.clear();
        this.activeSocketKey.clear();
        this.clearReconnectionTimers();
    }
}
