import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

class ActiveSymbolsStore {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.activeSymbolsData = null;
    }

    async request(contractType, onDataHandler, onErrorHandler) {

        try {

            await this.wsClient.waitForConnection();

            const payload = {
                active_symbols: "brief",
                product_type: "basic",
                contract_type: [contractType]
            };

            const response = await this.wsClient.request(payload);
            if (response) {
                if ("error" in response) {
                    const _error = jsonObjectsToBubbleThings(response["error"]);
                    onErrorHandler(_error);
                    throw response["error"];
                }

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