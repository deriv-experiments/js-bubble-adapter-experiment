import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class BuyContractStore {
    constructor(wsClient, authorizationStore) {
        this.wsClient = wsClient;
        this.authorizationStore = authorizationStore;
    }

    async request(proposalID, price, onDataHandler) {

        try {
            const payload = {
                buy: proposalID,
                price
            };

            const response = await this.wsClient.request(payload);

            if (response) {
                const contractId = response["buy"]["contract_id"];
                onDataHandler(jsonObjectsToBubbleThings(response["buy"]), contractId);
            }

        } catch (error) {
            throw error;
        }
    }
};

export default BuyContractStore;