---
sidebar_position: 3
---

# Wallet daemon provider

This is the only provider that works in both Node.js and browser environments. It enables a direct connection to a wallet via JSON-RPC.

## Install required dependencies

```bash npm2yarn
npm install @tari-project/wallet-daemon-provider @tari-project/tari-permissions
```

## Establish and test the connection

```js
import { TariPermissions } from "@tari-project/tari-permissions";
import { WalletDaemonTariSigner } from "@tari-project/wallet-daemon-provider";

const permissions = new TariPermissions().addPermission("Admin");
const serverUrl = "http://127.0.0.1:12010/json_rpc";
const provider = await WalletDaemonTariSigner.buildFetchProvider({
  permissions,
  serverUrl,
});

// Test connection
const account = await provider.getAccount();
console.log(`Account address: ${account.address}`);
```

If the connection is successful, it should output an account address similar to the following:

```txt
Account id: component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710
```
