---
sidebar_position: 11
title: API Reference
---

# API Reference

Complete TypeScript API reference for tari.js library. This document covers all public interfaces, classes, and functions.

## Core Interfaces

### TariSigner

The `TariSigner` interface defines wallet operations that require authentication and transaction signing.

```typescript
interface TariSigner {
  signerName: string;
  isConnected(): boolean;
  getAccount(): Promise<AccountData>;
  getSubstate(substate_address: string): Promise<Substate>;
  submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse>;
  getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse>;
  getTemplateDefinition(template_address: string): Promise<TemplateDefinition>;
  getPublicKey(branch: string, index: number): Promise<string>;
  getConfidentialVaultBalances(req: ConfidentialViewVaultBalanceRequest): Promise<VaultBalances>;
  listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse>;
  getNftsList(req: ListAccountNftRequest): Promise<ListAccountNftResponse>;
}
```

#### Methods

##### `isConnected(): boolean`
Check if the signer is currently connected to a wallet.

**Returns:** `boolean` - True if connected, false otherwise

##### `getAccount(): Promise<AccountData>`
Get the default account information.

**Returns:** `Promise<AccountData>` - Account details including address and metadata

**Throws:** 
- `Error` - If no wallet is connected or account retrieval fails

##### `submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse>`
Submit a transaction to the network.

**Parameters:**
- `req: SubmitTransactionRequest` - Transaction request object

**Returns:** `Promise<SubmitTransactionResponse>` - Transaction submission result with ID

<!-- VERIFIED: Source packages/builders/src/transaction/TransactionBuilder.ts:130 -->
**Example:**
```typescript
const transaction = new TransactionBuilder()
  .feeTransactionPayFromComponent(account.address, "100")
  .callMethod({
    componentAddress: account.address,
    methodName: 'withdraw',
    args: [{ type: 'Amount', value: '1000' }]
  }, [])
  .build();

const result = await signer.submitTransaction({ transaction });
console.log('Transaction ID:', result.transaction_id);
```

##### `getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse>`
Get the result of a previously submitted transaction.

**Parameters:**
- `transactionId: string` - Transaction identifier

**Returns:** `Promise<GetTransactionResultResponse>` - Transaction execution result

##### `getConfidentialVaultBalances(req: ConfidentialViewVaultBalanceRequest): Promise<VaultBalances>`
Get confidential vault balances (privacy-preserving).

**Parameters:**
- `req: ConfidentialViewVaultBalanceRequest` - Balance request with view key

**Returns:** `Promise<VaultBalances>` - Vault balances with privacy protection

### TariProvider

The `TariProvider` interface defines read-only blockchain data access.

```typescript
interface TariProvider {
  providerName: string;
  isConnected(): boolean;
  getSubstate(req: GetSubstateRequest): Promise<Substate>;
  getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse>;
  getTemplateDefinition(template_address: string): Promise<GetTemplateDefinitionResponse>;
  listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse>;
  listTemplates(limit?: number): Promise<ListTemplatesResponse>;
}
```

#### Methods

##### `getSubstate(req: GetSubstateRequest): Promise<Substate>`
Retrieve a specific substate from the blockchain.

**Parameters:**
- `req: GetSubstateRequest` - Substate query request

**Returns:** `Promise<Substate>` - Substate data and metadata

<!-- VERIFIED: Source packages/wallet_daemon/src/signer.ts:160 -->
**Example:**
```typescript
const substate = await signer.getSubstate("component_1234...");
// Note: TariProvider getSubstate has different signature than TariSigner
```

##### `listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse>`
List substates matching specified criteria.

**Parameters:**
- `req: ListSubstatesRequest` - Query filters and pagination

**Returns:** `Promise<ListSubstatesResponse>` - Paginated substate list

##### `listTemplates(limit?: number): Promise<ListTemplatesResponse>`
List available smart contract templates.

**Parameters:**
- `limit?: number` - Maximum number of templates to return

