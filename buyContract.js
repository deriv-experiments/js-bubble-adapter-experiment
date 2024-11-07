(function () {
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
                    onDataHandler(response);
                }

            } catch (error) {
                throw error;
            }
        }
    }

    window.DerivData = window.DerivData || {};
    window.DerivData.buyContractStore = new BuyContractStore(window.DerivData.simpleWS, window.DerivData.authorizationStore);
})()