(function () {
    class Forget {
        constructor(wsClient) {
            this.wsClient = wsClient;
        }

        async requestOne(subscriptionID) {

            try {
                const payload = {
                    forget: subscriptionID
                }

                const response = await this.wsClient.request(payload);

                if (response) {
                    console.log("Forget successful for id:", subscriptionID)
                    return response;
                }
            } catch (error) {
                throw error;
            }
        }

        async requestAll(streamTypes) {

            try {

                const payload = {
                    forget_all: streamTypes
                }

                const response = await this.wsClient.request(payload);

                if (response) {
                    console.log("Forget successful for stream:", streamTypes)
                    return response;
                }
            } catch (error) {
                throw error;
            }
        }
    }

    window.DerivData = window.DerivData || {};
    window.DerivData.forget = new Forget(window.DerivData.simpleWS);
})()