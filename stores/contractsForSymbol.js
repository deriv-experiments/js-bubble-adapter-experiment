import jsonObjectsToBubbleThings from "../utils/jsonObjectsToBubbleThings.js";

const modifyData = (data) => {
    const result = data.reduce((acc, cur) => {
        let i = acc.findIndex(item => item.barrier_category === cur.barrier_category && item.contract_category_display === cur.contract_category_display && item.expiry_type === cur.expiry_type && item.sentiment !== cur.sentiment);

        if (i === -1) {
            acc.push(cur);
        }
        return acc;

    }, []).reduce((acc, curr) => {
        let i = acc.findIndex(item => item.barrier_category === curr.barrier_category && item.contract_category_display === curr.contract_category_display);

        let name = curr.expiry_type;
        let unit = curr.max_contract_duration.split('').pop();
        let max = Number(curr.max_contract_duration.split('').slice(0, -1).join(''));
        let min = Number(curr.min_contract_duration.split('').slice(0, -1).join(''));
        let expiry = {
            name, unit, max, min
        }


        if (i === -1) {
            curr.expiry = [expiry];
            delete curr.expiry_type;
            acc.push(curr);
        }

        else {
            acc[i].expiry.push(expiry);
        }

        return acc;
    }, []).map(item => {
        if (item.barrier_category === 'euro_atm' && item.contract_category_display === 'Up/Down') {
            item.contract_category_display = 'Rise/Fall';
        }
        return item;
    });

    let riseFallIndex = result.findIndex(item => item.contract_category_display === 'Rise/Fall');
    let temp = result[riseFallIndex];
    result[riseFallIndex] = result[0];
    result[0] = temp;


    return result;
};

class ContractsForSymbolStore {
    constructor(wsClient) {
        this.wsClient = wsClient;
        this.data = null;
    }

    async request(payload, onDataHandler) {

        try {
            await this.wsClient.waitForConnection();

            const _payload = {
                contracts_for: payload.symbol,
                currency: payload.currency
            }

            const response = await this.wsClient.request(_payload);

            if (response) {
                let rawData = response["contracts_for"]["available"];
                let modifiedData = modifyData(rawData);
                this.data = modifiedData;
                onDataHandler(jsonObjectsToBubbleThings(this.data));
                return response;
            }

        } catch (error) {
            throw error;
        }

    }
};


export default ContractsForSymbolStore;