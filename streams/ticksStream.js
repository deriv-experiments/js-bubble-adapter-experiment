import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class TicksStream {
    constructor(subscription) {
        this.subscription = subscription;
        this.currentSubscriptionID = null;
        this.data = [];
    }

    async subscribe(symbol, onDataHandler, onErrorHandler) {
        try {
            const payload = {
                "ticks": symbol,
            };

            const onData = (data) => {
                this.data.push(jsonObjectsToBubbleThings(data["tick"]));
                onDataHandler(this.data);
            };

            const onError = (error) => {
                const _error = jsonObjectsToBubbleThings(error);
                onErrorHandler(_error);
            }

            const response = await this.subscription.subscribe("ticks", payload, onData, onError);

            this.currentSubscriptionID = response;
        } catch (error) {
            throw error;
        }
    }

    async unsubscribe() {
        try {
            await this.subscription.unsubscribeById(this.currentSubscriptionID);
            this.data = [];
        } catch (error) {
            throw error;
        }
    }

    clearCache() {
        this.currentSubscriptionID = null;
        this.data = [];
    }

};

export default TicksStream;