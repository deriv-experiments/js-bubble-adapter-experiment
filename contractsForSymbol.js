(function () {
    class ContractsForSymbolStore {
        constructor(wsClient) {
            this.wsClient = wsClient;
            this.activeSymbolsData = null;
        }

        async request(symbolName) {

            try {

                await this.wsClient.waitForConnection();

                console.log("symbol", symbolName)
                if (!symbolName) {
                    throw new Error("Error: no symbol selected for contracts_for ")
                }


                const payload = {
                    "contracts_for": symbolName,
                    "currency": "USD",
                    "landing_company": "svg",
                    "product_type": "basic"
                };

                const response = await this.wsClient.request(payload);
                if (response) {
                    console.log(jsonObjectsToBubbleThings(response["contracts_for"]))
                    window.bubbleInstance.publishState("contractsforsymbol_state", jsonObjectsToBubbleThings(response["contracts_for"]));
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