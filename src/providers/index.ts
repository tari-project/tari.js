export * as walletDaemon from './wallet_daemon'

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
    getAccounts(): Promise<unknown>;
    getAccountBalances(componentAddress: string): Promise<unknown>,
    getSubstate(substate_address: string): Promise<unknown>,
    submitTransaction(req: TransactionRequest): Promise<unknown>
}