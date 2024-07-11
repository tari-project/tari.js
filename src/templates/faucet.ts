import { Amount, ConfidentialWithdrawProof } from "@tariproject/typescript-bindings";
import { TransactionBuilder, TariFunctionDefinition, TariMethodDefinition } from "../builders/transaction/builder";

interface MintFunction extends TariFunctionDefinition {
  functionName: "mint";
  args?: [Amount];
}

interface MintWithSymbolFunction extends TariFunctionDefinition {
  functionName: "mint_with_symbol";
  args?: [Amount, string];
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
  args?: [Amount];
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
  args?: [ConfidentialWithdrawProof]; //TODO proof as arg
}

interface TakeFreeCoinsMethod extends TariMethodDefinition {
  methodName: "take_free_coins";
  args?: []; //TODO no args
}

interface TakeFreeCoinsConfidentialMethod extends TariMethodDefinition {
  methodName: "take_free_coins_confidential";
  args?: [ConfidentialWithdrawProof];
}

interface BurnCoinsMethod extends TariMethodDefinition {
  methodName: "burn_coins";
  args?: [BigInt];
}

interface TotalSupplyMethod extends TariMethodDefinition {
  methodName: "total_supply";
  args?: [];
}

class TestFaucet {
  public mint: MintFunction;
  public mintWithSymbol: MintWithSymbolFunction;
  public takeFreeCoins: TakeFreeCoinsMethod;
  public takeFreeCoinsConfidential: TakeFreeCoinsConfidentialMethod;
  public burnCoins: BurnCoinsMethod;
  public totalSupply: TotalSupplyMethod;
  public payFee: PayFeeMethod;
  public payFeeConfidential: PayFeeConfidentialMethod;

  constructor(public templateAddress: string) {
    this.mint = this._defineFunction<MintFunction>("mint");
    this.mintWithSymbol = this._defineFunction<MintWithSymbolFunction>("mint_with_symbol");
    this.takeFreeCoins = this._defineMethod<TakeFreeCoinsMethod>("take_free_coins");
    this.takeFreeCoinsConfidential =
      this._defineMethod<TakeFreeCoinsConfidentialMethod>("take_free_coins_confidential");
    this.burnCoins = this._defineMethod<BurnCoinsMethod>("burn_coins");
    this.totalSupply = this._defineMethod<TotalSupplyMethod>("total_supply");
    this.payFee = this._defineMethod<PayFeeMethod>("pay_fee");
    this.payFeeConfidential = this._defineMethod<PayFeeConfidentialMethod>("pay_fee_confidential");
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
const fauncet = new TestFaucet("address");
const key = new Uint8Array(0);
const tst = builder
  .createAccount("tst")
  .callFunction(fauncet.mintWithSymbol, [1, "a"])
  .callMethod(fauncet.payFee, [1])
  .putLastInstructionOutputOnWorkspace(key)
  .withMinEpoch(1)
  .build();
