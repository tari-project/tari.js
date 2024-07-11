import { Amount } from "./amount";

export enum LogLevel {
  Error,
  Warn,
  Info,
  Debug,
}

export type Instruction =
  | CreateAccount
  | CallFunction
  | CallMethod
  | PutLastInstructionOutputOnWorkspace
  | EmitLog
  | ClaimBurn
  | ClaimValidatorFees
  | DropAllProofsInWorkspace
  | CreateFreeTestCoins;

interface CreateAccount {
  type: "CreateAccount";
  ownerPublicKey: string;
  workspaceBucket?: string | null;
}

interface CallFunction {
  type: "CallFunction";
  templateAddress: string;
  function: string;
  args: Arg[];
}

interface CallMethod {
  type: "CallMethod";
  componentAddress: string;
  method: string;
  args: Arg[];
}

interface PutLastInstructionOutputOnWorkspace {
  type: "PutLastInstructionOutputOnWorkspace";
  key: Uint8Array;
}

interface EmitLog {
  type: "EmitLog";
  level: LogLevel;
  message: string;
}

interface ClaimBurn {
  type: "ClaimBurn";
  claim: any;
}

interface ClaimValidatorFees {
  type: "ClaimValidatorFees";
  epoch: number;
  validatorPublicKey: string;
}

interface DropAllProofsInWorkspace {
  type: "DropAllProofsInWorkspace";
}

interface CreateFreeTestCoins {
  type: "CreateFreeTestCoins";
  revealedAmount: Amount;
  output?: any | null;
}

export type Arg = BigInt | string | number | Amount | boolean | { [key: string]: Arg } | Arg[] | null;
