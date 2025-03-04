import FetchRpcTransport from "./fetch";

export { FetchRpcTransport };

export interface RpcTransport {
  sendRequest<T>(request: RpcRequest, options: RpcTransportOptions): Promise<T>;
}

export interface RpcTransportOptions {
  token?: string;
  timeout_millis?: number;
}

export interface RpcRequest {
  id: number;
  jsonrpc: string;
  method: string;
  params: any;
}
