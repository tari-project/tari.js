export * as walletDaemon from './wallet_daemon'
export * as metamask from './metamask'

export type SubstateRequirement = {
    address: string,
    version?: number | null,
};

export type TransactionRequest = {
    account_index: number,
    // TODO: define class
    instructions: Object[],
    // TODO: define class
    input_refs: Object[],
    required_substates: SubstateRequirement[],
    is_dry_run: boolean,
};

export interface TariProvider {
    isConnected(): boolean;
    getAccount(): Promise<unknown>;
    getSubstate(substate_address: string): Promise<unknown>,
    submitTransaction(req: TransactionRequest): Promise<unknown>
}