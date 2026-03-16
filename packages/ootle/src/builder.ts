//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type {
  Amount,
  ComponentAddress,
  MinotariBurnClaimProof,
  ClaimBurnOutputData,
  ConfidentialWithdrawProof,
  Instruction,
  InstructionArg,
  ResourceAddress,
  SubstateRequirement,
  UnsignedTransactionV1,
  PublishedTemplateAddress,
  WorkspaceOffsetId,
  AllocatableAddressType,
} from "@tari-project/ootle-ts-bindings";
import { Network } from "./network";
import { parseWorkspaceStringKey } from "./helpers/workspace";

/** A function that can be called on a published template. */
export interface TariFunctionDefinition {
  templateAddress: PublishedTemplateAddress;
  functionName: string;
  args?: NamedArg[];
}

/** A method that can be called on a component. */
export interface TariMethodDefinition {
  methodName: string;
  args?: NamedArg[];
  /** Call by component address. Mutually exclusive with `fromWorkspace`. */
  componentAddress?: ComponentAddress;
  /** Call the component stored under this workspace key. Mutually exclusive with `componentAddress`. */
  fromWorkspace?: string;
}

/**
 * A NamedArg is either:
 * - `{ Workspace: string }` — a named workspace reference resolved by the builder to a numeric ID
 * - `InstructionArg` — a fully-formed `{ Workspace: WorkspaceOffsetId }` or `{ Literal: string }`
 */
export type NamedArg = { Workspace: string } | InstructionArg;

/**
 * Wraps a literal value as an InstructionArg. The string representation is the
 * canonical format accepted by the Tari runtime; for complex types use the WASM
 * encoder to produce a properly BOR-encoded literal.
 */
export function literalArg(value: Amount | string): InstructionArg {
  return { Literal: String(value) };
}

/**
 * Fluent builder for constructing UnsignedTransactionV1 objects.
 *
 * Only `buildUnsignedTransaction()` is exposed — signing is handled separately
 * via the `Signer` interface and `signTransaction` flow function.
 */
export class TransactionBuilder {
  private unsignedTransaction: UnsignedTransactionV1;
  private allocatedIds: Map<string, number>;
  private currentId: number;

  constructor(network: Network | number) {
    this.unsignedTransaction = {
      network: network as number,
      fee_instructions: [],
      instructions: [],
      inputs: [],
      min_epoch: null,
      max_epoch: null,
      dry_run: false,
      is_seal_signer_authorized: false,
    };
    this.allocatedIds = new Map();
    this.currentId = 0;
  }

  public static new(network: Network | number): TransactionBuilder {
    return new TransactionBuilder(network);
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
    const call = method.componentAddress
      ? { Address: method.componentAddress }
      : { Workspace: this.getNamedId(method.fromWorkspace!)! };
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
    const bucket_workspace_id = workspaceBucket ? this.getOffsetIdFromWorkspaceName(workspaceBucket) : null;
    return this.addInstruction({
      CreateAccount: {
        owner_public_key: ownerPublicKey,
        owner_rule: null,
        access_rules: null,
        bucket_workspace_id,
      },
    });
  }

  public createProof(account: ComponentAddress, resourceAddress: ResourceAddress): this {
    return this.addInstruction({
      CallMethod: {
        call: { Address: account },
        method: "create_proof_for_resource",
        args: [{ Literal: resourceAddress }],
      },
    });
  }

  public claimBurn(claim: MinotariBurnClaimProof, output_data: ClaimBurnOutputData): this {
    return this.addInstruction({
      ClaimBurn: { claim, output_data },
    });
  }

  public allocateAddress(allocatableType: AllocatableAddressType, workspaceIdName: string): this {
    const workspace_id = this.addNamedId(workspaceIdName);
    return this.addInstruction({
      AllocateAddress: { allocatable_type: allocatableType, workspace_id },
    });
  }

