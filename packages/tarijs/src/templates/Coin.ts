import { Amount, ResourceAddress, TariFunctionDefinition, TariMethodDefinition } from "@tari-project/tarijs-builders";
import { TemplateFactory } from "./TemplateFactory";

interface NewFunction extends TariFunctionDefinition {
  functionName: "new";
  args?: [number, string];
}

interface MintFunction extends TariFunctionDefinition {
  functionName: "mint";
  args?: [Amount];
}

interface VaultAddressMethod extends TariMethodDefinition {
  functionName: "vault_address";
  args?: [];
}

interface TakeFreeCoinsMethod extends TariMethodDefinition {
  methodName: "take_free_coins";
  args?: [number];
}
interface BalanceMethod extends TariMethodDefinition {
  methodName: "balance";
  args?: [ResourceAddress];
}
interface BurnCoinsMethod extends TariMethodDefinition {
  methodName: "burn_coins";
  args?: [Amount];
}
interface TotalSupplyMethod extends TariMethodDefinition {
  methodName: "total_supply";
  args?: [];
}

export class CoinTemplate extends TemplateFactory {
  public new: NewFunction;
  public mint: MintFunction;
  public takeFreeCoins: TakeFreeCoinsMethod;
  public balance: BalanceMethod;
  public burnCoins: BurnCoinsMethod;
  public totalSupply: TotalSupplyMethod;
  public vaultAddress: VaultAddressMethod;

  constructor(public templateAddress: string) {
    super(templateAddress);
    this.new = this._defineFunction<NewFunction>("new");
    this.mint = this._defineFunction<MintFunction>("mint");
    this.takeFreeCoins = this._defineMethod<TakeFreeCoinsMethod>("take_free_coins");
    this.balance = this._defineMethod<BalanceMethod>("balance");
    this.burnCoins = this._defineMethod<BurnCoinsMethod>("burn_coins");
    this.totalSupply = this._defineMethod<TotalSupplyMethod>("total_supply");
    this.vaultAddress = this._defineMethod<VaultAddressMethod>("vault_address");
  }

  protected _initFunctions(): void {}
  protected _initMethods(): void {}
}
