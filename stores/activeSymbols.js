import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class ActiveSymbolsStore {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.activeSymbolsData = null;
    }

    async request(onDataHandler) {

        try {

            await this.wsClient.waitForConnection();

            const payload = {
                "active_symbols": "brief",
                "product_type": "basic",
                
            };

            const response = await this.wsClient.request(payload);
            if (response) {
                onDataHandler(jsonObjectsToBubbleThings(response));
                return response;
            }

        } catch (error) {
            throw error;
        }

    }
};

export default ActiveSymbolsStore;