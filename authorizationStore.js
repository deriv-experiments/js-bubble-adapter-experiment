(function() {
    class AuthorizationStore {
        constructor(wsClient) {
            this.wsClient = wsClient;
            this.authData = null;  // Cache for the authorization data!
            this.authPromise = null;  // Hold the promise to avoid duplicate calls.
        }

        async authorize(token) {
            // Already authorized? Just serve the cached honey.
            if (this.authData) {
                return this.authData;
            }

            // If a request is already in-flight, chain onto it.
            if (this.authPromise) {
                return this.authPromise;
            }

            try {
                // First-time authorization or cache busted, let's make the request.
                this.authPromise = this.wsClient.authorize(token);
                const response = await this.authPromise;

                // Maybe you're authorized! Maybe you're not! Let's see what we caught.
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
                // Whether we succeed or crash, clear the promise.
                this.authPromise = null;
            }
        }

        // If you really have to freshen up the cache
        clearCache() {
            this.authData = null;
        }
    }

    window.DerivData = window.DerivData || {};
    window.DerivData.authorizationStore = new AuthorizationStore(window.DerivData.simpleWS);
})();