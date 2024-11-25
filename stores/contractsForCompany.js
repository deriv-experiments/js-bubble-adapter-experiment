import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";
import { modifyContracts } from "../utils/modifyContracts.js";

class ContractsForCompanyStore {
    constructor(wsClient, authStore) {
        this.wsClient = wsClient;
        this.authStore = authStore;
    }
    async request(onDataHandler, onErrorHandler) {

        try {
            await this.authStore.waitForAuthorization();

            const _payload = {
                contracts_for_company: 1,
            }

            const response = await this.wsClient.request(_payload);

            if (response) {
                if ("error" in response) {
                    const _error = jsonObjectsToBubbleThings(response["error"]);
                    onErrorHandler(_error);
                    throw response["error"];
                }


                const modifiedData = modifyContracts(response["contracts_for_company"]["available"]);
                const _data = jsonObjectsToBubbleThings(modifiedData);
                onDataHandler(_data);
                return response;
            }

        } catch (error) {
            throw error;
        }

    }
};

export default ContractsForCompanyStore;