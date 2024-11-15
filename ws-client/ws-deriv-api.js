import WSClient from './ws-client.js'; // Import the WSClient we defined earlier

export default class WsDerivApi {
    client;
    token;
    reconnectDelay;
    maxReconnectDelay;
    reconnectAttempts;
    maxReconnectAttempts;
    isConnected;
  
    constructor(token, reconnectDelay = 1000, maxReconnectDelay = 16000, maxReconnectAttempts = 5) {
        this.token = token;
        this.reconnectDelay = reconnectDelay;
        this.maxReconnectDelay = maxReconnectDelay;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = maxReconnectAttempts;
        this.isConnected = false;
        this.client = new WSClient(() => {
            console.log('Connected and authorized successfully.');
            this.isConnected = true;
        });
        this.#connect();
    }

    #connect() {
        return;
        const wsUrl = `wss://example.com/websocket`;  // Modify to your actual WebSocket URL

        const websocket = new WebSocket(wsUrl);

        // Attempt connection and set event listeners
        websocket.onopen = async () => {
            console.log(`WebSocket connection is open.`);
            try {
                await this.client.setWs(websocket);  // Set the new WebSocket instance in WSClient
                await this.client.authorize(this.token);  // Send authorization request

                this.#resetReconnection();

                console.log('WebSocket authorized and ready!');
            } catch (error) {
                console.error('Authorization or connection error:', error);

                websocket.close();  // Force connection to close and attempt reconnection.
            }
        };

        websocket.onclose = () => {
            console.log('WebSocket closed, attempting to reconnect...');
            this.isConnected = false;
            this.#attemptReconnect();
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            websocket.close();
        };
    }

    #attemptReconnect() {
        // If reached max reconnect attempts, give up
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("Max reconnect attempts reached. Connection failed.");
            return;
        }

        // Exponential Backoff for reconnection attempts
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
        this.reconnectAttempts++;

        setTimeout(() => {
            console.log(`Reconnecting attempt #${this.reconnectAttempts} after ${delay / 1000} seconds...`);
            this.#connect();
        }, delay);
    }

    #resetReconnection() {
        // Reset any reconnection variables since we’ve successfully reconnected
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;  // Reset delay to initial value
    }

    // Subscribe to data (will be re-subscription upon reconnection)
    subscribe(name, payload, onData) {
        if (!this.isConnected) {
            console.error("Cannot subscribe, WebSocket is not connected");
            return;
        }
        return this.client.subscribe(name, payload, onData);
    }

    // Close the connection gracefully
    async closeConnection() {
        console.log("Closing WebSocket connection...");
        this.client.close();
    }
}