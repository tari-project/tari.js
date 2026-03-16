//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

export interface TransportOptions {
  timeout_millis?: number;
}

export interface HttpTransport {
  sendGet<T>(path: string, params: Record<string, unknown>, options?: TransportOptions): Promise<T>;
  sendHead<T>(path: string, params: Record<string, unknown>, options?: TransportOptions): Promise<T>;
  sendPost<T>(path: string, body: unknown, options?: TransportOptions): Promise<T>;
  sendPut<T>(path: string, body: unknown, options?: TransportOptions): Promise<T>;
  sendDelete<T>(path: string, params: Record<string, unknown>, options?: TransportOptions): Promise<T>;
}

interface RequestSpec {
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
}

export class FetchTransport implements HttpTransport {
  private url: string;

  private constructor(url: string) {
    this.url = url;
  }

  public static new(url: string): FetchTransport {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new Error("URL must start with http:// or https://");
    }
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    return new FetchTransport(url);
  }

  sendGet<T>(path: string, params: Record<string, unknown>, options?: TransportOptions): Promise<T> {
    return this.sendRequest<T>(path, { method: "GET", params }, options);
  }

  sendHead<T>(path: string, params: Record<string, unknown>, options?: TransportOptions): Promise<T> {
    return this.sendRequest<T>(path, { method: "HEAD", params }, options);
  }

  sendPost<T>(path: string, body: unknown, options?: TransportOptions): Promise<T> {
    return this.sendRequest<T>(path, { method: "POST", body }, options);
  }

  sendPut<T>(path: string, body: unknown, options?: TransportOptions): Promise<T> {
    return this.sendRequest<T>(path, { method: "PUT", body }, options);
  }

  sendDelete<T>(path: string, params: Record<string, unknown>, options?: TransportOptions): Promise<T> {
    return this.sendRequest<T>(path, { method: "DELETE", params }, options);
  }

  private async sendRequest<T>(path: string, request: RequestSpec, options?: TransportOptions): Promise<T> {
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = options?.timeout_millis
      ? setTimeout(() => controller.abort("Timeout"), options.timeout_millis)
      : null;

    if (path.startsWith("/")) {
      path = path.slice(1);
    }

    const urlParams = new URLSearchParams();
    if (request.params) {
      for (const [key, value] of Object.entries(request.params)) {
        if (value !== undefined && value !== null) {
          urlParams.append(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = { ...(request.headers ?? {}) };
    let body: string | undefined;
    if (request.body !== undefined && request.body !== null) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(request.body);
    }

    let fqPath = `${this.url}/${path}`;
    const qs = urlParams.toString();
    if (qs.length > 0) {
      fqPath += `?${qs}`;
    }

    const response = await fetch(fqPath, {
      method: request.method,
      headers,
      body,
      signal,
    });

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}${text ? ` — ${text}` : ""}`);
    }

    const json = await response.json();
    if (json && typeof json === "object" && "error" in json) {
      throw new Error(`${json.error.code}: ${json.error.message}`);
    }
    return json as T;
  }
}
