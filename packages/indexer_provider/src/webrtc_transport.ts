import {transports} from "@tari-project/wallet_jrpc_client";
import {TariConnection} from "./webrtc";

export class WebRtcRpcTransport implements transports.RpcTransport {
    connection: TariConnection;

    constructor(connection: TariConnection) {
        this.connection = connection;
    }

    static new(connection: TariConnection) {
        return new WebRtcRpcTransport(connection);
    }

    token(): string | undefined {
        return this.connection.token;
    }

    isConnected(): boolean {
        return this.connection.isConnected();
    }

    sendRequest<T>(data: transports.RpcRequest, options: transports.RpcTransportOptions): Promise<T> {
        return this.connection.sendMessage<T>(data, options.token);
    }
}

