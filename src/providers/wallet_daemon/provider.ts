import {TariPermissions} from "./tari_permissions";
import {TariConnection} from "./webrtc";
import {TariProvider} from '../index';
import {SubmitTransactionRequest, TransactionResult, TransactionStatus, SubmitTransactionResponse} from '../types';
import {Account} from "../types";
import {
    WalletDaemonClient,
    stringToSubstateId,
    Instruction,
    TransactionSubmitRequest, SubstateType, SubstatesListRequest
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

        return {
            account_id: account.key_index,
            address: account.address.Component,
            public_key,
            // TODO
            resources: []
        };
    }

    public async getAccountBalances(componentAddress: string): Promise<unknown> {
        return await this.client.accountsGetBalances({account: {ComponentAddress: componentAddress}, refresh: true});
    }

    public async getSubstate(substate_id: string): Promise<unknown> {
        const substateId = stringToSubstateId(substate_id);
        return await this.client.substatesGet({substate_id: substateId});
    }

    public async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
        const params = {
            signing_key_index: req.account_id,
            fee_instructions: req.fee_instructions as Instruction[],
            instructions: req.instructions as Instruction[],
            inputs: req.required_substates.map((s) => ({
                // TODO: Hmm The bindings want a SubstateId object, but the wallet only wants a string. Any is used to skip type checking here
                substate_id: s.substate_id as any,
                version: s.version
            })),
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

    public async getTemplateDefinition(template_address: string): Promise<unknown> {
        return await this.client.templatesGet({template_address});
    }

    public async listSubstates(
        template: string | null,
        substateType: SubstateType | null
    ) {
        const resp = await this.client.substatesList({
            filter_by_template: template,
            filter_by_type: substateType
        } as SubstatesListRequest);
        return resp.substates as any[];
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