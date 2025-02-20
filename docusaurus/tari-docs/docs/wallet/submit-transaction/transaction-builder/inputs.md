---
sidebar_position: 6
---

# Inputs

Inputs are required substates for a transaction. Supplying these helps to assign transactions to correct shards in consensus.

A required substate has one of the following types:

- Component
- Resource
- Vault
- UnclaimedConfidentialOutput
- NonFungible
- NonFungibleIndex
- TransactionReceipt
- Template
- ValidatorFeePool


```js
builder = builder.withInputs([{ substateId: { Component: account.address } }]);
```
