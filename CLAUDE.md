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
@tari-project/ootle-ts-bindings  (Rust FFI types — external npm package)
@tari-project/ootle-wasm          (WASM crypto functions — external npm package)
         ↑               ↑
@tari-project/ootle               core: builder, transaction types, provider/signer interfaces, OotleWallet
    ↑               ↑                  ↑
ootle-indexer   ootle-secret-key-wallet   ootle-wallet-daemon-signer
(REST provider) (in-memory signer,         (JSON-RPC signer,
                 for testing)               for production)
```

### Key abstractions in `packages/ootle`

- **Provider** (`provider.ts`) — read-only chain access (substates, templates, fees). Implemented by `ootle-indexer`.
- **Signer** (`signer.ts`) — signs transactions, derives public keys. Implemented by the two wallet packages.
- **TransactionBuilder** (`builder.ts`) — fluent API for constructing Tari transactions (mutable `this`-returning pattern).
- **OotleWallet** (`wallet.ts`) — combines one or more signers with a provider; the primary entry point for end users.
- **Stealth transfers** (`stealth*.ts`) — privacy-preserving output helpers.
- **Builtin templates** (`builtin-templates.ts`) — typed helpers for Account and Faucet.

### Signers

| Package | Class | Use case |
|---|---|---|
| `ootle-secret-key-wallet` | `SecretKeyWallet` | Holds raw secret key in JS memory — testing only |
| `ootle-secret-key-wallet` | `EphemeralKeySigner` | One-shot throwaway key |
| `ootle-wallet-daemon-signer` | `WalletDaemonSigner` | Delegates to `tari_ootle_walletd` process — production |

### WASM crypto

`@tari-project/ootle-wasm` is an external npm package that provides WASM-backed crypto functions: `generateKeypair`, `publicKeyFromSecretKey`, `schnorrSign`, `hashUnsignedTransaction`, `borEncodeTransaction`. These are called internally by `signTransaction` (in `ootle/src/transaction.ts`) and by the `SecretKeyWallet` / `EphemeralKeySigner` classes. Users do not need to manage a WASM module — the functions are imported directly.

`@tari-project/ootle-ts-bindings` provides Rust FFI type definitions (e.g. `UnsignedTransactionV1`, `TransactionSignature`, `Instruction`) used throughout the SDK for type safety.

### Transaction flow

1. Build instruction set via `TransactionBuilder` → `UnsignedTransactionV1`
2. `resolveTransaction` fills in substate versions via the provider
3. `signTransaction` generates a seal keypair, collects Schnorr signatures from all signers, and assembles a full `Transaction`
4. `submitTransaction` BOR-encodes (via `borEncodeTransaction`) and submits the signed transaction
5. `watchTransaction` polls/streams for finality via `TransactionWatcher`

`sendTransaction` chains all of steps 2–5 in one call.

### Examples and docs

- `examples/` — React 19 + Vite demo apps (connect-button, indexer-explorer, template-inspector)
- `docusaurus/tari-docs/` — public documentation site
- `tsdocs/` — generated TypeDoc API reference

## Toolchain

- Node ≥ 22, pnpm 10, Moon 1.40.5 (versions pinned in `.prototools`)
- TypeScript strict mode, ES2022 target, ESNext modules, `"moduleResolution": "bundler"`
- ESLint flat config (`eslint.config.mjs`), Prettier (120-col, double quotes, trailing commas)
- Vitest for all package tests
