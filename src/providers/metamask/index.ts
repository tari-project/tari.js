import { TariProvider, TransactionRequest } from "..";
import { MetaMaskInpageProvider } from '@metamask/providers';
import { Snap, connectSnap, getSnap, isFlask } from "./utils";

export const MetamaskNotInstalled = 'METAMASK_NOT_INSTALLED';
export const MetamaskIsNotFlask = 'METAMASK_IS_NOT_FLASK';
export const TariSnapNotInstalled = 'TARI_SNAP_NOT_INSTALLED';

export class MetamaskTariProvider implements TariProvider {
    snapId: string;
    metamask: MetaMaskInpageProvider;
    snap?: Snap;
    metamaskConnected: boolean;

    constructor(snapId: string, metamask: MetaMaskInpageProvider) {
        this.snapId = snapId;
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
        await connectSnap(this.metamask, this.snapId);

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

    async getAccount(): Promise<unknown> {
        return await this.metamaskRequest('getAccountData', {});
    }

    async getSubstate(substate_address: string): Promise<unknown> {
        return await this.metamaskRequest('getSubstate', { substate_address });
    }

    async submitTransaction(req: TransactionRequest): Promise<unknown> {
        const params = {
            instructions: req.instructions,
            input_refs: req.input_refs,
            required_substates: req.required_substates,
            is_dry_run: req.is_dry_run,
        };

        return await this.metamaskRequest('sendTransaction', params);
    }

    private async metamaskRequest(method: string, params: Object) {
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