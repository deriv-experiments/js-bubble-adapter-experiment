(function() {
    class AuthorizationStore {
        constructor(wsClient) {
            this.wsClient = wsClient;
            this.authData = null;  // Cache for the authorization data!
            this.authPromise = null;  // Hold the promise to avoid duplicate calls.
        }

        async authorize(token) {
            // Already authorized? Return cached data.
            if (this.authData) {
                return this.authData;
            }

            // If a request is already in-flight, return the promise.
            if (this.authPromise) {
                return this.authPromise;
            }

            try {
                // Wait for WebSocket connection to be ready before sending the authorization request.
                await this.wsClient.waitForConnection();

                // First-time authorization or cache busted, make the request.
                this.authPromise = this.wsClient.authorize(token);
                const response = await this.authPromise;

                // Check if authorization succeeded.
                if (response.authorize) {
                    this.authData = response;
                } else {
                    throw new Error('Authorization failed');
                }

                return this.authData;
            } catch (error) {
                console.error('Authorization error:', error);
                throw error;
            } finally {
                // Clear the promise, regardless of the outcome.
                this.authPromise = null;
            }
        }

        // Clears cached authorization data.
        clearCache() {
            this.authData = null;
        }
    }

    window.DerivData = window.DerivData || {};
    window.DerivData.authorizationStore = new AuthorizationStore(window.DerivData.simpleWS);
})();