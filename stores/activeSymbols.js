import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class ActiveSymbolsStore {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.activeSymbolsData = null;
    }

    async request() {

        try {

            await this.wsClient.waitForConnection();

            const payload = {
                "active_symbols": "brief",
                "product_type": "basic",
                "barrier_category": ["euro_atm"],
                "contract_type": ["CALL"]
            };

            const response = await this.wsClient.request(payload);
            if (response) {
                window.bubbleInstance.publishState("activesymbols_state", jsonObjectsToBubbleThings(response));
                return response;
            }

        } catch (error) {
            throw error;
        }

    }
};

export default ActiveSymbolsStore;