---
title: Template Definitions
description: Inspect published template ABIs.
---

Templates are the smart contract definitions published on the Ootle network. You can query the indexer to retrieve a template's ABI — its functions, arguments, and return types.

## Get a template definition

```ts
const template = await provider.getTemplateDefinition(templateAddress);
console.log(template);
```

Returns a `GetTemplateDefinitionResponse` containing the template's function definitions, including parameter types and return types.

## Using the IndexerClient directly

For lower-level access, use `templatesGet` on the `IndexerClient`:

```ts
import { IndexerClient } from "@tari-project/ootle-indexer";

const client = IndexerClient.usingFetchTransport("http://localhost:18300");
const definition = await client.templatesGet(templateAddress);
```

## Browsing templates

The `template-inspector` example app (in `examples/template-inspector/`) provides a React UI for browsing all templates cached by the indexer and rendering their function definitions.

```sh
cd examples/template-inspector
pnpm dev
```
