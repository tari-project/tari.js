import { TariUniverseProvider } from "./provider";

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
  result: ProviderReturnType<T>;
};
