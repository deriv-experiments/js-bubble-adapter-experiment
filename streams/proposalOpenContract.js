import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class ProposalOpenContractStream {
    constructor(subscription) {
        this.subscription = subscription;
    }

    async subscribe(contract_id, onDataHandler, onErrorHandler) {
        try {
            const payload = {
                contract_id
            };

            const onData = (data) => {
                const _data = jsonObjectsToBubbleThings(data["proposal_open_contract"]);
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
            await this.subscription.subscribe("proposal_open_contract", payload, onData, onError);
        } catch (error) {
            throw error;
        }
    }

    async unsubscribe() {
        try {
            await this.subscription.unsubscribeByStreamTypes(["proposal_open_contract"]);
        } catch (error) {
            throw error;
        }
    }
}

export default ProposalOpenContractStream;