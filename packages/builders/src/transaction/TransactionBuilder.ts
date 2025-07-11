//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import { TransactionRequest } from "./TransactionRequest";
import { TransactionArg } from "@tari-project/tarijs-types";
import {
  Amount,
  ComponentAddress,
  ConfidentialClaim,
  ConfidentialWithdrawProof,
  Instruction,
  ResourceAddress,
  SubstateRequirement,
  Transaction,
  TransactionSignature,
  UnsignedTransaction,
  PublishedTemplateAddress,
  WorkspaceOffsetId,
  UnsignedTransactionV1, AllocatableAddressType,
} from "@tari-project/typescript-bindings";
import { parseWorkspaceStringKey } from "../helpers";
import { NamedArg } from "../helpers/workspace";

/**
 * This interface defines the constructor for a Transaction object.
 * It is used to create a new signed Transaction instance from an UnsignedTransaction and an array of TransactionSignatures.
 * The constructor takes an UnsignedTransaction and an array of TransactionSignatures as parameters.
 */
export interface TransactionConstructor {
/**
 * Creates a new {@link Transaction} instance.
 *
 * @param unsignedTransaction - The UnsignedTransaction to create the Transaction from.
 * @param signatures - An array of {@link TransactionSignature} objects, each containing:
 *   - `public_key`: A string representing a valid 32-byte Ristretto255 public key.
 *   - `signature`: An object containing:
 *       - `public_nonce`: A string representing the public nonce part of the Schnorr signature.
 *         - **Limitation:** Must be a valid 32-byte Ristretto255 public key (nonce), serialized as a string.
 *       - `signature`: A string representing the actual Schnorr signature scalar.
 *         - **Limitation:** Must be a valid 32-byte Schnorr signature scalar, serialized as a string.
 *
 * All fields must be validly encoded, canonical Ristretto255 public keys or Schnorr signature components in the correct format and length.
 * Any deviation (e.g., wrong length, invalid encoding) will result in errors or failed signature verification.
 *
 * @returns A new Transaction instance.
 */
  new(unsignedTransaction: UnsignedTransaction, signatures: TransactionSignature[]): Transaction;
}

/**
 * Defines a function that can be invoked on a published template in the Tari network.
 *
 */
export interface TariFunctionDefinition {
  /**
   * The name of the function to call. Should match the function defined in the published template.
   */
  functionName: string;
  /**
   * The arguments to pass to the function. Optional.
   *
   * Each argument is a {@link NamedArg}, which represents either a literal value or a reference to a workspace variable.
   *
   * @see NamedArg for full structure and usage.
   */
  args?: NamedArg[];
  /**
   * The unique address ({@link PublishedTemplateAddress}) of the published template (as a 64-character hexadecimal string, optionally prefixed by "template_").
   */
  templateAddress: PublishedTemplateAddress;
}

/**
 * Defines a method that can be invoked on a component in the Tari network.
 */
export interface TariMethodDefinition {
/**
 * The name of the method to call on the component.
 */
  methodName: string;
  /**
   * Array of {@link TransactionArg} representing the arguments to pass to the method.
   * These can be either literal values or references to workspace variables.
   */
  args?: TransactionArg[];
  /**
   * The address of the component to call the method on.
   *
   * @remarks
   * - Format: a 64-character hexadecimal string (representing 32 bytes), optionally prefixed by `"component_"`.
   * - Must correspond to a valid, existing component on the Tari network.
   * - Mutually exclusive with {@link TariMethodDefinition.fromWorkspace}.
   * - If not provided, the method will be called on the component in the current workspace.
   *
   * @example
   * "component_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
   */
  componentAddress?: ComponentAddress;
  /**
   * The workspace from which to call the method.
   *
   * @remarks
   * - Mutually exclusive with {@link TariMethodDefinition.componentAddress}.
   * - If provided, the method will be called on the component in the specified workspace.
   * - The workspace must be defined in the current transaction context.
   *
   * @example
   * "my_workspace"
   */
  fromWorkspace?: string,
}

