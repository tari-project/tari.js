import { TransactionBuilder } from "./builder";

export type PickMatching<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
export type ExtractMethods<T> = PickMatching<T, Function>;
export type BuilderMethods = ExtractMethods<TransactionBuilder>;
export type BuilderMethodNames = keyof BuilderMethods;
export type BuilderReturnType<T extends BuilderMethodNames> = Awaited<ReturnType<BuilderMethods[T]>>;

export type BuilderRequest<T extends BuilderMethodNames> = {
  methodName: T;
  args: Parameters<BuilderMethods[T]>;
};

export type BuilderResponse<T extends BuilderMethodNames> = {
  type: "call-method";
  result: BuilderReturnType<T>;
};

