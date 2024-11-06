(function () {
    class ProposalStore {

        constructor(wsClient, subscription) {
            this.wsClient = wsClient;
            this.subscription = subscription;
        }

        async subscribe(tradeParams, onDataHandler) {
            try {
                const payload = {
                    ...tradeParams
                };
                /* 
                    We do not store the subscriptionID return by subscribe as we
                    unsubscribe to all `proposal` streams at ones.
                */
                await this.subscription.subscribe("proposal", payload, onDataHandler);
            } catch (error) {
                throw error;
            }
        }

        async unsubscribe() {
            try {
                await this.subscription.unsubscribeByStreamTypes(["proposal"]);
            } catch (error) {
                throw error;
            }
        }
    }


    window.DerivData = window.DerivData || {};
    window.DerivData.proposalStore = new ProposalStore(window.DerivData.simpleWS, window.DerivData.subscription);
})()

/* 

{
    "proposal": 1,
    "amount": 10,
    "basis": "stake",
    "contract_type": "PUT",
    "currency": "USD",
    "symbol": "frxAUDJPY",
    "duration": 1,
    "duration_unit": "d",
}


*/