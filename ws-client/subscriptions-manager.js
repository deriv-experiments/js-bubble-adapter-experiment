import Subscription from './subscription.js';
import getQueryKeys from './get-query-keys.js';

export default class SubscriptionsManager {
    backendSubscriptions = new Map();
    authorizedWs;

    setAuthorizedWs(authorizedWs) {
        this.authorizedWs = authorizedWs;

        this.backendSubscriptions.forEach(subscription => {
            subscription.setAuthorizedWs(authorizedWs);
        });
    }

    async close() {
        if (!this.authorizedWs) {
            return;
        }

        // Collect promises from the async unsubscribe calls
        const unsubscribePromises = Array.from(this.backendSubscriptions.values()).map(async backendSubscription => {
            await backendSubscription.unsubscribe();
        });

        // Clear the subscriptions map after all promises have resolved
        this.backendSubscriptions.clear();

        // Await all the unsubscribe promises to finish
        await Promise.all(unsubscribePromises);
    }

    async subscribe(name, payload, onData) {
        if (!this.authorizedWs) {
            throw new Error('Unauthorized websocket connection.');
        }

        const keys = getQueryKeys(name, payload);
        const key = keys.join('-');

        let backendSubscription;

        if (!this.backendSubscriptions.has(key)) {
            backendSubscription = new Subscription(this.authorizedWs, name, payload);
            this.backendSubscriptions.set(key, backendSubscription);

            await backendSubscription.subscribe();
        }

        backendSubscription = this.backendSubscriptions.get(key);
        backendSubscription?.addListener(onData);

        if (backendSubscription?.lastData) {
            onData(backendSubscription.lastData);
        }

        return {
            unsubscribe: async () => {
                // find and remove listener
                backendSubscription?.removeListener(onData);

                // if no more listeners,
                //   - unsubscribe from backend
                //   - remove from BEsubscriptionsByKey
                if (backendSubscription?.listeners.length === 0) {
                    this.backendSubscriptions.delete(key);

                    await backendSubscription.unsubscribe();
                }
            },
        };
    }
}