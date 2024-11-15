const DEV_APPID = 65401
const PROD_APPID = 65656

const IS_DEV = window.location.pathname.includes("version-test");

const APP_ID = IS_DEV ? DEV_APPID : PROD_APPID;


class WSClient {
    constructor() {
        //
        this.url = `wss://red.derivws.com/websockets/v3?app_id=${APP_ID}&l=EN&brand=deriv`;
        this.reqId = 0;
        this.ws = new WebSocket(this.url);
        this.callbacks = {};
        this.authorized = false;
        this.connected = false; // Flag for connection status

        // Handle 'onopen', 'onmessage', and 'onclose' events
        this.ws.onopen = () => {
            this.connected = true;
            console.log("WebSocket connection established");
            if (this._connectedPromiseResolve) { // In case waiting promise exists, resolve it
                this._connectedPromiseResolve();
                this._connectedPromiseResolve = null;
            }
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.req_id && this.callbacks[message.req_id]) {
                console.log('>> resolving req_id with respons: ', message.req_id, message);
                this.callbacks[message.req_id](message);
                delete this.callbacks[message.req_id];

                if (message.authorize) {
                    this.authorized = true;
                }
            }
        };

        this.ws.onclose = () => {
            this.connected = false;
            console.log("WebSocket connection closed");
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error", error);
            this.connected = false;
        };

        // Send a ping every 5 seconds if connected
        this.pingInterval = setInterval(() => {
            if (this.connected) {
                this.ws.send(JSON.stringify({ ping: 1 }));
            }
        }, 5000);

        this._onConnectedPromise = new Promise((resolve) => {
            this._connectedPromiseResolve = resolve;
        });
    }

    // Waits for the WebSocket to be ready (returns instantly if already connected)
    waitForConnection() {
        if (this.connected) {
            return Promise.resolve(); // Already connected, resolve the promise instantly
        }

        return this._onConnectedPromise;
    }

    authorize(token) {
        return this.request({ authorize: token });
    }

    request(data) {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                return reject("WebSocket not connected");
            }

            this.reqId += 1;
            const reqId = this.reqId;

            const requestData = {
                ...data,
                req_id: reqId,
            };

            this.callbacks[reqId] = (response) => resolve(response);

            this.ws.send(JSON.stringify(requestData));
        });
    }

    close() {
        clearInterval(this.pingInterval);
        this.ws.close();
        this.connected = false;
    }
};

export default WSClient;