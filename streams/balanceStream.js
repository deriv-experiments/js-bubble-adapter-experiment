import jsonObjectsToBubbleThings from '../utils/jsonObjectsToBubbleThings.js';

class BalanceStream {
    constructor(subscription, authStore) {
        this.subscription = subscription;
        this.authStore = authStore;
    }

    async subscribe(onDataHandler) {
        try {

            await this.authStore.waitForAuthorization();

            const onData = (response) => {
                const _data = jsonObjectsToBubbleThings(response["balance"]);
                onDataHandler(_data);
            }

            const onError = () => { };

            await this.subscription.subscribe("balance", {}, onData, onError);
        } catch (error) {
            throw error;
        }
    }

    async unsubscribe() {
        try {
            await this.subscription.unsubscribeByStreamTypes(["balance"]);
        } catch (error) {
            throw error;
        }
    }
};

export default BalanceStream;