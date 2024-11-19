import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class ActiveSymbolsStore {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.activeSymbolsData = null;
    }

    async request(contractType, onDataHandler) {

        try {

            await this.wsClient.waitForConnection();

            const payload = {
                active_symbols: "brief",
                product_type: "basic",
                contract_type: [contractType]
            };

            const response = await this.wsClient.request(payload);
            if (response) {
                const _data = jsonObjectsToBubbleThings(response["active_symbols"]);
                onDataHandler(_data);
                return response;
            }

        } catch (error) {
            throw error;
        }

    }
};

export default ActiveSymbolsStore;