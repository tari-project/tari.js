import { RpcRequest, RpcTransport, RpcTransportOptions } from "./rpc";
import { TariConnection } from "./webrtc";

export class WebRtcRpcTransport implements RpcTransport {
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

  sendRequest<T>(data: RpcRequest, options: RpcTransportOptions): Promise<T> {
    return this.connection.sendMessage<T>(data, options.token);
  }
}
