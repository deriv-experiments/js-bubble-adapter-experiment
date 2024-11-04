(function () {
    class SimpleSubscriptionStore {
        constructor(wsClient, authStore) {
            this.wsClient = wsClient;
            this.authStore = authStore;
            this.activeSubscriptions = {};   // Only ONE subscription at a time
            // this.subscriptionPromise = {};  // Hold the active subscription promise
        }

        // Subscribe and wait for authorization first
        async subscribe(token, payload, callback, subscriptionID) {
            if (subscriptionID && this.activeSubscriptions[subscriptionID] && this.activeSubscriptions.promise) {
                console.warn("Subscription is already active. Only one allowed!");
                return this.activeSubscriptions[subscriptionID];
            }

            try {
                // Wait for authorization first
                await this.authStore.waitForAuthorization(token);
                console.log("Authorization succeeded. Proceeding with subscription...");

                // Wait for WS connection
                await this.wsClient.waitForConnection();

                // Construct the subscription request payload
                const requestData = {
                    ...payload,
                    subscribe: 1
                };

                console.log("Sending subscription request:", requestData);

                // Wait for server response
                const response = await this.wsClient.request(requestData);

                if (response.req_id) {
                    this.activeSubscriptions[response.subscription.id] = {};
                    this.activeSubscriptions[response.subscription.id] = response;
                    console.log(`Subscription confirmed for ${response.msg_type} with req_id:`, response.subscription.id);

                    this._startListeningToMessages(response.subscription.id, callback);
                    console.log(this.activeSubscriptions)
                    return response;
                }

                // If something explodes
                throw new Error(`Subscription failed for ${response.msg_type}!`);

            } catch (error) {
                console.error("Subscription error:", error);
                throw error;
            }
        }

        async unsubscribe(subscriptionID) {
            if (this.activeSubscriptions[subscriptionID]) {

                console.log("unsubscribing", subscriptionID)
                const requestData = {
                    forget: subscriptionID
                };

                try {

                    const response = await this.wsClient.request(requestData);

                    if (response.echo_req.forget === subscriptionID) {
                        console.log(`Successful un-subscription for ${subscriptionID} - ${response}`);

                        delete this.activeSubscriptions[subscriptionID];

                        return response;
                    }

                    throw new Error(`Unsubscribing for ${subscriptionID} failed`);
                } catch (error) {
                    console.error("Un-subscription error:", error);
                    throw error;
                }
            } else {
                console.warn("no active subscriptions for", subscriptionID);
                return;
            }
        }

        // Register a listener for the incoming subscription messages
        _startListeningToMessages(subscriptionID, callback) {
            this.wsClient.ws.addEventListener("message", (event) => {
                const message = JSON.parse(event.data);

                if (message.msg_type !== "ping" && message.subscription && message.subscription.id === subscriptionID) {
                    // console.log("Received subscription update:", message);
                    // Handle messages here
                    if (callback) {
                        callback(message);
                    }
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