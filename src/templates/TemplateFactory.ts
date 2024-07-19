import { TariFunctionDefinition, TariMethodDefinition } from "../builders/types/Builder";

export abstract class TemplateFactory {
  constructor(public templateAddress: string) {}

  public _defineFunction<T extends TariFunctionDefinition>(name: T["functionName"]): T {
    return {
      templateAddress: this.templateAddress,
      functionName: name,
    } as T;
  }

  public _defineMethod<T extends TariMethodDefinition>(name: T["methodName"]): T {
    return {
      componentAddress: this.templateAddress,
      methodName: name,
    } as T;
  }

  protected abstract _initFunctions(): void;
  protected abstract _initMethods(): void;
}
