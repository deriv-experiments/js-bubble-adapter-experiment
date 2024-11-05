(function () {
    class ProposalStore {

        constructor(wsClient, subscriptionStore, forget) {
            this.wsClient = wsClient;
            this.data = null;
            this.currentSubscriptionID = null;
            this.subscriptionStore = subscriptionStore;
            this.forget = forget;
        }

        async subscribe(tradeParams, stateToUpdate) {
            try {
                await this.unsubscribe();

                const payload = {
                    ...tradeParams,
                    proposal: 1,
                };

                const callback = (response) => {
                    if (stateToUpdate) {
                        console.log("updating", stateToUpdate, "with proposal data");
                        // update exposed bubble state from plugin
                        window.bubbleInstance.publishState(stateToUpdate, jsonObjectsToBubbleThings(response));
                    }
                };

                const response = await this.subscriptionStore.subscribe("a1-pRokL65OC3LA90AgZKegzalyl34MJ", payload, callback);
                console.log(tradeParams)

                this.currentSubscriptionID = response.subscription.id;

                console.log(response)
            } catch (error) {

            }
        }

        async unsubscribe() {
            try {
                const response = await this.forget.requestAll("proposal", "a1-pRokL65OC3LA90AgZKegzalyl34MJ");
                return response;
            } catch (error) {
                throw error;
            }
        }
    }


    window.DerivData = window.DerivData || {};
    window.DerivData.proposalStore = new ProposalStore(window.DerivData.simpleWS, window.DerivData.simpleSubscriptionStore, window.DerivData.forget);
})()

/* 
{
    "proposal": 1,
    "subscribe": 1,
    "amount": 10,
    "basis": "stake",
    "contract_type": "PUT",
    "currency": "USD",
    "symbol": "frxAUDJPY",
    "duration": 1,
    "duration_unit": "d",
    "req_id": 19
}



{

    "ask_price": 10,
    "contract_details": {
        "barrier": "100.729"
    },
    "date_expiry": 1730937599,
    "date_start": 1730794767,
    "display_value": "10.00",
    "id": "018d03a0-af3b-aa71-fd4d-4ddf618826cb",
    "longcode": "Win payout if AUD/JPY is strictly higher than entry spot at close on 2024-11-06.",
    "payout": 17.33,
    "spot": 100.729,
    "spot_time": 1730794766,
    "validation_params": {
        "payout": {
            "max": "20000.00"
        },
        "stake": {
            "min": "0.50"
        }
    }
}

*/