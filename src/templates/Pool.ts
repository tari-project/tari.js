import { TariMethodDefinition } from "../builders/types/Builder";
import { WorkspaceArg } from "../builders/types/Workspace";
import { TemplateFactory } from "./TemplateFactory";

interface CreatePool extends TariMethodDefinition {
  methodName: "create_pool";
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

interface SwapMethod extends TariMethodDefinition {
  methodName: "swap";
  args?: (WorkspaceArg | string)[];
}

export class PoolTemplate extends TemplateFactory {
  public createPool: CreatePool;
  public addLiquidity: AddLiquidityMethod;
  public removeLiquidity: RemoveLiquidityMethod;
  public swap: SwapMethod;

  constructor(public templateAddress: string) {
    super(templateAddress);
    this._initFunctions();
    this._initMethods();
  }

  protected _initFunctions(): void {}
  protected _initMethods(): void {
    this.addLiquidity = this._defineMethod<AddLiquidityMethod>("add_liquidity");
    this.removeLiquidity = this._defineMethod<RemoveLiquidityMethod>("remove_liquidity");
    this.swap = this._defineMethod<SwapMethod>("swap");
  }
}
