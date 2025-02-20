---
sidebar_position: 2
---

# Build and execute a request

## Build a transaction

After constructing an instance of the *Transaction Builder*, you can build a transaction as follows:

```js
const transaction = builder.build();
```

## Build a transaction request

The transaction request has additional parameters. Therefore, you build it using `buildTransactionRequest`:

```js
const isDryRun = false;
const inputRefs = undefined; // Obsolete
const network = Network.LocalNet;
const requiredSubstates = []; // Soon to be retired. Use `builder.withInputs()` instead.
const submitTransactionRequest = buildTransactionRequest(
  transaction,
  account.account_id,
  requiredSubstates,
  inputRefs,
  isDryRun,
  network
);
```

## Execute a transaction

```js
const txResult = await submitAndWaitForTransaction(provider, submitTransactionRequest);
```