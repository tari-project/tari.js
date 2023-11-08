import { TariPermissions } from "./tari_permissions";
import { TariConnection } from "./webrtc";

export type WalletDaemonParameters = {
    signalingServerUrl?: string,
    permissions: TariPermissions,
    optionalPermissions: TariPermissions,
    webRtcConfig?: RTCConfiguration,
    name?: string,
    onConnection?: () => void
};

export class WalletDaemonProvider {
    params: WalletDaemonParameters;
    connection: TariConnection;

    private constructor(params: WalletDaemonParameters, connection: TariConnection){
        this.params = params;
        this.connection = connection;      
      }
   
    static async build(params: WalletDaemonParameters): Promise<WalletDaemonProvider> {
      let connection = new TariConnection(params.signalingServerUrl, params.webRtcConfig);
      await connection.init(params.permissions, params.onConnection);
      return new WalletDaemonProvider(params, connection);
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
}