(function() {   
    class AccountStore {
        constructor(wsClient) {
            this.wsClient = wsClient;
            this.accountData = null;  // We'll store accounts data here
            this.accountPromise = null;  // To avoid multiple parallel requests
        }
    
        async getAccounts() {
            // If we already have data, return it immediately
            if (this.accountData) {
                return this.accountData;
            }
    
            // If a request is already underway, chain that promise 
            if (this.accountPromise) {
                return this.accountPromise;
            }
    
            try {
                // Lazy-load accounts data - only fetch when necessary
                this.accountPromise = this.wsClient.request({ accounts: 1 });
                const response = await this.accountPromise;
    
                // Store it for future calls, cache it nice and tight, baby
                if (response.accounts) {
                    this.accountData = response.accounts;
                } else {
                    throw new Error('No accounts data in the response');
                }
    
                return this.accountData;
            } catch (error) {
                console.error('Failed to fetch accounts data:', error);
                throw error;  // Re-throw the error after logging it
            } finally {
                // Reset the promise regardless of success/failure
                this.accountPromise = null;
            }
        }
    
        // Optionally, impose an 'invalidate' method to clear the cache for fresh calls
        clearCache() {
            this.accountData = null;  // Nuking the stored accounts data
        }
    }

    window.DerivData = {};
    window.DerivData.accountStore = new AccountStore(window.DerivData.simpleWs);
})();
