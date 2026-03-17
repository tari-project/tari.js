# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages
moon :build

# Test all packages
moon :test

# Test a single package (from repo root)
pnpm --filter @tari-project/ootle run test

# Run vitest in watch mode for a package
cd packages/ootle && pnpm vitest

# Lint all packages
pnpm lint

# Check for unused dependencies
pnpm knip

# Generate API docs
pnpm docs

# Clean everything
./scripts/clean_everything.sh
```

## Architecture

This is a pnpm monorepo using [Moon](https://moonrepo.dev) for build orchestration. The SDK targets the Tari Ootle network (a UTXO + smart contract L2).

### Package dependency graph

```
@tari-project/ootle-ts-bindings  (Rust FFI — external, not in this repo)
         ↑
@tari-project/ootle-wasm          defines OotleWasm interface + TransactionEncoder factory
         ↑
@tari-project/ootle               core: builder, transaction types, provider/signer interfaces, OotleWallet
    ↑               ↑                  ↑
ootle-indexer   ootle-secret-key-wallet   ootle-wallet-daemon-signer
(REST provider) (in-memory signer,         (JSON-RPC signer,
                 for testing)               for production)
```

### Key abstractions in `packages/ootle`

- **Provider** (`provider.ts`) — read-only chain access (substates, templates, fees). Implemented by `ootle-indexer`.
- **Signer** (`signer.ts`) — signs transactions, derives public keys. Implemented by the two wallet packages.
- **TransactionBuilder** (`builder.ts`) — fluent API for constructing Tari transactions. Returns a new builder on each call (immutable pattern).
- **OotleWallet** (`wallet.ts`) — combines one or more signers with a provider; the primary entry point for end users.
- **Stealth transfers** (`stealth*.ts`) — privacy-preserving output helpers.
- **Builtin templates** (`templates/`) — typed helpers for Account and Faucet.

### Signers

| Package | Class | Use case |
|---|---|---|
| `ootle-secret-key-wallet` | `SecretKeyWallet` | Holds raw secret key in JS memory — testing only |
| `ootle-secret-key-wallet` | `EphemeralKeySigner` | One-shot throwaway key |
| `ootle-wallet-daemon-signer` | `WalletDaemonSigner` | Delegates to `tari_ootle_walletd` process — production |

### WASM crypto

`ootle-wasm` defines the `OotleWasm` interface (generateKeypair, derivePublicKey, schnorrSign, borEncodeTransaction, hashUnsignedTransaction). The actual WASM binary comes from `@tari-project/ootle-ts-bindings` and is injected at runtime — `ootle-wasm` itself has no runtime dependency on it.

### Transaction flow

1. Build instruction set via `TransactionBuilder`
2. `ootle-indexer` resolves any `want-input` lazy inputs against the indexer REST API
3. WASM encodes and hashes the unsigned transaction (BOR serialization)
4. Signer produces a Schnorr signature
5. Signed transaction is submitted; `TransactionWatcher` polls/streams for finality

### Examples and docs

- `examples/` — React 19 + Vite demo apps (connect-button, indexer-explorer, template-inspector)
- `docusaurus/tari-docs/` — public documentation site
- `tsdocs/` — generated TypeDoc API reference

## Toolchain

- Node ≥ 22, pnpm 10, Moon 1.40.5 (versions pinned in `.prototools`)
- TypeScript strict mode, ES2022 target, ESNext modules, `"moduleResolution": "bundler"`
- ESLint flat config (`eslint.config.mjs`), Prettier (120-col, double quotes, trailing commas)
- Vitest for all package tests