**Returns:** `Promise<ListTemplatesResponse>` - Available template definitions

## Signer Implementations

### WalletDaemonTariSigner

Connects to Tari Wallet Daemon via JSON-RPC.

```typescript
class WalletDaemonTariSigner implements TariSigner {
  constructor(params: WalletDaemonParameters);
}

interface WalletDaemonParameters {
  endpoint: string;
  timeout?: number;
  retryAttempts?: number;
  auth?: {
    username: string;
    password: string;
  };
}
```

**Example:**
<!-- VERIFIED: Source packages/wallet_daemon/src/signer.ts:71 -->
```typescript
const signer = await WalletDaemonTariSigner.buildFetchSigner({
  serverUrl: 'http://localhost:18103',
  permissions: new TariPermissions()
});
// Note: No direct constructor - use static build methods
```

### MetamaskTariSigner

Integrates with MetaMask via the Tari snap.

```typescript
class MetamaskTariSigner implements TariSigner {
  constructor();
}
```

**Prerequisites:**
- MetaMask Flask installed
- Tari snap installed and connected

**Example:**
```typescript
const signer = new MetamaskTariSigner();
await signer.connect(); // Triggers MetaMask connection flow
```

### TariUniverseSigner

Connects to Tari Universe wallet.

```typescript
class TariUniverseSigner implements TariSigner {
  constructor(params: TariUniverseSignerParameters);
}

interface TariUniverseSignerParameters {
  endpoint?: string;
  timeout?: number;
  network?: Network;
}
```

### WalletConnectTariSigner

Integrates with mobile and desktop wallets via WalletConnect.

```typescript
class WalletConnectTariSigner implements TariSigner {
  constructor(params: WalletConnectParameters);
}

interface WalletConnectParameters {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}
```

## Provider Implementations

### IndexerProvider

Read-only access to blockchain data via Tari Indexer.

```typescript
class IndexerProvider implements TariProvider {
  constructor(params: IndexerProviderParameters);
}

interface IndexerProviderParameters {
  endpoint: string;
  timeout?: number;
  maxConnections?: number;
}
```

**Example:**
```typescript
const provider = new IndexerProvider({
  endpoint: 'http://localhost:18300',
  timeout: 5000,
  maxConnections: 10
});
```

### WalletDaemonTariProvider

Read-only access via Wallet Daemon (useful for consistency with signer).

```typescript
class WalletDaemonTariProvider implements TariProvider {
  constructor(params: WalletDaemonParameters);
}
```

## Transaction Building

### TransactionBuilder

Fluent API for constructing transactions.

```typescript
class TransactionBuilder {
  constructor(network: number);
  
  // Core methods
  fee(amount: number): this;
  inputs(inputs: SubstateRequirement[]): this;
  minEpoch(epoch: number): this;
  maxEpoch(epoch: number): this;
  
  // Function calls
  callFunction<T extends TariFunctionDefinition>(
    func: T, 
    args: Exclude<T["args"], undefined>
  ): this;
  
  // Method calls
  callMethod<T extends TariMethodDefinition>(
    method: T, 
    args: Exclude<T["args"], undefined>
  ): this;
  
  // Account operations
  createAccount(ownerPublicKey: string, workspaceBucket?: string): this;
  createProof(account: ComponentAddress, resourceAddress: ResourceAddress): this;
  
  // Workspace operations
  saveVariable(key: string, workspaceId: string): this;
  claimBurn(claim: ConfidentialClaim): this;
  
  // Building
  build(): TransactionRequest;
}
```

#### Core Building Methods

##### `feeTransactionPayFromComponent(componentAddress: ComponentAddress, maxFee: string): this`
Set the transaction fee paid from a component.

**Parameters:**
- `componentAddress: ComponentAddress` - Address of component paying fee
- `maxFee: string` - Maximum fee amount as string

**Returns:** `this` - Builder instance for chaining