/**
 * Defines the interface for a Transaction Builder that allows constructing and signing transactions in the Tari network.
 * This interface provides methods to add instructions, inputs, and other components to a transaction and then build a signed or unsigned transaction.
 * The methods are chained together to allow for a fluent API style of transaction construction.
 * The Builder interface is implmented by the {@link TransactionBuilder} class.
 *
 * @example
 * // Usage:
 * const builder: Builder = new TransactionBuilder();
 * builder
 *   .createAccount(ownerPublicKey)
 *   .addInput(input)
 *   .withMinEpoch(5)
 *   .buildUnsignedTransaction();
 */
export interface Builder {
  /**
   * Adds a function call to the transaction, allowing the developer to invoke a function on a published template. This implements {@link TariFunctionDefinition}
   * @param func - The function definition to call, which includes the function name, arguments, and template address.
   * @param args - The arguments to pass to the function. These should be provided as an array of {@link NamedArg} objects. Optional.
   * @returns The current instance of the Builder, allowing for method chaining.
   */
  callFunction<T extends TariFunctionDefinition>(func: T, args: Exclude<T["args"], undefined>): this;
  /**
   * Adds a method call to the transaction, allowing the developer to invoke a method on a component. This implements {@link TariMethodDefinition}
   * @param method - The method definition to call, which includes the method name, arguments, and component address.
   * @param args - The arguments to pass to the method. These should be provided as an array of {@link TransactionArg} objects. Optional.
   * @returns The current instance of the Builder, allowing for method chaining.
   */
  callMethod<T extends TariMethodDefinition>(method: T, args: Exclude<T["args"], undefined>): this;
  /**
   * Adds an instruction to create a new account in the Tari Network to the transaction.
   * @param ownerPublicKey - The public key of the account owner, represented as a 64-character hexadecimal string.
   * @param workspaceBucket - An optional workspace bucket name to associate with the account. If provided, it will be used to create a workspace for the account. Allows for referencing the account elsewhere in the transaction without requiring it's address.
   * @returns The current instance of the Builder, allowing for method chaining.
   * @example
   */
  createAccount(ownerPublicKey: string, workspaceBucket?: string): this;
  /**
   * Creates an internal proof that can be used to prove ownership of a resource in a component's account.
   * @param account - The address of the component account that owns the resource. represented as a 64-character hexadecimal string, prepended with "component_".
   * @param resourceAddress - The address of the resource to create a proof for, represented as a 64-character hexadecimal string, prepended with "resource_".
   * @returns The current instance of the Builder, allowing for method chaining.
   */
  createProof(account: ComponentAddress, resourceAddress: ResourceAddress): this;
  /**
   * Creates a variable in the workspace to store the output of the last instruction, which can be used later in the transaction.
   * @param key - The name of the variable to save the last instruction's output to.
   * @returns The current instance of the Builder, allowing for method chaining.
   * @remarks
   * Must be used after an instruction that produces an output, such as a function call or method call, and before any subsequent instructions that may use the saved variable.
   */
  saveVar(key: string): this;

  /**
   * Calls a method to remove all proofs in the current workspace.
   * @returns The current instance of the Builder, allowing for method chaining.
   * @remarks
   * Any proof references saved in the workspace via saveVar will be removed, invalidating any subsequent instructions that call on the variable.
   */
  dropAllProofsInWorkspace(): this;

  /**
  * Adds a `ClaimBurn` instruction to the transaction, allowing the user to claim a previously burned confidential output.
  *
  * @param claim - A {@link ConfidentialClaim} object containing cryptographic proofs that authorize the claim. This includes the burn output address, ownership proof, range proof, and optional withdraw proof.
  * @returns The current instance of the Builder, enabling method chaining.
  * @remarks
  * - The `ConfidentialClaim` must be constructed off-chain using valid cryptographic data.
  * - If `withdraw_proof` is required by the burn process, it must be included.
  * - This method should be used only when recovering burned confidential resources.
  */
  claimBurn(claim: ConfidentialClaim): this;


