(function () {
    class ContractsForSymbolStore {
        constructor(wsClient) {
            this.wsClient = wsClient;
            this.data = null;
        }

        async request(payload, onDataHandler) {

            try {
                await this.wsClient.waitForConnection();

                const _payload = {
                    contracts_for: payload.symbol,
                    currency: payload.currency
                }

                const response = await this.wsClient.request(_payload);

                if (response) {
                    this.data = response["contracts_for"];
                    onDataHandler(jsonObjectsToBubbleThings(this.data));
                    return response;
                }

            } catch (error) {
                throw error;
            }

        }
    };

    window.DerivData = window.DerivData || {};
    window.DerivData.contractsForSymbolStore = new ContractsForSymbolStore(window.DerivData.simpleWS);
})()