import { ProviderMethodNames, ProviderRequest, ProviderResponse, ProviderReturnType } from "./types";

export function sendProviderCall<MethodName extends ProviderMethodNames>(
  req: Omit<ProviderRequest<MethodName>, "id">,
  id: number,
): Promise<ProviderReturnType<MethodName>> {
  return new Promise<ProviderReturnType<MethodName>>((resolve, reject) => {
    const event_ref = (resp: MessageEvent<ProviderResponse<MethodName>>) => {
      if (resp.data.resultError) {
        window.removeEventListener("message", event_ref);
        reject(resp.data.resultError);
      }
      if (resp && resp.data && resp.data.id && resp.data.id === id && resp.data.type === "provider-call") {
        window.removeEventListener("message", event_ref);
        resolve(resp.data.result);
      }
    };

    window.addEventListener("message", event_ref, false);

    window.parent.postMessage({ ...req, id, type: "provider-call" }, "*");
  });
}
