import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class BuyContractStore {
    constructor(wsClient, authorizationStore) {
        this.wsClient = wsClient;
        this.authorizationStore = authorizationStore;
    }

    async request(proposalID, price, onDataHandler) {

        try {
            await this.authorizationStore.waitForAuthorization(
                "a1-pRokL65OC3LA90AgZKegzalyl34MJ"
            );

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