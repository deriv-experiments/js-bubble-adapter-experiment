/**
 * this is simple websocket, 
 * todo: needs to support subscriptions like the one here: https://github.com/deriv-com/deriv-app/tree/master/packages/api-v2/src/ws-client
 * also, needs to be properly compiles and setup, 
 * but for the sake of PoC this is good enough, 
 */
window.DerivData = {};

window.DerivData.simpleWs = new (class SimpleWebSocket {
    constructor() {
        this.url = "wss://green.derivws.com/websockets/v3?app_id=16929&l=EN&brand=deriv";
        this.reqId = 0;
        this.ws = new WebSocket(this.url);
        this.callbacks = {};
        this.authorized = false;

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.req_id && this.callbacks[message.req_id]) {
                this.callbacks[message.req_id](message);
                delete this.callbacks[message.req_id];

                if (message.authorize) {
                    this.authorized = true;
                }
            }
        };

        // Automatically send a ping every pingInterval milliseconds
        this.pingInterval = setInterval(() => {
            this.ws.send(JSON.stringify({ ping: 1 }));
        }, 5000);
    }

    authorize(token) {
        return this.request({ authorize: token });
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
