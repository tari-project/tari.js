import {TariProvider} from "../index";
import {
    SubmitTransactionRequest,
    TransactionResult,
    SubmitTransactionResponse,
    VaultBalances, TemplateDefinition, Substate,
    Account,
    TransactionStatus,
} from "../types";
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { Instruction, KeyBranch, stringToSubstateId, substateIdToString, TransactionSubmitRequest } from "@tariproject/wallet_jrpc_client";

// TODO: we don't have yet Tari support in WalletConnect
//       so the workaround for now is to use other namespaces like polkadot
//       note that the exact same chains and methods must be supported on the wallet side
const walletConnectParams = {
    requiredNamespaces: {
      polkadot: {
        methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
        chains: [
          'polkadot:91b171bb158e2d3848fa23a9f1c25182', // polkadot
        ],
        events: ['chainChanged", "accountsChanged']
      }
    }
  }

export class WalletConnectTariProvider implements TariProvider {
    public providerName = "WalletConnect";
    projectId: string;
    wcProvider: UniversalProvider | null;
    wcSession: any | null;

    constructor(projectId: string) {
        this.projectId = projectId;
    }

    async connect(): Promise<void> {
        if (this.wcProvider && this.wcSession)
            return;

        // initialize WalletConnect
        const projectId = this.projectId;
        this.wcProvider = await UniversalProvider.init({
            projectId,
            // TODO: parameterize the relay URL
            relayUrl: 'wss://relay.walletconnect.com'
        });

        // open UI modal with the connection URI
        const { uri, approval } = await this.wcProvider.client.connect(walletConnectParams);
        const walletConnectModal = new WalletConnectModal({
            projectId
        });
        if (uri) {
            walletConnectModal.openModal({ uri });
        }

        // wait for the wallet to approve the connection
        console.log("waiting for session approval from the wallet app");
        const session = await approval();

        // at this point session is open
        console.log("session approved by the wallet");
        this.wcSession = session;
    }

    private async sendRequest(method: string, params: object): Promise<any> {
        if (!this.wcProvider) {
            throw "WalletConnect provider not initialized";
        }

        if (!this.wcSession) {
            throw "WalletConnect session not initialized";
        }

        const payload = {
            method,
            params
        };
        console.log({payload});

        // this is just a mock address to be able to use polkadot's namespace
        const address = this.wcSession.namespaces.polkadot.accounts[0];

        const requestResult = await this.wcProvider.client.request({
            topic: this.wcSession.topic,
            chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182',
            request: {
              method: 'polkadot_signTransaction',
              params: {
                address,
                transactionPayload: payload
              }
            }
        });

        console.log({requestResult});

        return requestResult;
    }


    isConnected(): boolean {
        // TODO: check status in the session
        return this.wcSession !== null;
    }

    async getAccount(): Promise<Account> {
        const {account, public_key} = await this.sendRequest('accounts.get_default', {});
        const {balances} = await this.sendRequest(
            'accounts.get_balances',
            {account: {ComponentAddress: account.address.Component }, refresh: false
        });

        return {
            account_id: account.key_index,
            address: account.address.Component,
            public_key,
            // TODO: should be vaults not resources
            resources: balances.map((b: any) => ({
                type: b.resource_type,
                resource_address: b.resource_address,
                balance: b.balance + b.confidential_balance,
                vault_id: ('Vault' in b.vault_address) ? b.vault_address.Vault : b.vault_address,
                token_symbol: b.token_symbol,
            }))
        };
    }
    async getSubstate(substate_address: string): Promise<Substate> {
        const substateId = stringToSubstateId(substate_address);
        const method = 'substates.get';
        const params = { substate_id: substateId };
        const { value, record } = await this.sendRequest(method, params);
        return {
            value,
            address: {
                substate_id: substateIdToString(record.substate_id),
                version: record.version
            }
        };
    }

    async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
        const method = 'transactions.submit';
        const params = {
            transaction: null,
            signing_key_index: req.account_id,
            fee_instructions: req.fee_instructions as Instruction[],
            instructions: req.instructions as Instruction[],
            inputs: req.required_substates.map((s) => ({
                // TODO: Hmm The bindings want a SubstateId object, but the wallet only wants a string. Any is used to skip type checking here
                substate_id: s.substate_id as any,
                version: s.version
            })),
            input_refs: [],
            override_inputs: false,
            is_dry_run: req.is_dry_run,
            proof_ids: [],
            min_epoch: null,
            max_epoch: null,
        } as TransactionSubmitRequest;

        const res = await this.sendRequest(method, params);

        return {transaction_id: res.transaction_id};        
    }

    async getTransactionResult(transactionId: string): Promise<TransactionResult> {
        const res = await this.sendRequest('transactions.get_result', {transaction_id: transactionId});

        return {
            transaction_id: transactionId,
            status: convertStringToTransactionStatus(res.status),
            result: res.result,
        };
    }

    async getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
        let resp = await this.sendRequest('templates.get', {template_address});
        return resp.template_definition as TemplateDefinition;
    }

    async getPublicKey(branch: string, index: number): Promise<string> {
        const res = await this.sendRequest('keys.create', {branch: branch as KeyBranch, specific_index: index});
        return res.public_key;
    }

    async getConfidentialVaultBalances(viewKeyId: number, vaultId: string, min: number | null, max: number | null): Promise<VaultBalances> {
        const method = 'confidential.view_vault_balance';
        const params = {
            view_key_id: viewKeyId,
            vault_id: vaultId,
            minimum_expected_value: min,
            maximum_expected_value: max,
        };
        
        const res = await this.sendRequest(method, params);
        return {balances: res.balances as unknown as Map<string, number | null>};
    }

}

function convertStringToTransactionStatus(status: string): TransactionStatus {
    switch (status) {
        case "New":
            return TransactionStatus.New;
        case "DryRun":
            return TransactionStatus.DryRun;
        case "Pending":
            return TransactionStatus.Pending;
        case "Accepted":
            return TransactionStatus.Accepted;
        case "Rejected":
            return TransactionStatus.Rejected;
        case "InvalidTransaction":
            return TransactionStatus.InvalidTransaction;
        case "OnlyFeeAccepted":
            return TransactionStatus.OnlyFeeAccepted;
        default:
            throw new Error(`Unknown status: ${status}`);
    }
}