  addInput(inputObject: SubstateRequirement): this;
  /** Adds a raw instruction to the transaction.
   *
   * @param instruction - A fully-formed {@link Instruction} object, such as `CreateAccount`, `CallMethod`, `ClaimBurn`, etc.
   *
   * @returns The current instance of the Builder for method chaining.
   *
   * @remarks
   * This method allows advanced or low-level access to the instruction set used in the Tari transaction engine.
   * It should typically be used when:
   * - A specific instruction is not exposed via a dedicated builder method (e.g. `EmitLog`, `ClaimValidatorFees`)
   * - You need to construct instructions dynamically at runtime (e.g. from config files or user input)
   * - You require more control over optional fields not exposed in convenience methods (e.g. custom `owner_rule`)
   * - You are working with experimental or less-common instructions
   *
   * For common operations like creating accounts or calling methods, prefer high-level builder methods
   * such as `createAccount()` or `callMethod()` for better readability and type safety.
   */
  addInstruction(instruction: Instruction): this;

  addFeeInstruction(instruction: Instruction): this;

  /**
  * Allows for the addition of a condition to the transaction that requires the minimum epoch in which the transaction can be executed. Transaction fails if executed before this epoch.
  * @param minEpoch - The minimum epoch in which the transaction can be executed. If not set, the transaction can be executed in any epoch.
  * @returns The current instance of the Builder, allowing for method chaining.
  */
  withMinEpoch(minEpoch: number): this;

  /**
   * Allows for the addition of a condition to the transaction that requires the maximum epoch in which the transaction can be executed. Transaction fails if executed after this epoch.
   * @param maxEpoch - The maximum epoch in which the transaction can be executed. If not set, the transaction can be executed in any epoch.
   * @returns The current instance of the Builder, allowing for method chaining.
   */
  withMaxEpoch(maxEpoch: number): this;

  /**
   * Adds a substate requirement to the transaction, which is used to specify the inputs required for the transaction.
   * @param inputs - An array of {@link SubstateRequirement} objects that define the inputs required for the transaction, consisting of substate IDs and optional versions. Typically, null version is used to indicate that any version of the substate is acceptable.
   * @returns The current instance of the Builder, allowing for method
   */

  withInputs(inputs: SubstateRequirement[]): this;

  /**
   * Similar to {@link addInstruction}, but allows for adding multiple instructions at once.
   * @param instructions - An array of {@link Instruction} objects to add to the transaction. These instructions will be executed in the order they are added.
   * @returns The current instance of the Builder, allowing for method chaining.
   */

  withInstructions(instructions: Instruction[]): this;

  /**
   * Similar to {@link addFeeInstruction}, but allows for adding multiple fee instructions at once.
   * This is useful for complex transactions that require multiple fee instructions.
   * @param instructions - An array of {@link Instruction} objects to add as fee instructions. These instructions will be executed in the order they are added.
   * @returns The current instance of the Builder, allowing for method chaining.
   */
  withFeeInstructions(instructions: Instruction[]): this;

  withFeeInstructionsBuilder(builder: (builder: TransactionBuilder) => this): this;
  /**
   * Allows for setting an existing unsigned transaction to build upon. This is useful for modifying or extending an existing unsigned transaction.
   * @param unsignedTransaction - An {@link UnsignedTransactionV1} object representing the base transaction to build upon.
   * @returns The current instance of the Builder, allowing for method chaining.
   * @remarks
   * Using withUnsignedTransaction() overwrites the builder’s current unsigned transaction state with the provided one.
   * It allows for more flexible workflows where unsigned transactions can be passed around, saved, and then further edited.
   */
  withUnsignedTransaction(unsignedTransaction: UnsignedTransactionV1): this;

  /**
   * Adds a method for specifying the account that will pay the transaction fee.
   * This method allows the transaction to pay fees from a component's account, rather than the transaction sender's account.
   * @param componentAddress
   * @param maxFee
   * @remarks
   * - The component must have a method `take_fee` that returns a Bucket containing the revealed confidential XTR resource.
   * - The fee instruction will lock up the `maxFee` amount for the duration of the transaction.
   */
  feeTransactionPayFromComponent(componentAddress: ComponentAddress, maxFee: string): this;
  /**
   * Similar to {@link feeTransactionPayFromComponent}, but allows for paying the transaction fee using a confidential withdraw proof.
   * This method allows the transaction to pay fees from a component's account, rather than the transaction sender's account.
   * @param componentAddress -  The address of the component from which to pay the fee, represented as a 64-character hexadecimal string, optionally prefixed by "component_".
   * @param proof - A {@link ConfidentialWithdrawProof} object containing the necessary cryptographic proofs to authorize the fee payment.
   */
  feeTransactionPayFromComponentConfidential(
    componentAddress: ComponentAddress,
    proof: ConfidentialWithdrawProof,
  ): this;

