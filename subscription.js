(function () {
    class Subscription {
        #subscriptionStore = {};

        constructor(wsClient, forget) {
            this.wsClient = wsClient;
            this.forget = forget;

            // listen to and handle messages containing `subscription` key
            this.wsClient.ws.addEventListener("message", (e) => {
                const data = JSON.parse(e.data);
                if (data && "subscription" in data) {
                    this.#subscribedMessageListener(data);
                }
            });
        }

        #subscribedMessageListener(data) {
            const id = data["subscription"]["id"];
            this.#subscriptionStore[id].messageHandler(data);
        }

        #addSubscription(streamType, subscriptionID, messageHandler) {
            console.log("subscribed to", streamType, subscriptionID);
            this.#subscriptionStore[subscriptionID] = {
                streamType,
                messageHandler
            };
        }

        #removeSubscription(subscriptionID, streamTypes) {
            if (subscriptionID) {
                console.log("unsubscribed to", subscriptionID, this.#subscriptionStore[subscriptionID]["streamType"]);
                // remove only for particular ID
                delete this.#subscriptionStore[subscriptionID];
            } else if (streamTypes) {
                // remove subscriptions for all stream types
                Object.keys(this.#subscriptionStore).map(key => {
                    if (streamTypes.includes(this.#subscriptionStore[key]["streamType"])) {
                        delete this.#subscriptionStore[key];
                        return;
                    }
                });
                console.log("unsubscribed to", streamTypes);
            }
        }

        async subscribe(streamType, payload, onMessageHandler) {
            try {
                const _payload = {
                    [streamType]: 1,
                    subscribe: 1,
                    ...payload
                };

                const response = await this.wsClient.request(_payload);

                if (response) {
                    const subscriptionID = response["subscription"]["id"];
                    this.#addSubscription(streamType, subscriptionID, onMessageHandler);
                    return subscriptionID;
                }
            } catch (error) {
                throw error;
            }
        }

        async unsubscribeById(id) {
            try {
                const response = await this.forget.requestOne(id);
                this.#removeSubscription(id);
                return response;
            } catch (error) {
                throw error;
            }
        }

        async unsubscribeByStreamTypes(streamTypes) {
            try {
                const response = await this.forget.requestAll(streamTypes);
                this.#removeSubscription(null, streamTypes);
                return response;
            } catch (error) {
                throw error;
            }

        }
    }

    window.DerivData = window.DerivData || {};
    window.DerivData.subscription = new Subscription(
        window.DerivData.simpleWS,
        window.DerivData.forget
    );
})()