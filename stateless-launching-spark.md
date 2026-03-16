# Plan: Rewrite tari.js (ootle-js)

## Context

tari.js is broken — the core `TariSigner` interface mixes reading, signing, and submitting into one interface, making it unmaintainable. The goal is a clean rewrite modeled after `ootle-rs` (Rust) with inspiration from ethers.js/viem's Provider/Signer separation.

This is a from-scratch rewrite in a new repo/branch. Old packages are not a concern.

## Design Inspiration

| Library | Key Pattern Adopted |
|---------|-------------------|
| **ootle-rs** | Provider + NetworkWallet + ProviderBuilder, want-list input resolution |
| **ethers.js** | Provider (read) vs Signer (write) separation |
| **viem** | Explicit prepare → sign → send flow, Transport abstraction |
| **solana web3.js v2** | Functional composition, factory functions, minimal deps |

## Key Technical Discovery: BOR Encoding

The indexer REST API does NOT accept raw JSON transactions. It expects a `TransactionEnvelope` — a BOR-encoded (CBOR via ciborium + CBOR tags), base64-encoded string.

**Flow**: `Transaction` object → CBOR encode (matching Rust's serde/ciborium) → base64 → submit as string

**Decision**: Use a WASM module compiled from Rust for:
1. BOR encoding (`Transaction` → `TransactionEnvelope`)
2. Transaction hashing (for signing — must match Rust's canonical hash)
3. Schnorr signing on Ristretto255

This single WASM module (`@tari-project/ootle-wasm`) handles all crypto/encoding that must be byte-identical to Rust.

## Architecture

```
┌──────────────────────────────────────────────────┐
│                @tari-project/ootle                │
│  Signer interface, Provider interface,           │
│  TransactionBuilder, transaction flow functions  │
│  Dep: @tari-project/ootle-ts-bindings            │
└────────┬──────────────┬──────────────┬───────────┘
         │              │              │
┌────────▼───────┐ ┌────▼──────────┐ ┌▼──────────────────────┐
│ ootle-indexer  │ │ ootle-wasm    │ │ ootle-wallet-daemon-  │
│ (Provider impl)│ │ (Rust→WASM)   │ │  signer (Signer impl) │
│ Dep: ootle     │ │ BOR encode,   │ │ Delegates to daemon   │
│                │ │ sign, hash    │ │ Dep: ootle            │
└────────────────┘ └───────┬───────┘ └───────────────────────┘
                           │
                   ┌───────▼────────────────┐
                   │ ootle-secret-key-wallet │
                   │ (Signer impl)          │
                   │ Dep: ootle, ootle-wasm  │
                   └────────────────────────┘
```

## Bindings

Use `@tari-project/ootle-ts-bindings` (v1.29.3) from `~/Repos/localnet/ootle/bindings` — NOT the old `@tari-project/typescript-bindings`.

Key types from bindings:
- `UnsignedTransactionV1`, `Transaction`, `TransactionV1`, `UnsealedTransactionV1`
- `TransactionSignature`, `TransactionSealSignature`
- `Instruction`, `InstructionArg`, `SubstateRequirement`
- `TransactionEnvelope` (= `string`, BOR+base64 encoded)
- `IndexerSubmitTransactionRequest` (`{ transaction: TransactionEnvelope }`)
- `IndexerGetSubstateRequest/Response`, `IndexerGetTransactionResultResponse`
- `IndexerTransactionFinalizedResult`, `Decision`, `ExecuteResult`, `FinalizeResult`

## Phase 1: Core Interfaces + Transaction Flow

### Package: `@tari-project/ootle`

#### 1.1 `src/signer.ts` — Signer Interface

```typescript
interface Signer {
  getAddress(): Promise<string>;
  getPublicKey(): Promise<string>;
  signTransaction(transaction: UnsignedTransactionV1): Promise<TransactionSignature[]>;
}
```

Minimal. No reads, no submits. Just signing.

#### 1.2 `src/provider.ts` — Provider Interface

```typescript
interface Provider {
  network(): Network;
  getSubstate(substateId: string, version?: number | null): Promise<IndexerGetSubstateResponse>;
  fetchSubstates(requests: SubstateId[]): Promise<GetSubstatesResponse>;
  getTemplateDefinition(templateAddress: string): Promise<TemplatesGetResponse>;
  submitTransaction(envelope: TransactionEnvelope): Promise<IndexerSubmitTransactionResponse>;
  getTransactionResult(transactionId: string): Promise<IndexerGetTransactionResultResponse>;
  resolveInputs(inputs: SubstateRequirement[]): Promise<SubstateRequirement[]>;
  listSubstates(params: ListSubstatesRequest): Promise<ListSubstatesResponse>;
}
```

Note: `submitTransaction` takes `TransactionEnvelope` (already BOR+base64 encoded string), NOT a raw `Transaction` object. Encoding happens in the transaction flow functions.

#### 1.3 `src/transaction.ts` — Transaction Flow Functions

```typescript
// Encoding — requires WASM or an encoder
interface TransactionEncoder {
  encode(transaction: Transaction): TransactionEnvelope;
  hashForSigning(unsignedTx: UnsignedTransactionV1): Uint8Array;
}

// Step-by-step
async function resolveTransaction(provider: Provider, unsignedTx: UnsignedTransactionV1): Promise<UnsignedTransactionV1>;
async function signTransaction(signers: Signer[], unsignedTx: UnsignedTransactionV1): Promise<Transaction>;
async function encodeTransaction(encoder: TransactionEncoder, transaction: Transaction): TransactionEnvelope;
async function submitTransaction(provider: Provider, envelope: TransactionEnvelope): Promise<string>;
async function watchTransaction(provider: Provider, txId: string, opts?: WatchOptions): Promise<IndexerGetTransactionResultResponse>;

// All-in-one convenience
async function sendTransaction(
  provider: Provider,
  signer: Signer,
  encoder: TransactionEncoder,
  unsignedTx: UnsignedTransactionV1,
): Promise<IndexerGetTransactionResultResponse>;
```

#### 1.4 `src/builder.ts` — TransactionBuilder

Adapt from existing `packages/builders/src/transaction/TransactionBuilder.ts`:
- Only expose `buildUnsignedTransaction()` — remove `build()` that returns signed `Transaction`
- Keep fluent API: `callFunction()`, `callMethod()`, `feeTransactionPayFromComponent()`, etc.
- Copy helpers: `parseWorkspaceStringKey`, `NamedArg`
- Update types to use `@tari-project/ootle-ts-bindings`

#### 1.5 `src/network.ts` — Network Enum

Define locally (simple enum matching Rust network byte values).

### File Structure (Phase 1)

```
packages/ootle/
  package.json              # deps: @tari-project/ootle-ts-bindings
  tsconfig.json
  src/
    index.ts                # Public API exports
    signer.ts               # Signer interface
    provider.ts             # Provider interface
    transaction.ts          # resolve/sign/encode/submit/watch/send
    builder.ts              # TransactionBuilder class
    network.ts              # Network enum
    types.ts                # Re-exports + local types (WatchOptions, etc.)
    helpers/
      workspace.ts          # parseWorkspaceStringKey (from existing builders)
```

---

## Phase 2: Implementations

### 2a. Package: `@tari-project/ootle-wasm`

WASM module compiled from Rust. Exposes:

```typescript
// JS interface to WASM exports
function borEncodeTransaction(transactionJson: string): string;  // JSON → TransactionEnvelope (base64)
function hashUnsignedTransaction(unsignedTxJson: string): Uint8Array;  // JSON → hash bytes
function schnorrSign(secretKeyHex: string, message: Uint8Array): { public_nonce: string; signature: string };
function generateKeypair(): { secret_key: string; public_key: string };
function publicKeyToAddress(publicKey: string, network: number): string;  // → component address
```

The WASM Rust crate would depend on `tari_bor`, `tari_ootle_transaction`, `tari_crypto`.

### 2b. Package: `@tari-project/ootle-indexer`

IndexerProvider implements `Provider` using the indexer REST API.

**Reuse from:**
- `~/Repos/localnet/ootle/clients/javascript/indexer_client/` — already updated `IndexerClient` using new bindings
- `~/Repos/localnet/ootle/clients/javascript/indexer_client/src/transports/fetch.ts` — `FetchTransport` / `HttpTransport`

```
packages/ootle-indexer/
  package.json              # deps: @tari-project/ootle, @tari-project/ootle-ts-bindings
  tsconfig.json
  src/
    index.ts
    indexer-provider.ts     # IndexerProvider implements Provider
    transport/
      http-transport.ts     # HttpTransport + FetchTransport (copy from Repos/localnet/ootle/clients)
      indexer-client.ts     # IndexerClient wrapper (copy from Repos/localnet/ootle/clients)
```

The `IndexerProvider` wraps `IndexerClient` and implements:
- `submitTransaction(envelope)` → `client.submitTransaction({ transaction: envelope })`
- `resolveInputs(inputs)` → fetch substates for unversioned inputs, fill in versions
- `getTransactionResult()` → poll indexer REST API

### 2c. Package: `@tari-project/ootle-secret-key-wallet`

Local signing using WASM crypto.

```
packages/ootle-secret-key-wallet/
  package.json              # deps: @tari-project/ootle, @tari-project/ootle-wasm
  tsconfig.json
  src/
    index.ts
    secret-key-wallet.ts    # SecretKeyWallet implements Signer
```

- `SecretKeyWallet.random()` — via WASM `generateKeypair()`
- `SecretKeyWallet.fromSecretKey(hex)` — import existing key
- `signTransaction(unsignedTx)` — WASM: hash tx → Schnorr sign → return `TransactionSignature`

### 2d. Package: `@tari-project/ootle-wallet-daemon-signer`

Delegates signing to a running wallet daemon over HTTP.

```
packages/ootle-wallet-daemon-signer/
  package.json              # deps: @tari-project/ootle
  tsconfig.json
  src/
    index.ts
    wallet-daemon-signer.ts # WalletDaemonSigner implements Signer
```

- Connects to wallet daemon HTTP/JRPC endpoint
- `signTransaction()` sends unsigned tx to daemon, receives signatures back
- Proves the Signer interface is pluggable without WASM

---

## End-to-End Usage (Target DX)

```typescript
import { TransactionBuilder, sendTransaction, Network } from "@tari-project/ootle";
import { IndexerProvider } from "@tari-project/ootle-indexer";
import { SecretKeyWallet } from "@tari-project/ootle-secret-key-wallet";
import { createWasmEncoder } from "@tari-project/ootle-wasm";

// Setup
const encoder = await createWasmEncoder();
const wallet = SecretKeyWallet.random();
const provider = await IndexerProvider.connect({
  url: "http://localhost:18300",
  network: Network.LocalNet,
});

// Build + send
const address = await wallet.getAddress();
const unsignedTx = TransactionBuilder.new(Network.LocalNet)
  .feeTransactionPayFromComponent(address, 1000)
  .callMethod({ methodName: "transfer", componentAddress: address }, [recipient, amount])
  .buildUnsignedTransaction();

const result = await sendTransaction(provider, wallet, encoder, unsignedTx);
```

---

## Implementation Order

1. Scaffold monorepo (pnpm workspace, tsconfig, eslint)
2. `packages/ootle` — interfaces (`signer.ts`, `provider.ts`), types, network enum
3. `packages/ootle` — TransactionBuilder (adapt from existing)
4. `packages/ootle` — transaction flow functions (resolve, sign, encode, submit, watch)
5. `packages/ootle-indexer` — transport layer (copy from `Repos/localnet/ootle/clients/javascript/indexer_client/`)
6. `packages/ootle-indexer` — IndexerProvider implementing Provider
7. `packages/ootle-wasm` — Rust WASM crate (BOR encoding, tx hashing, Schnorr signing, keypair gen)
8. `packages/ootle-secret-key-wallet` — SecretKeyWallet using WASM
9. `packages/ootle-wallet-daemon-signer` — WalletDaemonSigner
10. Integration test: build tx → sign → encode → submit → watch

## Source Files to Reuse

| Source                                                                             | Reuse for |
|------------------------------------------------------------------------------------|-----------|
| `~/Repos/localnet/ootle/clients/javascript/indexer_client/src/index.ts`            | IndexerClient (REST API methods) |
| `~/Repos/localnet/ootle/clients/javascript/indexer_client/src/transports/fetch.ts` | FetchTransport / HttpTransport |
| `~/Repos/tari/tari.js/packages/builders/src/transaction/TransactionBuilder.ts`     | TransactionBuilder (adapt) |
| `~/Repos/tari/tari.js/packages/builders/src/helpers/`                              | parseWorkspaceStringKey, NamedArg |
| `~/Repos/tari/tari.js/packages/indexer_provider/src/provider.ts`                   | Transaction result parsing logic |
| `~/Repos/localnet/ootle/crates/transaction/src/envelope.rs`                        | Reference for BOR encoding in WASM |
| `~/Repos/localnet/ootle/crates/tari_bor/`                                          | BOR = CBOR (ciborium), used in WASM crate |

## Verification

- Unit tests for TransactionBuilder (fluent API, instruction generation)
- Unit tests for transaction flow functions with mock Provider/Signer
- Unit test: WASM BOR encoding matches Rust output (use known test vectors)
- Unit test: WASM Schnorr signing produces valid signatures
- Integration test against local indexer: full tx lifecycle
- Browser compatibility test: verify WASM loads and runs in browser
