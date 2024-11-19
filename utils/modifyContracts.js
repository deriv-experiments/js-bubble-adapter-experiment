import { tradeConfig } from "../configs/tradeConfig.js";

export const modifyContracts = (data) => {
    const combinedContracts = data.reduce((acc, curr) => {
        let i = acc.findIndex(item => item.barrier_category === curr.barrier_category && item.contract_category === curr.contract_category);

        if (i === -1) {
            const contractData = {
                ...curr,
                first: {
                    contract_display: curr.contract_display,
                    contract_type: curr.contract_type,
                    sentiment: curr.sentiment,
                }
            };

            delete contractData["contract_display"];
            delete contractData["sentiment"];

            acc.push(contractData);
        } else {
            acc[i].second = {
                contract_display: curr.contract_display,
                contract_type: curr.contract_type,
                sentiment: curr.sentiment,
            };
        }

        return acc;

    }, [])

    const combinedContractsWithExpiry = combinedContracts[0].max_contract_duration ? combinedContracts.reduce((acc, curr) => {
        let i = acc.findIndex(item => item.barrier_category === curr.barrier_category && item.contract_category === curr.contract_category);

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
    }, []) : null;

    const modifiedContracts = (combinedContractsWithExpiry ?? combinedContracts).map(item => {
        if (item.contract_type in tradeConfig) {
            item = {
                ...item,
                contract_category_display: tradeConfig[item.contract_type][item.barrier_category].contract_category_display,
                contract_display: tradeConfig[item.contract_type][item.barrier_category].contract_display
            }
        }

        return item;
    });



    return modifiedContracts;
};