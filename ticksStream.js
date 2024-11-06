(function () {
    class TicksStream {
        constructor(wsClient, subscription) {
            this.wsClient = wsClient;
            this.subscription = subscription;
            this.currentSubscriptionID = null;
            this.data = [];
        }

        async subscribe(symbol = "WLDAUD", onDataHandler) {
            try {
                const payload = {
                    "ticks": symbol,
                };

                const response = await this.subscription.subscribe("ticks", payload, onDataHandler);

                this.currentSubscriptionID = response;
            } catch (error) {
                throw error;
            }
        }

        async unsubscribe() {
            try {
                await this.subscription.unsubscribeById(this.currentSubscriptionID);
            } catch (error) {
                throw error;
            }
        }

        clearCache() {
            this.currentSubscriptionID = null;
            this.data = [];
        }

    }

    window.DerivData = window.DerivData || {};
    window.DerivData.ticksStreamStore = new TicksStream(window.DerivData.simpleWS, window.DerivData.subscription);
})()