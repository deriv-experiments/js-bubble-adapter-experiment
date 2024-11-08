class AuthStore {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.authData = null;  // Cache for the authorization data!
        this.authPromise = null;  // Hold the promise to avoid duplicate calls.
        this.readyPromise = null; // A promise that will resolve once authorization is done
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

                // Resolve the readyPromise since we're authorized.
                if (this.readyPromise) {
                    this.readyPromise.resolve(this.authData);
                }
            } else {
                throw new Error('Authorization failed');
            }

            return this.authData;
        } catch (error) {
            // If there's any error, reject the readyPromise (if it's being awaited)
            if (this.readyPromise) {
                this.readyPromise.reject(error);
            }

            console.error('Authorization error:', error);
            throw error;
        } finally {
            // Clear the promise, regardless of the outcome.
            this.authPromise = null;
        }
    }

    // Returns a promise that resolves once authorized, or rejects if authorization fails
    waitForAuthorization(token) {
        if (this.authData) {
            // Already authorized, return a resolved promise with the auth data.
            return Promise.resolve(this.authData);
        }

        // If there's no readyPromise, create one
        if (!this.readyPromise) {
            // Create a new promise that can be resolved or rejected later
            this.readyPromise = {};
            this.readyPromise.promise = new Promise((resolve, reject) => {
                this.readyPromise.resolve = resolve;
                this.readyPromise.reject = reject;
            });
        }

        // Call authorize to kickstart authorization if needed
        this.authorize(token); // Don't await, we'll resolve properly!

        // Return the readyPromise for consumer to await on!
        return this.readyPromise.promise;
    }

    // Clears cached authorization data and resets readyPromise.
    clearCache() {
        this.authData = null;
        this.readyPromise = null;  // Invalidate current ready promise if cache is cleared
    }
};

export default AuthStore;