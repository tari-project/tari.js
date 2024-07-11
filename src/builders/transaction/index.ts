import { TransactionBuilder, TariFunctionDefinition, TariMethodDefinition } from "./builder";

interface MintWithSymbolFunction extends TariFunctionDefinition {
  functionName: "mint_with_symbol";
  args?: [BigInt, string];
}

/**
 * Adds a fee instruction that calls the "take_fee" method on a component.
 * This method must exist and return a Bucket with containing revealed confidential XTR resource.
 * This allows the fee to originate from sources other than the transaction sender's account.
 * The fee instruction will lock up the "max_fee" amount for the duration of the transaction.
 * @param componentAddress
 * @param maxFee
 * @returns
 */
interface PayFeeMethod extends TariMethodDefinition {
  methodName: "pay_fee";
  args?: [BigInt];
}
// /**
//  * Adds a fee instruction that calls the "take_fee_confidential" method on a component.
//  * This method must exist and return a Bucket with containing revealed confidential XTR resource.
//  * This allows the fee to originate from sources other than the transaction sender's account.
//  * @param componentAddress
//  * @param proof
//  * @returns
//  */
interface PayFeeConfidentialMethod extends TariMethodDefinition {
  methodName: "pay_fee_confidential";
  args?: [BigInt]; //TODO proof as arg
}

interface CreateProofMethod extends TariMethodDefinition {
  methodName: "create-proof";
  args?: [string, string]; //TODO proof as arg
}

interface TakeFreeCoinsMethod extends TariMethodDefinition {
  functionName: "take_free_coins";
  args?: [];
}
interface DepositMethod extends TariMethodDefinition {
  functionName: "deposit";
  args?: [];
}

class ContractFactory {
  public mintWithSymbol: MintWithSymbolFunction;
  public payFee: PayFeeMethod;
  public payFeeConfidential: PayFeeConfidentialMethod;
  public createProof: CreateProofMethod;
  public takeFreeCoins: TakeFreeCoinsMethod;
  public deposit: DepositMethod;

  constructor(public templateAddress: string) {
    this.mintWithSymbol = this._defineFunction<MintWithSymbolFunction>("mint_with_symbol");
    this.payFee = this._defineMethod<PayFeeMethod>("pay_fee");
    this.payFeeConfidential = this._defineMethod<PayFeeConfidentialMethod>("pay_fee_confidential");
    this.createProof = this._defineMethod<CreateProofMethod>("create-proof");
    this.takeFreeCoins = this._defineMethod<TakeFreeCoinsMethod>("take_free_coins");
    this.deposit = this._defineMethod<DepositMethod>("deposit");
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
const key = new Uint8Array(0);
const tst = builder
  .createAccount("tst")
  .callFunction(instance.mintWithSymbol, [1n, "a"])
  .callMethod(instance.payFee, [1n])
  .putLastInstructionOutputOnWorkspace(key)
  .withMinEpoch(1)
  .build();
