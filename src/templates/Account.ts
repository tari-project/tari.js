import { ConfidentialWithdrawProof, NonFungibleId, ResourceAddress } from "@tariproject/typescript-bindings";
import { Amount } from "../builders/types/Amount";
import { TariMethodDefinition, WorkspaceArg } from "../builders/types";
import { TemplateFactory } from "./TemplateFactory";

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
  args?: [ConfidentialWithdrawProof];
}

interface WithdrawMethod extends TariMethodDefinition {
  methodName: "withdraw";
  args?: [string, Amount];
}

interface DepositMethod extends TariMethodDefinition {
  methodName: "deposit";
  args?: WorkspaceArg[];
}

interface CreateProofForResourceMethod extends TariMethodDefinition {
  methodName: "create_proof_for_resource";
  args?: [ResourceAddress];
}

interface CreateProofByAmountMethod extends TariMethodDefinition {
  methodName: "create_proof_by_amount";
  args?: [ResourceAddress, Amount];
}

interface CreateProofByNonFungibleIdsMethod extends TariMethodDefinition {
  methodName: "create_proof_by_non_fungible_ids";
  args?: [ResourceAddress, NonFungibleId[]];
}

interface BalanceMethod extends TariMethodDefinition {
  methodName: "balance";
  args?: [ResourceAddress];
}

interface GetBalancesMethod extends TariMethodDefinition {
  methodName: "get_balances";
  args?: [];
}

export class AccountTemplate extends TemplateFactory {
  public deposit: DepositMethod;
  public withdraw: WithdrawMethod;
  public createProofByAmount: CreateProofByAmountMethod;
  public createProofByNonFungibleIds: CreateProofByNonFungibleIdsMethod;
  public createProofForResource: CreateProofForResourceMethod;
  public balance: BalanceMethod;
  public getBalances: GetBalancesMethod;
  public payFee: PayFeeMethod;
  public payFeeConfidential: PayFeeConfidentialMethod;

  constructor(public templateAddress: string) {
    super(templateAddress);
    this._initFunctions();
    this._initMethods();
  }

  protected _initFunctions(): void {}
  protected _initMethods(): void {
    this.deposit = this._defineMethod<DepositMethod>("deposit");
    this.withdraw = this._defineMethod<WithdrawMethod>("withdraw");
    this.createProofByAmount = this._defineMethod<CreateProofByAmountMethod>("create_proof_by_amount");
    this.createProofByNonFungibleIds = this._defineMethod<CreateProofByNonFungibleIdsMethod>(
      "create_proof_by_non_fungible_ids",
    );
    this.createProofForResource = this._defineMethod<CreateProofForResourceMethod>("create_proof_for_resource");
    this.balance = this._defineMethod<BalanceMethod>("balance");
    this.getBalances = this._defineMethod<GetBalancesMethod>("get_balances");
    this.payFee = this._defineMethod<PayFeeMethod>("pay_fee");
    this.payFeeConfidential = this._defineMethod<PayFeeConfidentialMethod>("pay_fee_confidential");
  }
}
