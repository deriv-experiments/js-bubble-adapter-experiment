import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class ProposalStream {
    constructor(subscription) {
        this.subscription = subscription;
    }

    async subscribe(tradeParams, onDataHandler, onErrorHandler) {
        try {
            const payload = {
                ...tradeParams
            };

            const onData = (response) => {
                const _data = jsonObjectsToBubbleThings(response["proposal"]);
                onDataHandler(_data);
            }

            const onError = (error) => {
                const _error = jsonObjectsToBubbleThings(error);
                onErrorHandler(_error);
            }
            /* 
                We do not store the subscriptionID return by subscribe as we
                unsubscribe to all `proposal` streams at ones.
            */
            await this.subscription.subscribe("proposal", payload, onData, onError);
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