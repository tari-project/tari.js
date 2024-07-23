import {TariPermissions,} from "./tari_permissions";
import {TariConnection} from "./webrtc";
import {TariProvider} from '../index';
import {
    SubmitTransactionRequest,
    TransactionResult,
    TransactionStatus,
    SubmitTransactionResponse,
    VaultBalances, TemplateDefinition, Substate,
    ListSubstatesResponse,
} from "../types";
import {Account} from "../types";
import {
    WalletDaemonClient,
    stringToSubstateId,
    substateIdToString,
    Instruction,
    TransactionSubmitRequest,
    SubstateType,
    SubstatesListRequest,
    KeyBranch,
} from "@tariproject/wallet_jrpc_client";
import {WebRtcRpcTransport} from "./webrtc_transport";

export const WalletDaemonNotConnected = 'WALLET_DAEMON_NOT_CONNECTED';
export const Unsupported = 'UNSUPPORTED';

export type WalletDaemonParameters = {
    signalingServerUrl?: string,
    permissions: TariPermissions,
    optionalPermissions: TariPermissions,
    webRtcConfig?: RTCConfiguration,
    name?: string,
    onConnection?: () => void
};

export class WalletDaemonTariProvider implements TariProvider {
    public providerName = "WalletDaemon";
    params: WalletDaemonParameters;
    client: WalletDaemonClient;

    private constructor(params: WalletDaemonParameters, connection: WalletDaemonClient) {
        this.params = params;
        this.client = connection;
    }

    static async build(params: WalletDaemonParameters): Promise<WalletDaemonTariProvider> {
        const allPermissions = new TariPermissions();
        allPermissions.addPermissions(params.permissions);
        allPermissions.addPermissions(params.optionalPermissions);
        console.log({allPermissions});
        let connection = new TariConnection(params.signalingServerUrl, params.webRtcConfig);
        const client = WalletDaemonClient.new(WebRtcRpcTransport.new(connection));
        await connection.init(allPermissions, (conn) => {
            params.onConnection?.();
            if (conn.token) {
                client.setToken(conn.token);
            }
        });
        return new WalletDaemonTariProvider(params, client);
    }

    public get token(): string | undefined {
        return (this.client.getTransport() as WebRtcRpcTransport).token();
    }

    public get tokenUrl(): string | undefined {
        if (!this.token) {
            return undefined;
        }

        const name = this.params.name && encodeURIComponent(this.params.name) || '';
        const token = this.token;
        const permissions = JSON.stringify(this.params.permissions);
        const optionalPermissions = JSON.stringify(this.params.optionalPermissions);

        return `tari://${name}/${token}/${permissions}/${optionalPermissions}`
    }

    public isConnected(): boolean {
        return (this.client.getTransport() as WebRtcRpcTransport).isConnected();
    }

    public async createFreeTestCoins(): Promise<Account> {
        const res = await this.client.createFreeTestCoins({
            account: {Name: "template_web"},
            amount: 1000000,
            max_fee: null,
            key_id: 0
        });
        return {
            account_id: res.account.key_index,
            address: (res.account.address as { Component: string }).Component,
            public_key: res.public_key,
            resources: []
        };
    }

    public async getAccount(): Promise<Account> {
        const {account, public_key} = await this.client.accountsGetDefault({}) as any;
        const {balances} = await this.client.accountsGetBalances({account: {ComponentAddress: account.address.Component }, refresh: false});

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

    public async getAccountBalances(componentAddress: string): Promise<unknown> {
        return await this.client.accountsGetBalances({account: {ComponentAddress: componentAddress}, refresh: true});
    }

    public async getSubstate(substate_id: string): Promise<Substate> {
        const substateId = stringToSubstateId(substate_id);
        const { value, record } = await this.client.substatesGet({ substate_id: substateId });
        return {
            value,
            address: {
                substate_id: substateIdToString(record.substate_id),
                version: record.version
            }
        };
    }

    public async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
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
        const res = await this.client.submitTransaction(params);

        return {transaction_id: res.transaction_id};
    }

    public async getTransactionResult(transactionId: string): Promise<TransactionResult> {
        const res = await this.client.getTransactionResult({transaction_id: transactionId});

        return {
            transaction_id: transactionId,
            status: convertStringToTransactionStatus(res.status),
            result: res.result,
        };
    }

    public async getPublicKey(branch: string, index: number): Promise<string> {
        const res = await this.client.createKey({branch: branch as KeyBranch, specific_index: index});
        return res.public_key;
    }

    public async getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
        let resp = await this.client.templatesGet({template_address});
        return resp.template_definition as TemplateDefinition;
    }

    public async getConfidentialVaultBalances(viewKeyId: number, vaultId: string, min: number | null = null, max: number | null = null): Promise<VaultBalances> {
        const res = await this.client.viewVaultBalance({
            view_key_id: viewKeyId,
            vault_id: vaultId,
            minimum_expected_value: min,
            maximum_expected_value: max,
        });
        return {balances: res.balances as unknown as Map<string, number | null>};
    }

    public async listSubstates(filter_by_template: string | null, filter_by_type: SubstateType | null, limit: number | null, offset: number | null): Promise<ListSubstatesResponse>
    {
        const resp = await this.client.substatesList({
            filter_by_template,
            filter_by_type,
            limit,
            offset
        } as SubstatesListRequest);

        const substates = resp.substates.map((s) =>  ({
            substate_id: substateIdToString(s.substate_id),
            module_name: s.module_name,
            version: s.version,
            template_address: s.template_address
        }));

        return {substates};
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