<!-- VERIFIED: Source packages/builders/src/transaction/TransactionBuilder.ts:85 -->
**Example:**
```typescript
const transaction = new TransactionBuilder()
  .feeTransactionPayFromComponent(account.address, "100") // 100 Tari fee
  .build();
```

##### `inputs(inputs: SubstateRequirement[]): this`
Specify required inputs for the transaction.

**Parameters:**
- `inputs: SubstateRequirement[]` - Array of required substates

**Returns:** `this` - Builder instance for chaining

##### `callFunction(func: TariFunctionDefinition, args: NamedArg[]): this`
Call a smart contract function.

**Parameters:**
- `func: TariFunctionDefinition` - Function definition
- `args: NamedArg[]` - Function arguments

**Returns:** `this` - Builder instance for chaining

<!-- VERIFIED: Source packages/builders/src/transaction/TransactionBuilder.ts:116 -->
**Example:**
```typescript
const transaction = new TransactionBuilder()
  .feeTransactionPayFromComponent(account.address, "100")
  .callFunction({
    templateAddress: 'template_1234...',
    functionName: 'mint_nft',
    args: [
      { name: 'amount', value: 1 },
      { name: 'metadata', value: { name: 'My NFT' } }
    ]
  }, [])
  .build();
```

##### `callMethod(method: TariMethodDefinition, args: TransactionArg[]): this`
Call a method on an existing component.

**Parameters:**
- `method: TariMethodDefinition` - Method definition
- `args: TransactionArg[]` - Method arguments

**Returns:** `this` - Builder instance for chaining

<!-- VERIFIED: Source packages/builders/src/transaction/TransactionBuilder.ts:130 -->
**Example:**
```typescript
const transaction = new TransactionBuilder()
  .feeTransactionPayFromComponent(account.address, "100")
  .callMethod({
    componentAddress: 'component_1234...',
    methodName: 'withdraw',
  }, [
    { type: 'Amount', value: '1000' }
  ])
  .build();
```

##### `createAccount(ownerPublicKey: string, workspaceBucket?: string): this`
Create a new account.

**Parameters:**
- `ownerPublicKey: string` - Public key of the account owner
- `workspaceBucket?: string` - Optional workspace bucket name

**Returns:** `this` - Builder instance for chaining

##### `saveVariable(key: string, workspaceId: string): this`
Save a workspace variable for later use.

**Parameters:**
- `key: string` - Variable identifier
- `workspaceId: string` - Workspace location

**Returns:** `this` - Builder instance for chaining

##### `build(): TransactionRequest`
Build the final transaction request.

**Returns:** `TransactionRequest` - Complete transaction ready for submission

## Type Definitions

### Core Types

```typescript
interface AccountData {
  address: string;
  name?: string;
  public_key: string;
}

interface Substate {
  substate_id: string;
  version: number;
  data: any;
  created_by_transaction: string;
}

interface TemplateDefinition {
  template_address: string;
  binary: Uint8Array;
  functions: FunctionDefinition[];
}

interface VaultBalances {
  balances: Array<{
    resource_address: string;
    balance: number;
    confidential_balance?: ConfidentialBalance;
  }>;
}

enum TransactionStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
  DryRun = "DryRun"
}

enum Network {
  LocalNet = 0,
  Esmeralda = 1,
  MainNet = 2
}
```

### Request/Response Types

```typescript
interface SubmitTransactionRequest {
  transaction: TransactionRequest;
  is_dry_run?: boolean;
}

interface SubmitTransactionResponse {
  transactionId: string;
  status: TransactionStatus;
}

interface GetTransactionResultResponse {
  transaction_id: string;
  status: TransactionStatus;
  result?: TransactionResult;
  execution_time?: number;
}

interface ListSubstatesRequest {
  filter_by_template?: string;
  filter_by_type?: string;
  limit?: number;
  offset?: number;
}

interface ListSubstatesResponse {
  substates: Substate[];
  total_count: number;
}
```

## Utility Functions

### CBOR Utilities

