import {
    Account,
    SubmitTransactionRequest,
    TransactionResult,
    SubmitTransactionResponse,
    VaultBalances,
    TemplateDefinition,
} from "./types";

export interface TariProvider {
    providerName: string;
    isConnected(): boolean;
    getAccount(): Promise<Account>;
    getSubstate(substate_address: string): Promise<unknown>,
    submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse>
    getTransactionResult(transactionId: string): Promise<TransactionResult>
    getTemplateDefinition(template_address: string): Promise<TemplateDefinition>
    getPublicKey(branch: string, index: number): Promise<string>;
    getConfidentialVaultBalances(viewKeyId: number, vaultId: string, min: number | null, max: number | null): Promise<VaultBalances>;
}