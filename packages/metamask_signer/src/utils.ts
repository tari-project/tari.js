import { MetaMaskInpageProvider } from '@metamask/providers';


export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
    permissionName: string;
    id: string;
    version: string;
    initialPermissions: Record<string, unknown>;
};

/**
 * Get the installed snaps in MetaMask.
 *
 * @param provider - The MetaMask inpage provider.
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (
    provider: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
    (await provider.request({
        method: 'wallet_getSnaps',
    })) as unknown as GetSnapsResponse;


/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
    provider: MetaMaskInpageProvider,
    snaps: Record<string, {version?: string}>,
) => {
    await provider.request({
        method: 'wallet_requestSnaps',
        params: snaps,
    });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (
    provider: MetaMaskInpageProvider,
    snapId: string,
    version?: string
): Promise<Snap | undefined> => {
    try {
        const snaps = await getSnaps(provider);

        return Object.values(snaps).find(
            (snap) =>
                snap.id === snapId && (!version || snap.version === version),
        );
    } catch (e) {
        console.log('Failed to obtain installed snap', e);
        return undefined;
    }
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

/**
 * Detect if the wallet injecting the ethereum object is MetaMask Flask.
 *
 * @returns True if the MetaMask version is Flask, false otherwise.
 */
export const isFlask = async (provider: MetaMaskInpageProvider) => {
    try {
        const clientVersion = await provider.request({
            method: 'web3_clientVersion',
        });

        const isFlaskDetected = (clientVersion as string[])?.includes('flask');

        return Boolean(provider && isFlaskDetected);
    } catch {
        return false;
    }
};