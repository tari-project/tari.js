import { TariPermissions } from "./tari_permissions";
import { TariConnection } from "./webrtc";
import { TariProvider, TransactionRequest } from '../index';

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
    params: WalletDaemonParameters;
    connection: TariConnection;

    private constructor(params: WalletDaemonParameters, connection: TariConnection) {
        this.params = params;
        this.connection = connection;
    }

    static async build(params: WalletDaemonParameters): Promise<WalletDaemonTariProvider> {
        let connection = new TariConnection(params.signalingServerUrl, params.webRtcConfig);
        await connection.init(params.permissions, params.onConnection);
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

    public async getAccounts(): Promise<unknown> {
        if (!this.connection.isConnected) {
            throw WalletDaemonNotConnected;
        }

        const method = "keys.list";
        const res = await this.connection.sendMessage(method, this.connection.token);

        return res;
    }

    public async getAccountBalances(componentAddress: string): Promise<unknown> {
        if (!this.connection.isConnected) {
            throw WalletDaemonNotConnected;
        }

        const method = "accounts.get_balances";
        const args = { ComponentAddress: componentAddress };
        const res = await this.connection.sendMessage(method, this.connection.token, args);

        return res;
    }

    public async getSubstate(_substate_address: string): Promise<unknown> {
        // TODO: the wallet daemon should expose a JRPC method to retrieve any substate
        throw Unsupported;
    }

    public async submitTransaction(req: TransactionRequest): Promise<unknown> {
        if (!this.connection.isConnected) {
            throw WalletDaemonNotConnected;
        }

        const method = "transactions.submit";
        const args = [
            /*signing_key_index: */ req.account_index,
            /*fee_instructions":*/[],
            /*instructions":*/ req.instructions,
            /*inputs":*/ req.required_substates,
            /*override_inputs":*/ false,
            /*is_dry_run*/ req.is_dry_run,
            /*proof_ids*/[],
            /*min_epoch*/ null,
            /*max_epoch*/ null,
        ];
        const res = await this.connection.sendMessage(method, this.connection.token, ...args);

        return res;
    }

    // TODO: getTransactionResult
}