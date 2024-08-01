import { Amount, ConfidentialWithdrawProof, TariFunctionDefinition, TariMethodDefinition } from "../builders/types";
import { TemplateFactory } from "./TemplateFactory";

interface MintFunction extends TariFunctionDefinition {
  functionName: "mint";
  args?: [string];
}

interface MintWithSymbolFunction extends TariFunctionDefinition {
  functionName: "mint_with_symbol";
  args?: [amount: string, symbol: string];
}

interface PayFeeMethod extends TariMethodDefinition {
  methodName: "pay_fee";
  args?: [Amount];
}

interface PayFeeConfidentialMethod extends TariMethodDefinition {
  methodName: "pay_fee_confidential";
  args?: [ConfidentialWithdrawProof];
}

interface TakeFreeCoinsMethod extends TariMethodDefinition {
  methodName: "take_free_coins";
  args?: [];
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

export class TestFaucet extends TemplateFactory {
  public mint: MintFunction;
  public mintWithSymbol: MintWithSymbolFunction;
  public takeFreeCoins: TakeFreeCoinsMethod;
  public takeFreeCoinsConfidential: TakeFreeCoinsConfidentialMethod;
  public burnCoins: BurnCoinsMethod;
  public totalSupply: TotalSupplyMethod;
  public payFee: PayFeeMethod;
  public payFeeConfidential: PayFeeConfidentialMethod;

  constructor(public templateAddress: string) {
    super(templateAddress);
    this._initFunctions();
    this._initMethods();
  }
  protected _initFunctions(): void {
    this.mint = this._defineFunction<MintFunction>("mint");
    this.mintWithSymbol = this._defineFunction<MintWithSymbolFunction>("mint_with_symbol");
  }
  protected _initMethods(): void {
    this.takeFreeCoins = this._defineMethod<TakeFreeCoinsMethod>("take_free_coins");
    this.takeFreeCoinsConfidential =
      this._defineMethod<TakeFreeCoinsConfidentialMethod>("take_free_coins_confidential");
    this.burnCoins = this._defineMethod<BurnCoinsMethod>("burn_coins");
    this.totalSupply = this._defineMethod<TotalSupplyMethod>("total_supply");
    this.payFee = this._defineMethod<PayFeeMethod>("pay_fee");
    this.payFeeConfidential = this._defineMethod<PayFeeConfidentialMethod>("pay_fee_confidential");
  }
}