  /**
   * Saves the last instruction output to a named workspace variable.
   * The variable can be referenced by subsequent instructions using `{ Workspace: "name" }`.
   */
  public saveVar(name: string): this {
    const key = this.addNamedId(name);
    return this.addInstruction({
      PutLastInstructionOutputOnWorkspace: { key },
    });
  }

  /**
   * Adds a fee instruction that calls `pay_fee` on the given component.
   * The component must call `vault.pay_fee` and reveal enough confidential XTR.
   */
  public feeTransactionPayFromComponent(componentAddress: ComponentAddress, maxFee: Amount): this {
    return this.addFeeInstruction({
      CallMethod: {
        call: { Address: componentAddress },
        method: "pay_fee",
        args: [{ Literal: String(maxFee) }],
      },
    });
  }

  /**
   * Like `feeTransactionPayFromComponent` but uses a confidential withdraw proof.
   */
  public feeTransactionPayFromComponentConfidential(
    componentAddress: ComponentAddress,
    proof: ConfidentialWithdrawProof,
  ): this {
    return this.addFeeInstruction({
      CallMethod: {
        call: { Address: componentAddress },
        method: "pay_fee_confidential",
        args: [{ Literal: JSON.stringify(proof) }],
      },
    });
  }

  public dropAllProofsInWorkspace(): this {
    return this.addInstruction("DropAllProofsInWorkspace");
  }

  public addInstruction(instruction: Instruction): this {
    this.unsignedTransaction.instructions.push(instruction);
    return this;
  }

  public addFeeInstruction(instruction: Instruction): this {
    this.unsignedTransaction.fee_instructions.push(instruction);
    return this;
  }

  public withInstructions(instructions: Instruction[]): this {
    this.unsignedTransaction.instructions.push(...instructions);
    return this;
  }

  public withFeeInstructions(instructions: Instruction[]): this {
    this.unsignedTransaction.fee_instructions = instructions;
    return this;
  }

  public withFeeInstructionsBuilder(builder: (b: TransactionBuilder) => TransactionBuilder): this {
    const inner = builder(new TransactionBuilder(this.unsignedTransaction.network));
    this.unsignedTransaction.fee_instructions = inner.unsignedTransaction.instructions;
    return this;
  }

  public addInput(input: SubstateRequirement): this {
    this.unsignedTransaction.inputs.push(input);
    return this;
  }

  public withInputs(inputs: SubstateRequirement[]): this {
    this.unsignedTransaction.inputs.push(...inputs);
    return this;
  }

  public withMinEpoch(minEpoch: number): this {
    this.unsignedTransaction.min_epoch = minEpoch;
    return this;
  }

  public withMaxEpoch(maxEpoch: number): this {
    this.unsignedTransaction.max_epoch = maxEpoch;
    return this;
  }

  public withUnsignedTransaction(unsignedTransaction: UnsignedTransactionV1): this {
    this.unsignedTransaction = unsignedTransaction;
    return this;
  }

  public buildUnsignedTransaction(): UnsignedTransactionV1 {
    return this.unsignedTransaction;
  }

  // Internal helpers

  private addNamedId(name: string): number {
    const id = this.currentId;
    this.allocatedIds.set(name, id);
    this.currentId += 1;
    return id;
  }

  private getNamedId(name: string): number | undefined {
    return this.allocatedIds.get(name);
  }

  private getOffsetIdFromWorkspaceName(name: string): WorkspaceOffsetId {
    const parsed = parseWorkspaceStringKey(name);
    const id = this.getNamedId(parsed.name);
    if (id === undefined) {
      throw new Error(`No workspace variable named "${parsed.name}" has been defined`);
    }
    return { id, offset: parsed.offset };
  }

  private resolveArgs(args: NamedArg[]): InstructionArg[] {
    return args.map((arg): InstructionArg => {
      if (typeof arg === "object" && arg !== null && "Workspace" in arg && typeof (arg as { Workspace: unknown }).Workspace === "string") {
        const workspaceId = this.getOffsetIdFromWorkspaceName((arg as { Workspace: string }).Workspace);
        return { Workspace: workspaceId };
      }
      return arg as InstructionArg;
    });
  }
}
