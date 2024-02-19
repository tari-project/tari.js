
export type SubstateRequirement = {
    address: string,
    version?: number | null,
};

export type TransactionSubmitRequest = {
    account_id: number,
    instructions: object[],
    fee_instructions: object[],
    inputs: object[],
    input_refs: object[],
    required_substates: SubstateRequirement[],
    is_dry_run: boolean,
    min_epoch: number | null,
    max_epoch: number | null,
};

export type TransactionSubmitResponse = {
    transaction_id: string;
};


export type TransactionResult = {
    transaction_id: string;
    status: TransactionStatus;
    result: object | null;
};

export enum TransactionStatus {
    New,
    DryRun,
    Pending,
    Accepted,
    Rejected,
    InvalidTransaction,
    OnlyFeeAccepted
}

export interface Account {
    account_id: number;
    address: string,
    public_key: string,
    resources: string[],
}