  buildUnsignedTransaction(): UnsignedTransactionV1;

  build(): Transaction;
}

export class TransactionBuilder implements Builder {
  private unsignedTransaction: UnsignedTransactionV1;
  private signatures: TransactionSignature[];
  private allocatedIds: Map<string, number>;
  private current_id: number;

  constructor(network: number) {
    this.unsignedTransaction = {
      network,
      fee_instructions: [],
      instructions: [],
      inputs: [],
      min_epoch: null,
      max_epoch: null,
      dry_run: false,
      is_seal_signer_authorized: false,
    };
    this.signatures = [];
    this.allocatedIds = new Map();
    this.current_id = 0;
  }

  public callFunction<T extends TariFunctionDefinition>(func: T, args: Exclude<T["args"], undefined>): this {
    const resolvedArgs = this.resolveArgs(args);
    return this.addInstruction({
      CallFunction: {
        address: func.templateAddress,
        function: func.functionName,
        args: resolvedArgs,
      },
    });
  }

  public callMethod<T extends TariMethodDefinition>(method: T, args: Exclude<T["args"], undefined>): this {
    const call = method.componentAddress ?
      { Address: method.componentAddress } :
      // NOTE: offset IDs are not supported for method calls
      { Workspace: this.getNamedId(method.fromWorkspace!)! };
    const resolvedArgs = this.resolveArgs(args);
    return this.addInstruction({
      CallMethod: {
        call,
        method: method.methodName,
        args: resolvedArgs,
      },
    });
  }

  public createAccount(ownerPublicKey: string, workspaceBucket?: string): this {
    const workspace_id = workspaceBucket ?
      this.getOffsetIdFromWorkspaceName(workspaceBucket) :
      null;

    return this.addInstruction({
      CreateAccount: {
        public_key_address: ownerPublicKey,
        owner_rule: null, // Custom owner rule is not set by default
        access_rules: null, // Custom access rules are not set by default
        workspace_id,
      },
    });
  }

  public createProof(account: ComponentAddress, resourceAddress: ResourceAddress): this {
    return this.addInstruction({
      CallMethod: {
        call: { Address: account },
        method: "create_proof_for_resource",
        args: [resourceAddress],
      },
    });
  }

  public claimBurn(claim: ConfidentialClaim): this {
    return this.addInstruction({
      ClaimBurn: {
        claim,
      },
    });
  }

  public allocateAddress(allocatableType: AllocatableAddressType, workspaceId: string): this {
    const workspace_id = this.addNamedId(workspaceId);
    return this.addInstruction({
      AllocateAddress: {
        allocatable_type: allocatableType,
        workspace_id,
      },
    });
  }

  public assertBucketContains(workspaceName: string, resource_address: ResourceAddress, min_amount: Amount): this {
    const key = this.getOffsetIdFromWorkspaceName(workspaceName);
    return this.addInstruction({
      AssertBucketContains: {
        key,
        resource_address,
        min_amount,
      },
    });
  }

  /**
   * The `SaveVar` method replaces
   * `PutLastInstructionOutputOnWorkspace: { key: Array<number> }`
   * to make saving variables easier.
   */
  public saveVar(name: string): this {
    let key = this.addNamedId(name);
    return this.addInstruction({
      PutLastInstructionOutputOnWorkspace: {
        key,
      },
    });
  }

