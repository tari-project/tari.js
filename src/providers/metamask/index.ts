import { TariProvider, TransactionRequest } from "..";
import { MetaMaskInpageProvider } from '@metamask/providers';
import { Snap, connectSnap, getSnap, isFlask } from "./utils";

export const MetamaskNotInstalled = 'METAMASK_NOT_INSTALLED';
export const MetamaskIsNotFlask = 'METAMASK_IS_NOT_FLASK';
export const TariSnapNotInstalled = 'TARI_SNAP_NOT_INSTALLED';

export class MetamaskTariProvider implements TariProvider {
    snapId: string;
    metamask: MetaMaskInpageProvider;
    snap: Snap;
    isConnected: boolean;

    constructor(snapId: string, metamask: MetaMaskInpageProvider) {
        this.snapId = snapId;
        this.metamask = metamask;
        this.isConnected = false;
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
        this.isConnected = true;
    }

    getAccounts(): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
    getAccountBalances(_componentAddress: string): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
    getSubstate(_substate_address: string): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
    submitTransaction(_req: TransactionRequest): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
}