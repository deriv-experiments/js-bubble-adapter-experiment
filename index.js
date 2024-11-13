import AuthStore from './authorization/authStore.js';
import ActiveSymbolsStore from './stores/activeSymbols.js';
import BuyContractStore from './stores/buyContract.js';
import ContractsForCompanyStore from './stores/contractsForCompany.js';
import ContractsForSymbolStore from './stores/contractsForSymbol.js';
import ProposalOpenContractStream from './streams/proposalOpenContract.js';
import ProposalStream from './streams/proposal.js';
import TicksStream from './streams/ticksStream.js';
import Forget from './ws/forget.js';
import Subscription from './ws/subscription.js';
import WSClient from './ws/ws.js';

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
        this.buyContractStore = new BuyContractStore(this.wsClient, this.authStore);
        this.contractsForSymbolStore = new ContractsForSymbolStore(this.wsClient);
        this.contractsForCompanyStore = new ContractsForCompanyStore(this.wsClient);

        // instantiate data streams
        this.proposalStream = new ProposalStream(this.subscription);
        this.proposalOpenContractStream = new ProposalOpenContractStream(this.subscription);
        this.ticksStream = new TicksStream(this.subscription);
    }
};

console.log("=== DerivData initialized ===");
window.DerivData = new DerivData();