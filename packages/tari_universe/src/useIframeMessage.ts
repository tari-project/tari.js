export enum MessageType {
  SIGNER_CALL = "SIGNER_CALL",
  RESIZE = "resize",
  SET_LANGUAGE = "SET_LANGUAGE",
  SET_THEME = "SET_THEME",
  GET_INIT_CONFIG = "GET_INIT_CONFIG",
  OPEN_EXTERNAL_LINK = "OPEN_EXTERNAL_LINK",
  ERROR = "ERROR",
  NOTIFICATION = "NOTIFICATION",
}

interface SignerCallMessage {
  type: MessageType.SIGNER_CALL;
  payload: {
    id: number;
    methodName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any[];
  };
}

interface ResizeMessage {
  type: MessageType.RESIZE;
  width: number;
  height: number;
}

interface SetLanguageMessage {
  type: MessageType.SET_LANGUAGE;
  payload: {
    language: string;
  };
}

interface SetThemeMessage {
  type: MessageType.SET_THEME;
  payload: {
    theme: string;
  };
}

interface GetInitConfigMessage {
  type: MessageType.GET_INIT_CONFIG;
}

interface OpenLinkMessage {
  type: MessageType.OPEN_EXTERNAL_LINK;
  payload: {
    url: string;
  };
}

type ErrorMessage = {
  type: MessageType.ERROR;
  payload: {
    message: string;
  };
};

interface EmitNotificationMessage {
  type: MessageType.NOTIFICATION;
  payload: {
    notification: string;
  };
}

export type IframeMessage =
  | SignerCallMessage
  | ResizeMessage
  | SetLanguageMessage
  | SetThemeMessage
  | GetInitConfigMessage
  | OpenLinkMessage
  | ErrorMessage
  | EmitNotificationMessage;

// Post a message to the parent window
export function postToParentIframe(message: IframeMessage, targetOrigin: string = "*") {
  if (window.parent && message.type) {
    window.parent.postMessage(message, targetOrigin);
  }
}
