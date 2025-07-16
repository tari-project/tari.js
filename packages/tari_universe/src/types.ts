import { TariPermissions } from "@tari-project/tari-permissions";
import { TariUniverseSigner } from "./signer";

export type TariUniverseSignerParameters = {
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
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export type ExtractMethods<T> = PickMatching<T, Function>;
export type SignerMethods = ExtractMethods<TariUniverseSigner>;
export type SignerMethodNames = keyof SignerMethods;
export type SignerReturnType<T extends SignerMethodNames> = Awaited<ReturnType<SignerMethods[T]>>;

export type SignerRequest<T extends SignerMethodNames> = {
  id: number;
  methodName: T;
  args: Parameters<SignerMethods[T]>;
};

export type SignerResponse<T extends SignerMethodNames> = {
  id: number;
  type: "signer-call";
  result: SignerReturnType<T>;
  resultError?: string;
};
