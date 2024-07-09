import { TransactionBuilder, TariFunctionDefinition } from "./builder";

interface MintWithSymbolFunction extends TariFunctionDefinition {
  functionName: "mintWithSymbol";
  arguments?: [BigInt, string];
}
class ContractFactory {
  public mintWithSymbol: MintWithSymbolFunction;
  constructor(public templateAddress: string) {
    this.mintWithSymbol = this._defineMethod<MintWithSymbolFunction>("mintWithSymbol");
  }

  private _defineMethod<T extends TariFunctionDefinition>(methodName: T["functionName"]): T {
    return {
      templateAddress: this.templateAddress,
      functionName: methodName,
    } as T;
  }
}

const builder = new TransactionBuilder();
const instance = new ContractFactory("address");
builder.dupa(instance.mintWithSymbol, [10n, "symbol"]).build();


