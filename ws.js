window.DerivSimpleWebsocketClass = (class SimpleWebSocket {
    constructor(url, pingInterval = 5000) {
        this.url = url;
        this.reqId = 0;
        this.ws = new WebSocket(url);
        this.callbacks = {};

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.req_id && this.callbacks[message.req_id]) {
                this.callbacks[message.req_id](message);
                delete this.callbacks[message.req_id];
            }
        };

        // Automatically send a ping every pingInterval milliseconds
        this.pingInterval = setInterval(() => {
            this.ws.send(JSON.stringify({ ping: 1 }));
        }, pingInterval);
    }

    request(data) {
        return new Promise((resolve, reject) => {
            if (this.ws.readyState !== WebSocket.OPEN) {
                return reject("WebSocket not open");
            }

            // Assign a unique request ID
            this.reqId += 1;
            const reqId = this.reqId;

            // Attach the req_id to the data
            const requestData = {
                ...data,
                req_id: reqId,
            };

            // Store the promise's resolve in the callbacks registry
            this.callbacks[reqId] = (response) => resolve(response);

            // Send the serialized object
            this.ws.send(JSON.stringify(requestData));
        });
    }

    close() {
        clearInterval(this.pingInterval);
        this.ws.close();
    }
});
