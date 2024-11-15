import request, { send } from './request';

/**
 * Subscribes directly to backend stream
 * Backend does not support duplicate subscription on different subscriptionId though,
 * so thats why we have subscriptions manager - to group multiple FE subscription in one backend subscriptions
 */
export default class Subscription {
    authorizedWs: WebSocket;
    name: any;
    payload: any;

    reqId: number | null;
    subscriptionId: string | null;

    lastData: any;

    boundOnWsMessage: (messageEvent: MessageEvent) => void;
    boundOnWsClose: () => void;

    listeners: Array<(data: any) => void>;

    setAuthorizedWs(authorizedWs?: WebSocket) {
        if (!authorizedWs) {
            return;
        }

        this.authorizedWs = authorizedWs;

        this.authorizedWs.removeEventListener('message', this.boundOnWsMessage);
        this.authorizedWs.removeEventListener('close', this.boundOnWsClose);

        this.subscribe();
    }

    constructor(
        authorizedWs: WebSocket,
        name: any,
        payload: any
    ) {
        this.authorizedWs = authorizedWs;
        this.name = name;
        this.payload = payload;

        this.reqId = null;
        this.subscriptionId = null;

        this.lastData = null;

        this.boundOnWsMessage = this.onWsMessage.bind(this);
        this.boundOnWsClose = this.onWsClose.bind(this);

        this.listeners = [];
    }

    async unsubscribe() {
        this.authorizedWs.removeEventListener('message', this.boundOnWsMessage);
        this.authorizedWs.removeEventListener('close', this.boundOnWsClose);
        send(this.authorizedWs, 'forget', { forget: this.subscriptionId });
    }

    onWsClose() {
        this.authorizedWs.removeEventListener('message', this.boundOnWsMessage);
        this.authorizedWs.removeEventListener('close', this.boundOnWsClose);
    }

    async subscribe() {
        this.authorizedWs.addEventListener('message', this.boundOnWsMessage);
        this.authorizedWs.addEventListener('close', this.boundOnWsClose);

        const data: any = await request(this.authorizedWs, this.name, {
            subscribe: 1,
            ...this.payload,
        });

        this.reqId = data.req_id;
        this.subscriptionId = data.subscription.id;
        this.lastData = data;

        this.listeners.forEach(listener => listener(data));
    }

    addListener(onData: (data: any) => void) {
        this.listeners.push(onData);
    }

    removeListener(onData: (data: any) => void) {
        this.listeners = this.listeners.filter(listener => listener !== onData);
    }

    onWsMessage(messageEvent: MessageEvent) {
        const data = JSON.parse(messageEvent.data) as any;

        if (data.req_id !== this.reqId) {
            return;
        }

        this.lastData = data;
        this.listeners.forEach(listener => listener(data));
    }
}