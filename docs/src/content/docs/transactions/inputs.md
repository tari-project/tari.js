---
title: Inputs
description: Declare required substates for a transaction.
---

Inputs are substate requirements that help the network assign transactions to the correct shards in consensus. You can supply exact versions or let `resolveTransaction` fill them in.

## Add inputs manually

```ts
// Single input with a known version
builder.addInput({ substate_id: vaultId, version: 3 });

// Multiple inputs
builder.withInputs([
  { substate_id: componentId, version: null },
  { substate_id: vaultId, version: 5 },
]);
```

When `version` is `null`, `resolveTransaction` queries the provider to fill in the current version before signing.

## WantInput and resolveWantInputs

For more complex input resolution, the indexer package provides `resolveWantInputs`:

```ts
import { resolveWantInputs } from "@tari-project/ootle-indexer";
import type { WantInput } from "@tari-project/ootle-indexer";

const wants: WantInput[] = [
  { type: "SpecificSubstate", substateId: "component_0x…" },
  { type: "VaultForResource", resourceAddress: "resource_0x…" },
];

const inputs = await resolveWantInputs(provider.getClient(), wants);
// inputs: SubstateRequirement[] with versions filled in

builder.withInputs(inputs);
```

`VaultForResource` is useful when you know which resource you need but not which vault holds it — the indexer resolves the vault address for you.
