(function () {
    class TicksStream {
        constructor(wsClient) {
            this.wsClient = wsClient;
            this.data = null;
        }

        async subscribe(symbol = "WLDAUD", stateName) {
            try {
                const payload = {
                    "ticks": symbol,
                };

                const callback = (response) => {
                    if (stateName) {
                        console.log("updating state", stateName)
                        console.log(jsonObjectsToBubbleThings(response))
                        window.bubbleInstance.publishState(stateName, jsonObjectsToBubbleThings(response["tick"]));
                    }
                };

                await DerivData.simpleSubscriptionStore.subscribe("a1-pRokL65OC3LA90AgZKegzalyl34MJ", payload, callback);

            } catch (error) {
                throw error;
            }
        }
    }

    window.DerivData = window.DerivData || {};
    window.DerivData.ticksStreamStore = new TicksStream(window.DerivData.simpleWS);
})()