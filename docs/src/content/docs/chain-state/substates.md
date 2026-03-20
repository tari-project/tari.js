---
title: Substates
description: Query on-chain substates via the provider.
---

Substates are the fundamental storage units on the Ootle network — components, vaults, resources, and more. The `Provider` interface exposes methods to read them.

## Get a single substate

```ts
const substate = await provider.getSubstate("component_0x…");
console.log(substate);
```

Returns an `IndexerGetSubstateResponse` with the substate data and version.

## Fetch multiple substates

```ts
const substates = await provider.fetchSubstates([
  "component_0x…",
  "vault_0x…",
]);
```

## List substates

Query substates by type with pagination:

```ts
const result = await provider.listSubstates({
  filterByType: "Component",
  limit: 50,
  offset: 0,
});

for (const item of result.substates) {
  console.log(item.substate_id, item.version);
}
```

### Substate types

The `filterByType` parameter accepts these values:

- `Component`
- `Resource`
- `Vault`
- `UnclaimedConfidentialOutput`
- `NonFungible`
- `NonFungibleIndex`
- `TransactionReceipt`
- `Template`
- `ValidatorFeePool`

## Get a transaction result

After submitting a transaction, you can poll for its result:

```ts
const result = await provider.getTransactionResult(transactionId);
```

This is used internally by `watchTransaction`, but you can call it directly for custom polling logic.
