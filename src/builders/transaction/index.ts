import { TransactionBuilder, TariFunctionDefinition, TariMethodDefinition } from "./builder";

interface MintWithSymbolFunction extends TariFunctionDefinition {
  functionName: "mintWithSymbol";
  args?: [BigInt, string];
}
interface CreateAccountFunction extends TariFunctionDefinition {
  functionName: "createAccount";
  args?: [string, string | null];
}
interface PayFeeMethod extends TariMethodDefinition {
  methodName: "payFee";
  args?: [BigInt];
}
interface PayFeeConfidentialMethod extends TariMethodDefinition {
  methodName: "payFeeConfidential";
  args?: [BigInt]; //TODO proof as arg
}

class ContractFactory {
  public mintWithSymbol: MintWithSymbolFunction;
  public createAccount: CreateAccountFunction;
  public payFee: PayFeeMethod;
  public payFeeConfidential: PayFeeConfidentialMethod;
  constructor(public templateAddress: string) {
    this.mintWithSymbol = this._defineFunction<MintWithSymbolFunction>("mintWithSymbol");
    this.createAccount = this._defineFunction<CreateAccountFunction>("createAccount");
    this.payFee = this._defineMethod<PayFeeMethod>("payFee");
    this.payFeeConfidential = this._defineMethod<PayFeeConfidentialMethod>("payFeeConfidential");
  }

  private _defineFunction<T extends TariFunctionDefinition>(name: T["functionName"]): T {
    return {
      templateAddress: this.templateAddress,
      functionName: name,
    } as T;
  }

  private _defineMethod<T extends TariMethodDefinition>(name: T["methodName"]): T {
    return {
      componentAddress: this.templateAddress,
      methodName: name,
    } as T;
  }
}

const builder = new TransactionBuilder();
const instance = new ContractFactory("address");
builder.callFunction(instance.mintWithSymbol, [10n, "symbol"]).callMethod(instance.payFee, [1n]).build();
