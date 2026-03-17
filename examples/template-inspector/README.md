# template-inspector

Browse deployed Ootle templates (smart contracts) and inspect their function ABIs. Connects directly to the public Igor testnet — no wallet or signing required.

## What it demonstrates

- Using `IndexerClient` + `FetchTransport` directly (lower-level than `IndexerProvider`)
- Listing cached templates from the indexer
- Fetching a template's full ABI (function names, argument types, return types)
- Rendering structured type information from the network

## Prerequisites

None. The example connects to the public **Igor testnet** indexer out of the box.

| Service | URL |
|---------|-----|
| Igor testnet indexer | `http://18.217.22.26:12502` |

To point at a local indexer instead, change the URL in the UI.

## Run the example

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) — the indexer connects automatically on load.

## Key files

| File | Purpose |
|------|---------|
| `src/hooks/useTemplates.ts` | Fetches template list and individual template ABIs |
| `src/App.tsx` | Template list, search filter, ABI viewer |

## Learn more

- [Ootle template overview](https://ootle.tari.com/guides/template-overview/)
- [Indexer API reference](https://ootle.tari.com/indexer/indexer-api.html)
- [`@tari-project/ootle-indexer`](../../packages/ootle-indexer/)
