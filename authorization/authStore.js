const DEV_APPID = 65401
const PROD_APPID = 65656

const IS_DEV = window.location.pathname.includes("version-test");

const APP_ID = IS_DEV ? DEV_APPID : PROD_APPID;

const OAUTH_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&l=EN&brand=deriv`;

class AuthStore {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.authData = null;  // Cache for the authorization data!
        this.readyPromise = null; // A promise that will resolve once authorization is done

        this.authPromise = new Promise((resolve, reject) => {
            this.authPromiseResolve = resolve;
            this.authPromiseReject = reject;
        });
        this.authInProgress = false;
    }

    async authorize(token) {
        // Already authorized? Return cached data.
        if (this.authData) {
            return this.authData;
        }

        // If authorization is already in progress, wait for it to finish.
        if (this.authInProgress) {
            return this.authPromise;
        }

        try {
            // Wait for WebSocket connection to be ready before sending the authorization request.
            await this.wsClient.waitForConnection();

            // First-time authorization or cache busted, make the request.
            const response = await this.wsClient.authorize(token);

            this.authPromiseResolve(response);

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

            this.authPromiseResolve(null);

            console.error('Authorization error:', error);
            throw error;
        } finally {

            this.authPromiseResolve(null);
            // Clear the promise, regardless of the outcome.
            this.authPromise = null;

        }
    }

    // Returns a promise that resolves once authorized, or rejects if authorization fails
    waitForAuthorization() {
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

        // Return the readyPromise for consumer to await on!
        return this.readyPromise.promise;
    }

    // Clears cached authorization data and resets readyPromise.
    clearCache() {
        this.authData = null;
        this.readyPromise = null;  // Invalidate current ready promise if cache is cleared
    }

    oauthRedirect() {
        window.location.href = OAUTH_URL;
    }
};

export default AuthStore;