import {
  Vault,
  SubstateId,
  substateIdToString,
  ComponentHeader,
  NonFungible,
  RejectReason,
  Resource,
  Substate,
  SubstateDiff,
  SubstateType,
  TransactionReceipt,
  UnclaimedConfidentialOutput,
  ValidatorFeePool,
  PublishedTemplate,
  ValidatorFeeWithdrawal,
  PublishedTemplateAddress,
  TransactionId,
  FinalizeResult,
  LogEntry,
  Event,
} from "@tari-project/typescript-bindings";
import { VaultSubstate, BuiltInAccount } from "../Account";
import { TransactionStatus } from "../TransactionStatus";
import { Option, Some, None } from "@thames/monads";
import { GetTransactionResultResponse } from "../GetTransactionResultResponse";
import { parseCbor } from "../";
import { ACCOUNT_TEMPLATE_ADDRESS } from "../consts";

export class SimpleTransactionResult {
  private readonly transaction_id: TransactionId;
  private readonly finalizeResult: FinalizeResult;
  private readonly _status: TransactionStatus;

  constructor(transaction_id: TransactionId, status: TransactionStatus, result: FinalizeResult) {
    this.transaction_id = transaction_id;
    this._status = status;
    this.finalizeResult = result;
  }

  static new(
    transaction_id: TransactionId,
    status: TransactionStatus,
    result: FinalizeResult,
  ): SimpleTransactionResult {
    return new SimpleTransactionResult(transaction_id, status, result);
  }

  static fromResponse(resp: GetTransactionResultResponse): SimpleTransactionResult {
    if (!resp.result) {
      throw new Error("Transaction result is missing in the response");
    }
    return SimpleTransactionResult.new(resp.transaction_id, resp.status, resp.result);
  }

  public get transactionId(): string {
    return this.transaction_id;
  }

  public get result(): FinalizeResult {
    return this.finalizeResult;
  }

  public get status(): TransactionStatus {
    return this._status;
  }

  public get logs(): LogEntry[] {
    return this.result.logs;
  }

  public get events(): Event[] {
    return this.result.events;
  }

  public getResultingComponents(): ComponentHeader[] {
    return this.getNewSubstatesOfType("Component") as ComponentHeader[];
  }

  public getResultingResources(): Resource[] {
    return this.getNewSubstatesOfType("Resource") as Resource[];
  }

  public getResultingVaults(): VaultSubstate[] {
    const vaults = this.getUpSubstatesOfType("Vault");
    return vaults.map((upSubstate) => VaultSubstate.new(upSubstate.id, upSubstate.substate as Vault));
  }

  public getResultingNonFungibles(): NonFungible[] {
    return this.getNewSubstatesOfType("NonFungible") as NonFungible[];
  }

  public getTransactionReceipt(): TransactionReceipt {
    return this.getNewSubstatesOfType("TransactionReceipt")[0]! as TransactionReceipt;
  }

  public getNewPublishedTemplates(): PublishedTemplate[] {
    return this.getNewSubstatesOfType("Template") as PublishedTemplate[];
  }

  public getNewSubstatesOfType(type: SubstateType): AnySubstate[] {
    const upSubstates = this.getUpSubstatesOfType(type);
    return upSubstates.map((upSubstate) => upSubstate.substate);
  }

  public getUpSubstatesOfType(type: SubstateType): UpSubstate[] {
    const diff = this.diff;
    if (diff.isNone()) {
      return [];
    }
    const d = diff.unwrap();

    const substates = [];
    for (const upSubstate of d.upSubstates()) {
      if (upSubstate.type === type) {
        substates.push(upSubstate);
      }
    }

    return substates;
  }

  public getComponentsByTemplateAddress(templateAddress: PublishedTemplateAddress): SimpleComponent[] {
    const diff = this.diff;
    if (diff.isNone()) {
      return [];
    }
    const d = diff.unwrap();

    const components = [];
    for (const upSubstate of d.upSubstates()) {
      if (
        upSubstate.type === "Component" &&
        (upSubstate.substate as ComponentHeader).template_address === templateAddress
      ) {
        components.push(SimpleComponent.new(upSubstate.id, upSubstate.version, upSubstate.substate as ComponentHeader));
      }
    }

    return components;
  }

  public getResultingAccounts(): GetAccountsResult[] {
    const components = this.getComponentsByTemplateAddress(ACCOUNT_TEMPLATE_ADDRESS);

    const accounts = [];
    for (const component of components) {
      const account = component.decodeBody<BuiltInAccount>();
      accounts.push({ substate_id: component.id, version: component.version, account });
    }

    return accounts;
  }

  /**
   * Returns the reject reason if the whole transaction was rejected or if the fee intent was executed but the main intent rejected
   * Otherwise returns None.
   */
  public get anyRejectReason(): Option<RejectReason> {
    return this.rejected.or(this.onlyFeeAccepted.map((x) => x[1]));
  }

