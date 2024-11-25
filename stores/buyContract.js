import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class BuyContractStore {
    constructor(wsClient, authorizationStore) {
        this.wsClient = wsClient;
        this.authorizationStore = authorizationStore;
    }

    async request(proposalID, price, onDataHandler, onErrorHandler) {

        try {
            const payload = {
                buy: proposalID,
                price
            };

            const response = await this.wsClient.request(payload);

            if (response) {
                if ("error" in response) {
                    const _error = jsonObjectsToBubbleThings(response["error"]);
                    onErrorHandler(_error);
                    throw response["error"];
                }

                const contractId = response["buy"]["contract_id"];
                onDataHandler(jsonObjectsToBubbleThings(response["buy"]), contractId);
            }

        } catch (error) {
            throw error;
        }
    }
};

export default BuyContractStore;