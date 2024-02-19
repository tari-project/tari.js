import {TariPermissions} from "./tari_permissions";
import {TariConnection} from "./webrtc";
import {TariProvider} from '../index';
import {TransactionSubmitRequest, TransactionResult, TransactionStatus, TransactionSubmitResponse} from '../types';
import {Account} from "../types";

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
    connection: TariConnection;

    private constructor(params: WalletDaemonParameters, connection: TariConnection) {
        this.params = params;
        this.connection = connection;
    }

    static async build(params: WalletDaemonParameters): Promise<WalletDaemonTariProvider> {
        const allPermissions = new TariPermissions();
        allPermissions.addPermissions(params.permissions);
        allPermissions.addPermissions(params.optionalPermissions);
        console.log({allPermissions});
        let connection = new TariConnection(params.signalingServerUrl, params.webRtcConfig);
        await connection.init(allPermissions, params.onConnection);
        return new WalletDaemonTariProvider(params, connection);
    }

    public get token(): string | undefined {
        return this.connection.token;
    }

    public get tokenUrl(): string | undefined {
        if (this.connection.token) {
            const name = this.params.name && encodeURIComponent(this.params.name) || '';
            const token = this.connection.token;
            const permissions = JSON.stringify(this.params.permissions);
            const optionalPermissions = JSON.stringify(this.params.optionalPermissions);

            return `tari://${name}/${token}/${permissions}/${optionalPermissions}`
        }
        return undefined;
    }

    public isConnected(): boolean {
        return this.connection.isConnected();
    }

    public async createFreeTestCoins(): Promise<Account> {
        const method = "accounts.create_free_test_coins";
        const res = await this.connection.sendMessage(method, this.connection.token, {
            account: null,
            amount: 1000000,
            max_fee: null,
            key_id: 0
        }) as any;
        return {
            account_id: res.account.key_index,
            address: res.account.address.Component,
            public_key: res.public_key,
            resources: []
        };
    }

    public async getAccount(): Promise<Account> {
        const method = "accounts.get_default";
        const {account, public_key} = await this.connection.sendMessage(method, this.connection.token, {}) as any;

        return {
            account_id: account.key_index,
            address: account.address.Component,
            public_key,
            // TODO
            resources: []
        };
    }

    public async getAccountBalances(componentAddress: string): Promise<unknown> {
        const method = "accounts.get_balances";
        const args = {ComponentAddress: componentAddress};
        const res = await this.connection.sendMessage(method, this.connection.token, args);

        return res;
    }

    public async getSubstate(_substate_address: string): Promise<unknown> {
        // TODO: the wallet daemon should expose a JRPC method to retrieve any substate
        throw Unsupported;
    }

    public async submitTransaction(req: TransactionSubmitRequest): Promise<TransactionSubmitResponse> {
        const params = {
            signing_key_index: req.account_id,
            fee_instructions: req.fee_instructions,
            instructions: req.instructions,
            inputs: req.required_substates,
            override_inputs: false,
            is_dry_run: req.is_dry_run,
            proof_ids: [],
            min_epoch: null,
            max_epoch: null,
        };
        const res = await this.connection.sendMessage<any>("transactions.submit", this.connection.token, params, 10);

        return {transaction_id: res.transaction_id};
    }

    public async getTransactionResult(transactionId: string): Promise<TransactionResult> {
        const params = {transaction_id: transactionId};
        const res = await this.connection.sendMessage("transactions.get_result", this.connection.token, params) as any;

        return {
            transaction_id: transactionId,
            status: convertStringToTransactionStatus(res.status),
            result: res.result,
        };
    }

    public async getTemplateDefinition(template_address: string): Promise<unknown> {
        const params = {template_address};
        return await this.connection.sendMessage("templates.get", this.connection.token, params);
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