# indexer-explorer

Browse on-chain substates using the Ootle indexer REST API. No wallet or signing required — this is a pure read example.

## What it demonstrates

- Connecting to an indexer with `IndexerProvider`
- Looking up a specific substate by ID
- Listing recent substates with type badges
- The `useIndexer` React hook pattern

## Prerequisites

No local services needed. The example defaults to the **public Igor testnet indexer**.

| Network | Indexer URL |
|---------|------------|
| Igor testnet (public) | `http://18.217.22.26:12502` |
| Local dev | `http://localhost:18300` |

To run a local indexer, see the [tari-ootle releases](https://github.com/tari-project/tari-ootle/releases).

## Run the example

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

The public Igor testnet URL and network are pre-filled — just click **Connect to Indexer**.

## Key files

| File | Purpose |
|------|---------|
| `src/hooks/useIndexer.ts` | Wraps `IndexerProvider`, exposes `getSubstate` and `listSubstates` |
| `src/App.tsx` | Connect form, substate lookup panel, recent substates list |

## Learn more

- [Ootle docs](https://ootle.tari.com)
- [Indexer API reference](https://ootle.tari.com/indexer/indexer-api.html)
- [`@tari-project/ootle-indexer`](../../packages/ootle-indexer/)
