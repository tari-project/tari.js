import {TariProvider} from "../index";
import {
    SubmitTransactionRequest,
    TransactionResult,
    TransactionStatus,
    SubmitTransactionResponse,
    VaultBalances
} from "../types";
import {MetaMaskInpageProvider} from '@metamask/providers';
import {connectSnap, getSnap, isFlask, Snap} from "./utils";
import {Maybe} from "@metamask/providers/dist/utils";
import {Account} from "../types";

export const MetamaskNotInstalled = 'METAMASK_NOT_INSTALLED';
export const MetamaskIsNotFlask = 'METAMASK_IS_NOT_FLASK';
export const TariSnapNotInstalled = 'TARI_SNAP_NOT_INSTALLED';

export class MetamaskTariProvider implements TariProvider {
    public providerName = "Metamask";
    snapId: string;
    snapVersion: string | undefined;
    metamask: MetaMaskInpageProvider;
    snap?: Snap;
    metamaskConnected: boolean;

    constructor(snapId: string, metamask: MetaMaskInpageProvider) {
        this.snapId = snapId;
        this.snapVersion = undefined;
        this.metamask = metamask;
        this.metamaskConnected = false;
    }

    async connect(): Promise<void> {
        // check that the metamask provider is valid
        if (!this.metamask || !this.metamask.isMetaMask) {
            throw MetamaskNotInstalled;
        }

        // check that flask is installed
        if (!isFlask(this.metamask)) {
            throw MetamaskIsNotFlask;
        }

        // connect to the tari snap
        // this will request MetaMask the installation of the tari snap if it's not already installed
        await connectSnap(this.metamask, {[this.snapId]:{version: this.snapVersion}});

        // store the tari snap reference
        const snap = await getSnap(this.metamask, this.snapId);
        if (!snap) {
            // this should olny happen if the user didn't accept the tari snap in the previous step
            throw TariSnapNotInstalled;
        }
        this.snap = snap;
        this.metamaskConnected = true;
    }

    public isConnected(): boolean {
        return this.metamaskConnected;
    }

    public async createFreeTestCoins(account_id: number): Promise<Account> {
        const res = await this.metamaskRequest('getFreeTestCoins', {
            amount: 1000000,
            account_id,
            fee: 2000
        }) as any;
        return {
            account_id,
            address: res.address,
            public_key: res.public_key,
            resources: []
        };
    }

    async getAccount(): Promise<Account> {
        return await this.metamaskRequest('getAccountData', {account_id: 0}) as any;
    }

    async getSubstate(substate_address: string): Promise<unknown> {
        return await this.metamaskRequest('getSubstate', { substate_address });
    }

    async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
        const params = {
            instructions: req.instructions,
            fee_instructions: req.fee_instructions,
            input_refs: req.input_refs,
            required_substates: req.required_substates || [],
            is_dry_run: req.is_dry_run,
        };

        const resp = await this.metamaskRequest<any>('sendTransaction', params);
        if (!resp) {
            throw new Error("Failed to submit transaction to metamask snap: empty response");
        }
        if (resp.error) {
            throw new Error(`Failed to submit transaction to metamask snap: ${resp.error}`);
        }
        return { transaction_id: resp.transaction_id };
    }

    public async getTransactionResult(transactionId: string): Promise<TransactionResult> {
        // This request returns the response from the indexer get_transaction_result request
        const resp: Maybe<any> = await this.metamaskRequest('getTransactionResult', { transaction_id: transactionId });

        if (!resp) {
            throw new Error("Failed to get transaction result from metamask snap: empty response");
        }

        if (resp.result === "Pending") {
            return {
                transaction_id: transactionId,
                status: TransactionStatus.Pending,
                result: null
            } as TransactionResult;
        }

        if (!resp?.result?.Finalized) {
            throw new Error("Transaction result was not pending nor finalized");
        }

        const newStatus = convertToStatus(resp.result.Finalized);

        return {
            transaction_id: transactionId,
            status: newStatus,
            result: resp.result.Finalized.execution_result.finalize
        } as TransactionResult;
    }

    public async getPublicKey(_branch: string, index: number): Promise<string> {
        const resp: Maybe<any> = await this.metamaskRequest('getPublicKey', { index });

        if (!resp) {
            throw new Error("Failed to get public key from metamask snap: empty response");
        }

        return resp.public_key;
    }

    public async getConfidentialVaultBalances(_viewKeyId: number, _vaultId: string, _min: number | null = null, _max: number | null = null): Promise<VaultBalances> {
        // TODO: create an FFI in the snap that reveals the vault balance using the view key
        throw new Error("getVaultBalances not implemented for Metamask");
    }

    getTemplateDefinition(template_address: string): Promise<unknown> {
        return this.metamaskRequest('getTemplateDefinition', { template_address });
    }


    private async metamaskRequest<T>(method: string, params: Object): Promise<Maybe<T>> {
        console.log("Metamask request:", method, params);
        return await this.metamask.request({
            method: 'wallet_invokeSnap',
            params: {
                snapId: this.snapId,
                request: {
                    method,
                    params
                }
            },
        });
    }
}

function convertToStatus(result: any): TransactionStatus {
    // Ref: https://github.com/tari-project/tari-dan/blob/bb0b31139b770aacd7bb49af865543aa4a9e2de4/dan_layer/wallet/sdk/src/apis/transaction.rs
    if (result.final_decision !== "Commit") {
        return TransactionStatus.Rejected;
    }

    // if (!result?.result?.Finalized) {
    //     throw new Error("Transaction result was finalized but no result was returned");
    // }
    //
    // if (result.finalize.AcceptFeeRejectRest) {
    //     return TransactionStatus.OnlyFeeAccepted;
    // }

    return TransactionStatus.Accepted;
}
