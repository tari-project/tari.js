import { ConfidentialWithdrawProof, ResourceAddress } from "@tariproject/typescript-bindings";
import { Amount } from "../builders/types/Amount";
import { TariFunctionDefinition, TariMethodDefinition, WorkspaceArg } from "../builders/types/Builder";
import { TemplateFactory } from "./TemplateFactory";

interface NewPoolFunction extends TariFunctionDefinition {
  functionName: "new";
  args?: [ResourceAddress, ResourceAddress, Amount];
}

interface MintFunction extends TariFunctionDefinition {
  functionName: "mint";
  args?: [Amount];
}

interface MintWithSymbolFunction extends TariFunctionDefinition {
  functionName: "mint_with_symbol";
  args?: [Amount, string];
}

interface PayFeeMethod extends TariMethodDefinition {
  methodName: "pay_fee";
  args?: [string];
}

interface PayFeeConfidentialMethod extends TariMethodDefinition {
  methodName: "pay_fee_confidential";
  args?: [ConfidentialWithdrawProof];
}

interface TotalSupplyMethod extends TariMethodDefinition {
  methodName: "total_supply";
  args?: [];
}

interface WithdrawMethod extends TariMethodDefinition {
  methodName: "withdraw";
  args?: [string, string];
}

interface AddLiquidityMethod extends TariMethodDefinition {
  methodName: "add_liquidity";
  args?: WorkspaceArg[];
}

interface RemoveLiquidityMethod extends TariMethodDefinition {
  methodName: "remove_liquidity";
  args?: WorkspaceArg[];
}

interface DepositMethod extends TariMethodDefinition {
  methodName: "deposit";
  args?: WorkspaceArg[];
}

interface SwapMethod extends TariMethodDefinition {
  methodName: "swap";
  args?: (WorkspaceArg | string)[];
}

export class TariswapTemplate extends TemplateFactory {
  public newPool: NewPoolFunction;
  public mint: MintFunction;
  public mintWithSymbol: MintWithSymbolFunction;
  public totalSupply: TotalSupplyMethod;
  public payFee: PayFeeMethod;
  public payFeeConfidential: PayFeeConfidentialMethod;
  public withdraw: WithdrawMethod;
  public addLiquidity: AddLiquidityMethod;
  public removeLiquidity: RemoveLiquidityMethod;
  public deposit: DepositMethod;
  public swap: SwapMethod;

  constructor(public templateAddress: string) {
    super(templateAddress);
    this._initFunctions();
    this._initMethods();
  }

  protected _initFunctions(): void {
    this.newPool = this._defineFunction<NewPoolFunction>("new");
    this.mint = this._defineFunction<MintFunction>("mint");
    this.mintWithSymbol = this._defineFunction<MintWithSymbolFunction>("mint_with_symbol");
  }
  protected _initMethods(): void {
    this.totalSupply = this._defineMethod<TotalSupplyMethod>("total_supply");
    this.payFee = this._defineMethod<PayFeeMethod>("pay_fee");
    this.payFeeConfidential = this._defineMethod<PayFeeConfidentialMethod>("pay_fee_confidential");
    this.withdraw = this._defineMethod<WithdrawMethod>("withdraw");
    this.addLiquidity = this._defineMethod<AddLiquidityMethod>("add_liquidity");
    this.removeLiquidity = this._defineMethod<RemoveLiquidityMethod>("remove_liquidity");
    this.deposit = this._defineMethod<DepositMethod>("deposit");
    this.swap = this._defineMethod<SwapMethod>("swap");
  }
}
