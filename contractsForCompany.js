(function () {
    class ContractsForCompanyStore {
        constructor(wsClient) {
            this.wsClient = wsClient;
            this.data = null;
        }
        async request(onDataHandler) {

            try {
                await this.wsClient.waitForConnection();

                const _payload = {
                    contracts_for_company: 1,
                }

                const response = await this.wsClient.request(_payload);

                if (response) {
                    this.data = response["contracts_for_company"];
                    onDataHandler(jsonObjectsToBubbleThings(this.data));
                    return response;
                }

            } catch (error) {
                throw error;
            }

        }
    };

    window.DerivData = window.DerivData || {};
    window.DerivData.contractsForCompanyStore = new ContractsForCompanyStore(window.DerivData.simpleWS);
})()