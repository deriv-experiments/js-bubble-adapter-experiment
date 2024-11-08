import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class ProposalStream {
    constructor(subscription) {
        this.subscription = subscription;
    }

    async subscribe(tradeParams, onDataHandler) {
        try {
            const payload = {
                ...tradeParams
            };

            const onData = (data) => {
                const _data = jsonObjectsToBubbleThings(data["proposal"]);
                onDataHandler(_data);
            }
            /* 
                We do not store the subscriptionID return by subscribe as we
                unsubscribe to all `proposal` streams at ones.
            */
            await this.subscription.subscribe("proposal", payload, onData);
        } catch (error) {
            throw error;
        }
    }

    async unsubscribe() {
        try {
            await this.subscription.unsubscribeByStreamTypes(["proposal"]);
        } catch (error) {
            throw error;
        }
    }
}

export default ProposalStream;