import { ComponentAddress, LogLevel } from "@tariproject/typescript-bindings";
import { Arg } from "./Arg";
import { ConfidentialClaim } from "./ConfidentialClaim";
import { Epoch } from "./Epoch";
import { Amount } from "./Amount";
import { ConfidentialOutput } from "./ConfidentialOutput";

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
  workspaceBucket?: string;
}

interface CallFunction {
  type: "CallFunction";
  templateAddress: string;
  function: string;
  args: Arg[];
}

interface CallMethod {
  type: "CallMethod";
  componentAddress: ComponentAddress;
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
  claim: ConfidentialClaim;
}

interface ClaimValidatorFees {
  type: "ClaimValidatorFees";
  epoch: Epoch;
  validatorPublicKey: string;
}

interface DropAllProofsInWorkspace {
  type: "DropAllProofsInWorkspace";
}

interface CreateFreeTestCoins {
  type: "CreateFreeTestCoins";
  revealedAmount: Amount;
  output?: ConfidentialOutput;
}
