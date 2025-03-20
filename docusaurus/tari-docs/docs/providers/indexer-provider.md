---
sidebar_position: 1
---

# Indexer Provider

This provider is designed to provide connection to the blockchain, whch can be used to query its current state, but only the public one.

## Install required dependencies

```bash npm2yarn
npm install @tari-project/indexer-provider @tari-project/tari-permissions
```

## Establish the connection

```js
import { IndexerProvider, IndexerProviderParameters } from "@tari-project/indexer-provider";
import { TariPermissions } from "@tari-project/tari-permissions";

const permissions = new TariPermissions().addPermission("Admin");
const optionalPermissions = new TariPermissions();
const indexerJrpcUrl = "http://127.0.0.1:12006/json_rpc"; // example url

const params: IndexerProviderParameters = {
  indexerJrpcUrl: indexerJrpcUrl,
  permissions: requiredPermissions,
  optionalPermissions: optionalPermissions,
};

const provider = await IndexerProvider.build(params);
```
