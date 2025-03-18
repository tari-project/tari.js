---
sidebar_position: 1
---

# WalletConnect signer

[WalletConnect](https://walletconnect.network/) is an open-source protocol that lets users connect their cryptocurrency wallets to decentralized applications (dApps) in a secure way. It uses QR codes or deep linking to establish a connection between the wallet and the dApp, allowing users to interact with dApps without exposing their private keys.

## Install required dependencies

```bash npm2yarn
npm install @tari-project/wallet-connect-signer
```

`WalletConnect` signer is browser only. This means it requires user interaction.

Establishing connection requires multiple steps.

## Obtain WalletConnect Project ID

Obtain a WalletConnect Project ID by registering your project on the WalletConnect Cloud. This ID is then used to connect your dApp to the WalletConnect infrastructure, facilitating communication between the dApp and user wallets.

## Request a connection and display wallet connect dialog

```js
import { WalletConnectTariSigner } from "@tari-project/wallet-connect-signer";

const projectId = "1825b9dd9c17b5a33063ae91cbc48a6e";
const signer = new WalletConnectTariSigner(projectId);
await signer.connect();
```

You should see `WalletConnect` dialog:

![WalletConnect](/img/tari/wallet-connect-1.png)

## Copy connection link to clipboard

Click the copy link icon in the top right corner.

## Authorize the connection in your wallet

Authorize the connection by clicking `Connect with WalletConnect` button in your wallet.

![WalletConnect](/img/tari/wallet-connect-2.png)

![WalletConnect](/img/tari/wallet-connect-3.png)

## Success!

Go back to your web application, and the connection should now be established.
