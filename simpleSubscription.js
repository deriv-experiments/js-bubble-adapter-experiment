(function () {
    class SimpleSubscriptionStore {
        constructor(wsClient, authStore) {
            this.wsClient = wsClient;
            this.authStore = authStore;
            this.activeSubscriptions = {};   // Only ONE subscription at a time
            // this.subscriptionPromise = {};  // Hold the active subscription promise
        }

        // Subscribe and wait for authorization first
        async subscribe(subscriptionName, token, payload = {}) {
            if (this.activeSubscriptions[subscriptionName] && this.activeSubscriptions.promise) {
                console.warn("Subscription is already active. Only one allowed!");
                return this.activeSubscriptions[subscriptionName].promise;
            }

            this.activeSubscriptions[subscriptionName] = {};

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
                this.activeSubscriptions[subscriptionName]["promise"] = this.wsClient.request(requestData);

                // Wait for server response
                const response = await this.activeSubscriptions[subscriptionName].promise;

                if (response.req_id) {
                    this.activeSubscriptions[subscriptionName]["id"] = response.subscription.id;
                    console.log(`Subscription confirmed for ${subscriptionName} with req_id:`, response.subscription.id);

                    this._startListeningToMessages(subscriptionName);
                    console.log(this.activeSubscriptions)
                    return response;
                }

                console.log("exploded", response)

                // If something explodes
                throw new Error(`Subscription failed for ${subscriptionName}!`);

            } catch (error) {
                console.error("Subscription error:", error);
                delete this.activeSubscriptions[subscriptionName];
                throw error;
            }
        }

        async unsubscribe(subscriptionName) {
            if (this.activeSubscriptions[subscriptionName]) {
                console.log("forgetting", subscriptionName)
                const requestData = {
                    forget: this.activeSubscriptions[subscriptionName].id
                };

                try {

                    const response = await this.wsClient.request(requestData);

                    if (response.echo_req.forget === this.activeSubscriptions[subscriptionName].id) {
                        console.log(`Successful un-subscription for ${subscriptionName}`);

                        delete this.activeSubscriptions[subscriptionName];

                        return response;
                    }
                    console.log(this.activeSubscriptions)

                    throw new Error(`Unsubscribing for ${subscriptionName} failed`);
                } catch (error) {
                    console.error("Un-subscription error:", error);
                    delete this.activeSubscriptions[subscriptionName];
                    throw error;
                }
            }
        }

        // Register a listener for the incoming subscription messages
        _startListeningToMessages(subscriptionName) {
            this.wsClient.ws.addEventListener("message", (event) => {
                const message = JSON.parse(event.data);

                if (message.msg_type !== "ping" && message.subscription.id === this.activeSubscriptions[subscriptionName].id) {
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