  public get accept(): Option<SimpleSubstateDiff> {
    const result = this.result as any;
    const accept = result?.result.Accept;
    if (!accept) {
      return None;
    }

    return Some(SimpleSubstateDiff.from(accept));
  }

  public get diff(): Option<SimpleSubstateDiff> {
    return this.accept.or(this.onlyFeeAccepted.map((x) => x[0]));
  }

  public get onlyFeeAccepted(): Option<[SimpleSubstateDiff, RejectReason]> {
    const result = this.result;
    if (!result || !result.result || !("AcceptFeeRejectRest" in result.result)) {
      return None;
    }

    const [diff, reason] = result.result.AcceptFeeRejectRest;
    return Some([SimpleSubstateDiff.from(diff), reason]);
  }

  public get rejected(): Option<RejectReason> {
    const result = this.result as any;
    if (!result || !result.result) {
      return None;
    }
    if (!("Reject" in result.result)) {
      return None;
    }

    return Some(result?.result.Reject);
  }
}

export function splitOnce(str: string, separator: string): [string, string] | null {
  const index = str.indexOf(separator);
  if (index === -1) {
    return null;
  }
  return [str.slice(0, index), str.slice(index + separator.length)];
}

function prefixToSubstateType(prefix: string): SubstateType | null {
  switch (prefix) {
    case "component":
      return "Component";
    case "resource":
      return "Resource";
    case "vault":
      return "Vault";
    case "nft":
      return "NonFungible";
    case "txreceipt":
      return "TransactionReceipt";
    case "vnfp":
      return "ValidatorFeePool";
    case "template":
      return "Template";
    default:
      console.log("Unknown substate type prefix", prefix);
      return null;
  }
}

export class SimpleSubstateDiff {
  private up_substates: UpSubstate[];
  private down_substates: DownSubstate[];
  private fee_withdrawals: ValidatorFeeWithdrawal[];

  constructor(diff: SubstateDiff) {
    this.up_substates = diff.up_substates
      .map(([id, val]: [SubstateId | string, Substate]) => {
        if (!val.substate) {
          console.error("Substate is missing in the accept result", id, val);
          return null;
        }

        const valType = Object.keys(val.substate)[0];
        if (!valType) {
          console.log("Substate is missing key", id, val);
          return null;
        }
        const idVal = (typeof id === "string" ? id : Object.values(id)[0]) as string;
        return {
          type: valType,
          id: idVal,
          version: val.version,
          // @ts-ignore
          substate: val.substate[valType],
        } as UpSubstate;
      })
      .filter((x) => x !== null);

    this.down_substates = diff.down_substates.map(([id, version]: [SubstateId | string, number]) => {
      const type = typeof id === "string" ? prefixToSubstateType(splitOnce(id, "_")![0]) : Object.keys(id)[0];
      const idVal = substateIdToString(id);
      return {
        type: type! as SubstateType,
        id: idVal,
        version,
      } as DownSubstate;
    });

    this.fee_withdrawals = diff.fee_withdrawals;
  }

  public static from(diff: SubstateDiff): SimpleSubstateDiff {
    return new SimpleSubstateDiff(diff);
  }

  public upSubstates(): UpSubstate[] {
    return this.up_substates;
  }

  public downSubstates(): DownSubstate[] {
    return this.down_substates;
  }

  public feeWithdrawals(): ValidatorFeeWithdrawal[] {
    return this.fee_withdrawals;
  }
}

export type AnySubstate =
  | ComponentHeader
  | Resource
  | Vault
  | UnclaimedConfidentialOutput
  | NonFungible
  | TransactionReceipt
  | ValidatorFeePool
  | PublishedTemplate;

export type UpSubstate = {
  type: SubstateType;
  id: string;
  version: number;
  substate: AnySubstate;
};

export type DownSubstate = {
  type: SubstateType;
  id: string;
  version: number;
};

export class SimpleComponent {
  private _id: string;
  private _version: number;
  private _substate: ComponentHeader;

  constructor(id: string, version: number, substate: ComponentHeader) {
    this._id = id;
    this._version = version;
    this._substate = substate;
  }

  public static new(id: string, version: number, substate: ComponentHeader): SimpleComponent {
    return new SimpleComponent(id, version, substate);
  }

  public get id(): string {
    return this._id;
  }

  public get version(): number {
    return this._version;
  }

  public get substate(): ComponentHeader {
    return this._substate;
  }

  public decodeBody<T>(): T {
    return parseCbor(this.substate.body.state) as T;
  }
}

export interface GetAccountsResult {
  substate_id: string;
  version: number;
  account: BuiltInAccount;
}
