import request, { send } from './request.js';

/**
 * Subscribes directly to backend stream
 * Backend does not support duplicate subscription on different subscriptionId though,
 * so thats why we have subscriptions manager - to group multiple FE subscriptions in one backend subscription
 */
export default class Subscription {
    authorizedWs;
    name;
    payload;

    reqId;
    subscriptionId;

    lastData;

    boundOnWsMessage;
    boundOnWsClose;

    listeners;

    setAuthorizedWs(authorizedWs) {
        if (!authorizedWs) {
            return;
        }

        this.authorizedWs = authorizedWs;

        this.authorizedWs.removeEventListener('message', this.boundOnWsMessage);
        this.authorizedWs.removeEventListener('close', this.boundOnWsClose);

        this.subscribe();
    }

    constructor(authorizedWs, name, payload) {
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

        const data = await request(this.authorizedWs, this.name, {
            subscribe: 1,
            ...this.payload,
        });

        this.reqId = data.req_id;
        this.subscriptionId = data.subscription.id;
        this.lastData = data;

        this.listeners.forEach(listener => listener(data));
    }

    addListener(onData) {
        this.listeners.push(onData);
    }

    removeListener(onData) {
        this.listeners = this.listeners.filter(listener => listener !== onData);
    }

    onWsMessage(messageEvent) {
        const data = JSON.parse(messageEvent.data);

        if (data.req_id !== this.reqId) {
            return;
        }

        this.lastData = data;
        this.listeners.forEach(listener => listener(data));
    }
}