  /**
   * Adds a fee instruction that calls the `take_fee` method on a component.
   * This method must exist and return a Bucket with containing revealed confidential XTR resource.
   * This allows the fee to originate from sources other than the transaction sender's account.
   * The fee instruction will lock up the `max_fee` amount for the duration of the transaction.
   */
  public feeTransactionPayFromComponent(componentAddress: ComponentAddress, maxFee: string): this {
    return this.addFeeInstruction({
      CallMethod: {
        call: { Address: componentAddress },
        method: "pay_fee",
        args: [maxFee],
      },
    });
  }

  /**
   * Adds a fee instruction that calls the `take_fee_confidential` method on a component.
   * This method must exist and return a Bucket with containing revealed confidential XTR resource.
   * This allows the fee to originate from sources other than the transaction sender's account.
   */
  public feeTransactionPayFromComponentConfidential(
    componentAddress: ComponentAddress,
    proof: ConfidentialWithdrawProof,
  ): this {
    return this.addFeeInstruction({
      CallMethod: {
        call: { Address: componentAddress },
        method: "pay_fee_confidential",
        args: [proof],
      },
    });
  }

  public dropAllProofsInWorkspace(): this {
    return this.addInstruction("DropAllProofsInWorkspace");
  }

  public withUnsignedTransaction(unsignedTransaction: UnsignedTransactionV1): this {
    this.unsignedTransaction = unsignedTransaction;
    this.signatures = [];
    return this;
  }

  public withFeeInstructions(instructions: Instruction[]): this {
    this.unsignedTransaction.fee_instructions = instructions;
    this.signatures = [];
    return this;
  }

  public withFeeInstructionsBuilder(builder: (builder: TransactionBuilder) => TransactionBuilder): this {
    const newBuilder = builder(new TransactionBuilder(this.unsignedTransaction.network));
    this.unsignedTransaction.fee_instructions = newBuilder.unsignedTransaction.instructions;
    this.signatures = [];
    return this;
  }

  public addInstruction(instruction: Instruction): this {
    this.unsignedTransaction.instructions.push(instruction);
    this.signatures = [];
    return this;
  }

  public addFeeInstruction(instruction: Instruction): this {
    this.unsignedTransaction.fee_instructions.push(instruction);
    this.signatures = [];
    return this;
  }

  public withInstructions(instructions: Instruction[]): this {
    this.unsignedTransaction.instructions.push(...instructions);
    this.signatures = [];
    return this;
  }

  public addInput(inputObject: SubstateRequirement): this {
    this.unsignedTransaction.inputs.push(inputObject);
    this.signatures = [];
    return this;
  }

  public withInputs(inputs: SubstateRequirement[]): this {
    this.unsignedTransaction.inputs.push(...inputs);
    this.signatures = [];
    return this;
  }

  public withMinEpoch(minEpoch: number): this {
    this.unsignedTransaction.min_epoch = minEpoch;
    // Reset the signatures as they are no longer valid
    this.signatures = [];
    return this;
  }

  public withMaxEpoch(maxEpoch: number): this {
    this.unsignedTransaction.max_epoch = maxEpoch;
    // Reset the signatures as they are no longer valid
    this.signatures = [];
    return this;
  }

  public buildUnsignedTransaction(): UnsignedTransactionV1 {
    return this.unsignedTransaction;
  }

  public build(): Transaction {
    return new TransactionRequest(this.buildUnsignedTransaction(), this.signatures);
  }

  private addNamedId(name: string): number {
    const id = this.current_id;
    this.allocatedIds.set(name, id);
    this.current_id += 1;
    return id;
  }

  private getNamedId(name: string): number | undefined {
    return this.allocatedIds.get(name);
  }

  private getOffsetIdFromWorkspaceName(name: string): WorkspaceOffsetId {
    const parsed = parseWorkspaceStringKey(name);
    const id = this.getNamedId(parsed.name);
    if (id === undefined) {
      throw new Error(`No workspace with name ${parsed.name} found`);
    }
    return { id, offset: parsed.offset };
  }

  private resolveArgs(args: NamedArg[]): TransactionArg[] {
    return args.map((arg) => {
      if (typeof arg === "object" && "Workspace" in arg) {
        const workspaceId = this.getOffsetIdFromWorkspaceName(arg.Workspace);
        return { Workspace: workspaceId };
      }
      return arg;
    });
  }

}
