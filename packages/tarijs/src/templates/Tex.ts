import {
  ResourceAddress,
  TariFunctionDefinition,
  TariMethodDefinition,
  WorkspaceArg,
} from "@tari-project/tarijs-builders";
import { TemplateFactory } from "./TemplateFactory";

interface NewFunction extends TariFunctionDefinition {
  functionName: "new";
  args?: [number];
}

interface SwapMethod extends TariMethodDefinition {
  methodName: "swap";
  args?: [WorkspaceArg, ResourceAddress];
}

interface AddLiquidityMethod extends TariMethodDefinition {
  methodName: "add_liquidity";
  args?: WorkspaceArg[];
}

interface RemoveLiquidityMethod extends TariMethodDefinition {
  methodName: "remove_liquidity";
  args?: WorkspaceArg[];
}

interface PoolsMethod extends TariMethodDefinition {
  methodName: "pools";
  args?: WorkspaceArg[];
}

export class TexTemplate extends TemplateFactory {
  public new: NewFunction;
  public swap: SwapMethod;
  public addLiquidity: AddLiquidityMethod;
  public removeLiquidity: RemoveLiquidityMethod;
  public pools: PoolsMethod;

  constructor(public templateAddress: string) {
    super(templateAddress);
    this.new = this._defineFunction<NewFunction>("new");
    this.swap = this._defineMethod<SwapMethod>("swap");
    this.addLiquidity = this._defineMethod<AddLiquidityMethod>("add_liquidity");
    this.removeLiquidity = this._defineMethod<RemoveLiquidityMethod>("remove_liquidity");
    this.pools = this._defineMethod<PoolsMethod>("pools");
    this._initFunctions();
    this._initMethods();
  }

  protected _initFunctions(): void {}
  protected _initMethods(): void {}
}
