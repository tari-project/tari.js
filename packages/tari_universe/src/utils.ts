import { SignerMethodNames, SignerRequest, SignerResponse, SignerReturnType } from "./types";
import { MessageType, postToParentIframe } from "./useIframeMessage";

export function sendSignerCall<MethodName extends SignerMethodNames>(
  req: Omit<SignerRequest<MethodName>, "id">,
  id: number,
): Promise<SignerReturnType<MethodName>> {
  return new Promise<SignerReturnType<MethodName>>((resolve, reject) => {
    const event_ref = (resp: MessageEvent<SignerResponse<MethodName>>) => {
      if (resp.data.resultError) {
        window.removeEventListener("message", event_ref);
        reject(resp.data.resultError);
      }
      if (resp && resp.data && resp.data.id && resp.data.id === id && resp.data.type === MessageType.SIGNER_CALL) {
        window.removeEventListener("message", event_ref);
        resolve(resp.data.result);
      }
    };

    window.addEventListener("message", event_ref, false);

    postToParentIframe({
      type: MessageType.SIGNER_CALL,
      payload: { args: req.args, methodName: req.methodName, id: id },
    });
  });
}
