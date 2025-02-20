---
sidebar_position: 2
---

# Internals of a Transaction Request

A Transaction Request has the following parts:

- `network`: The ID of the network (e.g., LocalNet, NextNet, Igor) on which this request is expected to be executed.
- `accountId`: The ID of the account in which the transaction will be executed.
- `feeInstructions`: Instructions describing where to obtain funds to cover transaction costs.
- `instructions`: The core of the Transaction Request—the instructions to be executed.
- `inputs`: Substates involved in the transaction. Supplying these helps assign transactions to the correct shards in consensus.
- `minEpoch` and `maxEpoch`: Required epoch bounds for execution. These are optional.
- `is_dry_run`: If `true`, the transaction will be validated but not submitted.
- `is_seal_signer_authorized`: If `true`, the wallet's public key will be used; otherwise, the first signature of the transaction is used as the "default" owner.
- `detect_inputs_use_unversioned`: If `true`, dependent substates will skip the version check.

Most of these parts are covered by the *Transaction Builder*; the rest are filled by `buildTransactionRequest`.
 
