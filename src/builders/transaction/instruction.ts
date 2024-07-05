interface CreateAccountInstruction {
  ownerPublicKey: string;
  workspaceBucket?: string | null;
}

interface CallFunctionInstruction {
  templateAddress: Uint8Array;
  function: string;
  args: any[];
}

interface CallMethodInstruction {
  componentAddress: string;
  method: string;
  args: any[];
}

interface PutLastInstructionOutputOnWorkspaceInstruction {
  key: Uint8Array;
}

interface EmitLogInstruction {
  level: LogLevel;
  message: string;
}

interface ClaimBurnInstruction {
  claim: any; // TODO add type ConfidentialClaim;
}

interface ClaimValidatorFeesInstruction {
  epoch: number;
  validatorPublicKey: string;
}

interface DropAllProofsInWorkspaceInstruction {
  // no properties
}

interface CreateFreeTestCoinsInstruction {
  revealedAmount: number; //TODO add Amount type
  output?: any; //TODO add type ConfidentialOutput;
}

// export interface CallMethod {
//   componentAddress: string;
//   method: string;
//   args: string[];
// }
enum LogLevel {
  Error,
  Warn,
  Info,
  Debug,
}

export enum Instruction {
  CreateAccount,
  CallFunction,
  CallMethod,
  PutLastInstructionOutputOnWorkspace,
  EmitLog,
  ClaimBurn,
  ClaimValidatorFees,
  DropAllProofsInWorkspace,
  CreateFreeTestCoins,
}

export type InstructionType =
  | CreateAccountInstruction
  | CallFunctionInstruction
  | CallMethodInstruction
  | PutLastInstructionOutputOnWorkspaceInstruction
  | EmitLogInstruction
  | ClaimBurnInstruction
  | ClaimValidatorFeesInstruction
  | DropAllProofsInWorkspaceInstruction
  | CreateFreeTestCoinsInstruction;