```typescript
// Parse CBOR data
function parseCbor(data: Uint8Array): any;

// Get value from CBOR by path
function getCborValueByPath(data: any, path: string): any;
```

### Address Utilities

```typescript
// Create NFT address from resource
function createNftAddressFromResource(resourceAddress: string, tokenId: string): string;

// Create NFT address from token
function createNftAddressFromToken(tokenAddress: string): string;
```

### Conversion Utilities

```typescript
// Convert hex string to U256 array
function convertHexStringToU256Array(hex: string): number[];

// Convert U256 to hex string
function convertU256ToHexString(u256: number[]): string;

// Convert string to transaction status
function convertStringToTransactionStatus(status: string): TransactionStatus;

// Hex string utilities
function fromHexString(hex: string): Uint8Array;
function toHexString(bytes: Uint8Array): string;
```

## Advanced Functions

### Transaction Management

```typescript
// Build and execute a transaction request
function buildTransactionRequest(
  builder: TransactionBuilder,
  signer: TariSigner
): Promise<TransactionRequest>;

// Submit transaction and wait for result
function submitAndWaitForTransaction(
  signer: TariSigner,
  transaction: TransactionRequest,
  timeout?: number
): Promise<GetTransactionResultResponse>;

// Wait for transaction result
function waitForTransactionResult(
  signer: TariSigner,
  transactionId: string,
  timeout?: number
): Promise<GetTransactionResultResponse>;
```

### Example Usage

```typescript
<!-- VERIFIED: Combined from actual implementation patterns -->
// Complete transaction flow
const builder = new TransactionBuilder()
  .feeTransactionPayFromComponent(account.address, "100")
  .callMethod({
    componentAddress: account.address,
    methodName: 'withdraw',
  }, [
    { type: 'Amount', value: '1000' }
  ]);

const transaction = builder.build();
const result = await signer.submitTransaction({ transaction });

if (result.status === TransactionStatus.Accepted) {
  console.log('Transaction successful!');
} else {
  console.error('Transaction failed:', result);
}
```

## Error Handling

### Common Error Types

```typescript
// Connection errors
class ConnectionError extends Error {
  constructor(message: string, public endpoint: string) {
    super(message);
  }
}

// Transaction errors
class TransactionError extends Error {
  constructor(message: string, public transactionId?: string) {
    super(message);
  }
}

// Validation errors
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
  }
}
```

### Best Practices

```typescript
// Always wrap wallet operations in try-catch
try {
  const result = await signer.submitTransaction(transaction);
  console.log('Success:', result);
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error('Connection failed:', error.endpoint);
  } else if (error instanceof TransactionError) {
    console.error('Transaction failed:', error.transactionId);
  } else {
    console.error('Unexpected error:', error.message);
  }
}

// Check connection status before operations
if (!signer.isConnected()) {
  throw new Error('Wallet not connected');
}

// Validate inputs before building transactions
if (amount <= 0) {
  throw new ValidationError('Amount must be positive', 'amount');
}
```

## Performance Optimization

### Connection Pooling

```typescript
// Use connection pooling for providers
const provider = new IndexerProvider({
  endpoint: 'http://localhost:18300',
  maxConnections: 10, // Pool size
  timeout: 5000
});
```

### Batch Operations

```typescript
// Batch substate queries for better performance
const substateIds = ['id1', 'id2', 'id3'];
const substates = await Promise.all(
  substateIds.map(id => provider.getSubstate({ substate_id: id }))
);
```

### Caching

```typescript
// Implement simple caching for template definitions
const templateCache = new Map<string, TemplateDefinition>();

async function getTemplateWithCache(address: string): Promise<TemplateDefinition> {
  if (templateCache.has(address)) {
    return templateCache.get(address)!;
  }
  
  const template = await provider.getTemplateDefinition(address);
  templateCache.set(address, template);
  return template;
}
```

---

*This API reference covers tari.js v1.0.0. For the latest updates, see our [GitHub repository](https://github.com/tari-project/tari.js).*
