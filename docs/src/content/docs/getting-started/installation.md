---
title: Installation
description: Install the ootle.ts SDK packages.
---

ootle.ts is split into focused packages published under the `@tari-project` scope. Install only what you need.

## Core package

Every application needs the core package:

```bash
pnpm add @tari-project/ootle
```

## Add a provider

The provider reads chain state and submits transactions. Currently, the only provider implementation is the indexer:

```bash
pnpm add @tari-project/ootle-indexer
```

## Add a signer

Choose the signer that fits your use case:

### Wallet daemon (production)

Delegates signing to a running `tari_ootle_walletd` process. The secret key never enters JavaScript memory.

```bash
pnpm add @tari-project/ootle-wallet-daemon-signer
```

### Secret key wallet (testing / scripting)

Holds the secret key in JavaScript memory and uses WASM crypto for signing. Not recommended for production.

```bash
pnpm add @tari-project/ootle-secret-key-wallet
```

## Requirements

- Node.js 22 or later
- A bundler that supports ESM (Vite, esbuild, webpack 5+)
- For browser use: the bundler must handle WASM imports from `@tari-project/ootle-wasm`
