import {Account, TransactionSubmitRequest, TransactionResult, TransactionSubmitResponse} from './types'

export * as walletDaemon from './wallet_daemon'
export * as metamask from './metamask'
export * as types from './types'

export interface TariProvider {
    providerName: string;
    isConnected(): boolean;
    getAccount(): Promise<Account>;
    getSubstate(substate_address: string): Promise<unknown>,
    submitTransaction(req: TransactionSubmitRequest): Promise<TransactionSubmitResponse>
    getTransactionResult(transactionId: string): Promise<TransactionResult>
    getTemplateDefinition(template_address: string): Promise<unknown>
}