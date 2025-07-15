import { RpcRequest, RpcTransport, RpcTransportOptions } from "./rpc";

export default class FetchRpcTransport implements RpcTransport {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  static new(url: string) {
    return new FetchRpcTransport(url);
  }

  async sendRequest<T>(data: RpcRequest, options: RpcTransportOptions): Promise<T> {
    const headers: { [key: string]: string } = {
      "Content-Type": "application/json",
    };
    if (options?.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = options.timeout_millis
      ? setTimeout(() => {
          controller.abort("Timeout");
        }, options.timeout_millis)
      : null;

    const response = await fetch(this.url, {
      method: "POST",
      body: JSON.stringify(data),
      headers,
      signal,
    });
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const json = await response.json();
    if (json.error) {
      throw new Error(`${json.error.code}: ${json.error.message}`);
    }
    return json.result;
  }
}
