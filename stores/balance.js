import jsonObjectsToBubbleThings from '../utils/jsonObjectsToBubbleThings.js';

class BalanceStore {
    constructor(wsClient, authStore) {
        this.wsClient = wsClient;
        this.authStore = authStore;
    }

    async request(onDataHandler) {
        try {

            await this.wsClient.waitForConnection();
            await this.authStore.waitForAuthorization();

            const payload = {
                balance: 1
            };

            const response = await this.wsClient.request(payload);

            if (response) {
                const _data = response["balance"];
                onDataHandler(jsonObjectsToBubbleThings(_data));
                return response;
            }
        } catch (error) {
            throw error;
        }
    }
};

export default BalanceStore;