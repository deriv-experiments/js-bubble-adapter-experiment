import SubscriptionsManager from './subscriptions-manager.js';
import request from './request.js';

/**
 * WSClient as main instance
 */
export default class WSClient {
    ws;
    subscriptionManager;
    isAuthorized = false;
    onAuthorized;

    constructor(onAuthorized) {
        this.onAuthorized = onAuthorized;
        this.subscriptionManager = new SubscriptionsManager();
    }

    setWs(ws) {
        if (this.ws !== ws) {
            this.isAuthorized = false;
            this.ws = ws;
        }
    }

    authorize(token) {
        if (!this.ws) {
            return Promise.reject(new Error('WS is not set'));
        }

        return this.request('authorize', { token });
    }

    onWebsocketAuthorized() {
        if (!this.ws) {
            return;
        }

        this.isAuthorized = true;
        this.onAuthorized?.();

        this.subscriptionManager.setAuthorizedWs(this.ws);
    }

    async request(name, payload) {
        if (!this.ws) {
            return Promise.reject(new Error('WS is not set'));
        }

        return request(this.ws, name, payload).then((response) => {
            if (response.msg_type === 'authorize') {
                this.onWebsocketAuthorized();
            }

            return response;
        });
    }

    subscribe(name, payload, onData) {
        return this.subscriptionManager?.subscribe(name, payload, onData);
    }

    async close() {
        await this.subscriptionManager.close();
        this.ws?.close();
    }
}