import SubscriptionsManager from './subscriptions-manager';
import request from './request';

/**
 * WSClient as main instance
 */
export default class WSClient {
    ws?: WebSocket;
    subscriptionManager: SubscriptionsManager;
    isAuthorized = false;
    onAuthorized?: () => void;

    constructor(onAuthorized?: () => void) {
        this.onAuthorized = onAuthorized;
        this.subscriptionManager = new SubscriptionsManager();
    }

    setWs(ws: WebSocket) {
        if (this.ws !== ws) {
            this.isAuthorized = false;
            this.ws = ws;
        }
    }

    private onWebsocketAuthorized() {
        if (!this.ws) {
            return;
        }

        this.isAuthorized = true;
        this.onAuthorized?.();

        this.subscriptionManager.setAuthorizedWs(this.ws);
    }

    async request(
        name: any,
        payload?: any
    ): Promise<any> {
        if (!this.ws) {
            return Promise.reject(new Error('WS is not set'));
        }
        return request(this.ws, name, payload).then((response: any) => {
            if ((response as unknown as any).msg_type === 'authorize') {
                this.onWebsocketAuthorized();
            }

            return response;
        });
    }

    subscribe(
        name: any,
        payload: any,
        onData: (data: any) => void
    ) {
        return this.subscriptionManager?.subscribe(name, payload, onData);
    }

    async close() {
        await this.subscriptionManager.close();
        this.ws?.close();
    }
}