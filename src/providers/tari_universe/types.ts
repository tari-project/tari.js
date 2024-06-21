import { TariPermissions } from "../wallet_daemon";
import { TariUniverseProvider } from "./provider";

export type TariUniverseProviderParameters = {
  permissions: TariPermissions;
  optionalPermissions: TariPermissions;
  name?: string;
  onConnection?: () => void;
};

export type WindowSize = {
  width: number;
  height: number;
};

export type PickMatching<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
export type ExtractMethods<T> = PickMatching<T, Function>;
export type ProviderMethods = ExtractMethods<TariUniverseProvider>;
export type ProviderMethodNames = keyof ProviderMethods;
export type ProviderReturnType<T extends ProviderMethodNames> = Awaited<ReturnType<ProviderMethods[T]>>;

export type ProviderRequest<T extends ProviderMethodNames> = {
  id: number;
  methodName: T;
  args: Parameters<ProviderMethods[T]>;
};

export type ProviderResponse<T extends ProviderMethodNames> = {
  id: number;
  type: "provider-call";
  result: ProviderReturnType<T>;
};

export type ProviderSizeRequest = {
  id: number;
  type: "request-parent-size";
};

export type ProviderSizeResponse = {
  id: number;
  type: "request-parent-size";
  result: WindowSize;
};
