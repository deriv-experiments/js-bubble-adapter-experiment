import { tradeConfig } from "../configs/tradeConfig.js";

export const modifyContracts = (data) => {
    const combinedContracts = data.reduce((acc, curr) => {
        let i = acc.findIndex(item => item.barrier_category === curr.barrier_category && item.contract_category === curr.contract_category);

        if (i === -1) {
            let expiry = [];
            if ("expiry_type" in curr) {
                // aggregate all the available expiry limits into a single array
                const name = curr.expiry_type;
                const unit = curr.max_contract_duration.split('').pop();
                const max = Number(curr.max_contract_duration.split('').slice(0, -1).join(''));
                const min = Number(curr.min_contract_duration.split('').slice(0, -1).join(''));
                expiry.push({
                    name, unit, max, min
                });
                delete curr.expiry_type;
            }

            const contract_details = [
                {
                    contract_display: curr.contract_type in tradeConfig ? tradeConfig[curr.contract_type][curr.barrier_category]?.contract_display : curr.contract_display,
                    contract_type: curr.contract_type,
                    sentiment: curr.sentiment,
                }
            ];

            delete curr.contract_display;
            delete curr.sentiment;

            const contractData = {
                ...curr,
                contract_category_display: curr.contract_type in tradeConfig ? tradeConfig[curr.contract_type][curr.barrier_category]?.contract_category_display : curr.contract_category_display,
                contract_details,
                expiry
            };

            acc.push(contractData);
        } else {
            if ("expiry_type" in curr) {
                // aggregate all the available expiry limits into a single array
                const name = curr.expiry_type;
                const unit = curr.max_contract_duration.split('').pop();
                const max = Number(curr.max_contract_duration.split('').slice(0, -1).join(''));
                const min = Number(curr.min_contract_duration.split('').slice(0, -1).join(''));
                const expiry = {
                    name, unit, max, min
                }
                delete curr.expiry_type;

                acc[i].expiry.push(expiry)
            }

            acc[i].contract_details.push({
                contract_display: curr.contract_type in tradeConfig ? tradeConfig[curr.contract_type][curr.barrier_category]?.contract_display : curr.contract_display,
                contract_type: curr.contract_type,
                sentiment: curr.sentiment,
            });
        }

        return acc;

    }, []);


    return combinedContracts;
};