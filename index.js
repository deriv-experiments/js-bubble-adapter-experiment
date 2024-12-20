import AuthStore from './authorization/authStore.js';
import ActiveSymbolsStore from './stores/activeSymbols.js';
import BalanceStore from './stores/balance.js';
import BuyContractStore from './stores/buyContract.js';
import ContractsForCompanyStore from './stores/contractsForCompany.js';
import ContractsForSymbolStore from './stores/contractsForSymbol.js';
import ProposalOpenContractStream from './streams/proposalOpenContract.js';
import ProposalStream from './streams/proposal.js';
import TicksStream from './streams/ticksStream.js';
import Forget from './ws/forget.js';
import Subscription from './ws/subscription.js';
import WSClient from './ws/ws.js';
import BalanceStream from './streams/balanceStream.js';

class DerivData {
    constructor() {
        // instantiate ws connection for each instance
        this.wsClient = new WSClient();

        // instantiate subscription class for each instance
        this.forget = new Forget(this.wsClient)
        this.subscription = new Subscription(this.wsClient, this.forget);

        // instantiate data stores
        this.authStore = new AuthStore(this.wsClient);
        this.activeSymbolsStore = new ActiveSymbolsStore(this.wsClient);
        this.balanceStore = new BalanceStore(this.wsClient, this.authStore);
        this.buyContractStore = new BuyContractStore(this.wsClient, this.authStore);
        this.contractsForSymbolStore = new ContractsForSymbolStore(this.wsClient);
        this.contractsForCompanyStore = new ContractsForCompanyStore(this.wsClient, this.authStore);

        // instantiate data streams
        this.balanceStream = new BalanceStream(this.subscription, this.authStore);
        this.proposalStream = new ProposalStream(this.subscription);
        this.proposalOpenContractStream = new ProposalOpenContractStream(this.subscription);
        this.ticksStream = new TicksStream(this.subscription);


        let selectedAccount;
        let token;

        try {
            selectedAccount = JSON.parse(localStorage.getItem('selected_account'));
            token = selectedAccount.token;
        } catch (e) {
            console.log("error parsing localstorage!")
        }


        if (!selectedAccount || !token) {
            console.log("No token found in localstorage, please login first!");
            // this.authStore.noTokenFound = 1;
            this.authStore.oauthRedirect();
            this.authStore.authPromiseResolve(null);
        } else {
            this.authStore.authorize(token);
        }
    }
};

console.log("=== DerivData initialized ===");
window.DerivData = new DerivData();