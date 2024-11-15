import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class TicksStream {
    constructor(subscription) {
        this.subscription = subscription;
        this.currentSubscriptionID = null;
        this.data = [];
    }

    async subscribe(symbol = "WLDAUD", onDataHandler) {
        try {
            const payload = {
                "ticks": symbol,
            };

            const onData = (data) => {
                this.data.push(jsonObjectsToBubbleThings(data["tick"]));
                onDataHandler(this.data);
            };

            const response = await this.subscription.subscribe("ticks", payload, onData);

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