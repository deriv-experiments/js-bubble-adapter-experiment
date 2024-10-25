(function() {
    class SimpleSubscriptionStore {
        constructor(wsClient, authStore) {
            this.wsClient = wsClient;
            this.authStore = authStore;
            this.activeSubscription = null;   // Only ONE subscription at a time
            this.subscriptionPromise = null;  // Hold the active subscription promise
        }

        // Subscribe and wait for authorization first
        async subscribe(subscriptionName, token, payload = {}) {
            if (this.subscriptionPromise) {
                console.warn("Subscription is already active. Only one allowed!");
                return this.subscriptionPromise;
            }

            try {
                // Wait for authorization first
                await this.authStore.waitForAuthorization(token);
                console.log("Authorization succeeded. Proceeding with subscription...");

                // Wait for WS connection
                await this.wsClient.waitForConnection();

                // Construct the subscription request payload
                const requestData = {
                    [subscriptionName]: 1,
                    subscribe: 1,
                    ...payload
                };

                console.log("Sending subscription request:", requestData);
                this.subscriptionPromise = this.wsClient.request(requestData);

                // Wait for server response
                const response = await this.subscriptionPromise;

                if (response[subscriptionName] && response.req_id) {
                    this.activeSubscription = response.req_id;
                    console.log(`Subscription confirmed for ${subscriptionName} with req_id:`, response.req_id);

                    this._startListeningToMessages();
                    return response;
                }

                // If something explodes
                throw new Error("Subscription failed!");

            } catch (error) {
                console.error("Subscription error:", error);
                this.subscriptionPromise = null;
                throw error;
            }
        }

        // Register a listener for the incoming subscription messages
        _startListeningToMessages() {
            this.wsClient.ws.addEventListener("message", (event) => {
                const message = JSON.parse(event.data);

                if (message.req_id === this.activeSubscription) {
                    console.log("Received subscription update:", message);
                    // Handle messages here
                }
            });
        }
    }

    // Expose to global window, including authorization store
    window.DerivData = window.DerivData || {};
    window.DerivData.simpleSubscriptionStore = new SimpleSubscriptionStore(
        window.DerivData.simpleWS, 
        window.DerivData.authorizationStore
    );
})();