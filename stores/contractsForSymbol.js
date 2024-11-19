import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";
import { modifyContracts } from "../utils/modifyContracts.js";

const getSelectedContractData = (allContracts, selectedBarrierCategory, selectedContractCategory) => {
    const modifiedContracts = modifyContracts(allContracts);

    const matchingContracts = modifiedContracts.find(contract => contract.barrier_category === selectedBarrierCategory && contract.contract_category === selectedContractCategory);

    return matchingContracts;
}

class ContractsForSymbolStore {
    constructor(wsClient) {
        this.wsClient = wsClient;
    }

    async request(currency, selectedSymbol, selectedBarrierCategory, selectedContractCategory, onDataHandler) {

        try {
            await this.wsClient.waitForConnection();

            const _payload = {
                currency: currency,
                contracts_for: selectedSymbol,

            }

            const response = await this.wsClient.request(_payload);

            if (response) {
                let contracts = response["contracts_for"]["available"];
                const _data = getSelectedContractData(contracts, selectedBarrierCategory, selectedContractCategory);
                onDataHandler(jsonObjectsToBubbleThings(_data));
                // onDataHandler(_data);
                return response;
            }

        } catch (error) {
            throw error;
        }

    }
};


export default ContractsForSymbolStore;