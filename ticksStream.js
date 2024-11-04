(function () {
    class TicksStream {
        constructor(wsClient) {
            this.wsClient = wsClient;
            this.data = [{ ask: 0, epoch: 0 }];
            this.currentSubscriptionID = null;
        }

        async subscribe(symbol = "WLDAUD", stateName) {
            this.unsubscribe();

            try {
                const payload = {
                    "ticks": symbol,
                };

                const callback = (response) => {
                    if (stateName) {
                        console.log("updating state", stateName)
                        this.data.push(jsonObjectsToBubbleThings(response["tick"]));
                        window.bubbleInstance.publishState(stateName, this.data);
                    }
                };

                const response = await DerivData.simpleSubscriptionStore.subscribe("a1-pRokL65OC3LA90AgZKegzalyl34MJ", payload, callback);

                this.currentSubscriptionID = response.subscription.id;
                return response.subscription.id;

            } catch (error) {
                throw error;
            }
        }


        async unsubscribe() {
            if (this.currentSubscriptionID) {
                await DerivData.simpleSubscriptionStore.unsubscribe(this.currentSubscriptionID);
                this.currentSubscriptionID = null;
                this.data = [];
            }
        }

    }

    window.DerivData = window.DerivData || {};
    window.DerivData.ticksStreamStore = new TicksStream(window.DerivData.simpleWS);
})()