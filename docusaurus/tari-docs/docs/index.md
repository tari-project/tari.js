---
sidebar_position: 1
slug: /
title: tari.js Documentation
description: Complete guide to building with tari.js - the TypeScript toolkit for Tari blockchain applications
---

# Welcome to tari.js! 👋

> **Build powerful Tari applications with confidence** — tari.js is the complete TypeScript toolkit for connecting wallets, querying the blockchain, and creating amazing dApps.

<div className="hero-badges">

![npm version](https://badge.fury.io/js/@tari-project%2Ftarijs.svg)
![License](https://img.shields.io/badge/license-BSD%203--Clause-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

</div>

## 🚀 **What is tari.js?**

tari.js is the **universal JavaScript/TypeScript library** for building on Tari. Whether you're creating a DeFi app, an NFT marketplace, or an enterprise solution, tari.js provides everything you need:

- **🔌 Universal Wallet Support** — Connect MetaMask, Wallet Daemon, Universe, WalletConnect with one API
- **🛡️ Privacy-First** — Built-in confidential transactions and zero-knowledge proofs  
- **📱 Developer Friendly** — Full TypeScript support, intuitive APIs, comprehensive docs
- **⚡ Production Ready** — Battle-tested, optimized, and actively maintained

## ✨ **What Makes tari.js Special?**

### 🎯 **Provider/Signer Architecture**
Clean separation between reading data and wallet operations:

```typescript
// 📖 Provider: Read blockchain data (no wallet needed)
const provider = new IndexerProvider('http://localhost:18300');
const balance = await provider.getSubstate(substateId);

// ✍️ Signer: Wallet operations (requires authentication)  
const signer = new WalletDaemonSigner('http://localhost:18103');
const tx = await signer.submitTransaction(transaction);
```

### 🧩 **Unified API Across All Wallets**
Same code works with any wallet type:

```typescript
// Works with MetaMask, Universe, Wallet Daemon, WalletConnect
const wallet = await connectWallet();
const account = await wallet.getDefaultAccount();
const result = await wallet.submitTransaction(tx);
```

### 🏗️ **Powerful Transaction Builder**
Fluent API for complex operations:

```typescript
const transaction = new TransactionBuilder()
  .fee(100)
  .callMethod('account', 'transfer', { amount: 1000, destination })
  .callFunction('nft_template', 'mint', { metadata })
  .build();
```

## 🎯 **Quick Navigation**

### 🚀 **Get Started (5 minutes)**
- **[Installation](./installation)** — Set up your development environment
- **[Getting Started Tutorial](./guides/getting-started-tutorial)** — Build your first app
- **[Provider vs Signer](./provider-vs-signer)** — Understand core concepts

### 🔌 **Wallet Integration**
- **[Wallet Daemon](./signers/wallet-daemon)** — Full-featured server integration
- **[MetaMask](./signers/metamask)** — Browser wallet via tari-snap
- **[Tari Universe](./signers/tari-universe)** — Native mobile experience
- **[WalletConnect](./signers/wallet-connect)** — Cross-platform mobile wallets

### 🏗️ **Building Transactions**
- **[Transaction Builder](./wallet/submit-transaction/transaction-builder/)** — Create complex transactions
- **[Template System](./wallet/template-definition)** — Work with smart contracts
- **[Fee Management](./wallet/submit-transaction/transaction-builder/fee)** — Optimize transaction costs

### 🔧 **Reference**
- **[Complete API Reference](./api-reference)** — Every method documented
- **[Troubleshooting](./troubleshooting)** — Common issues & solutions
- **[Production Deployment](./guides/production-deployment)** — Go live securely

## 📚 **Documentation Structure**

This documentation is organized for different user journeys:

| If you're... | Start here |
|--------------|------------|
| **🆕 New to tari.js** | [Installation](./installation) → [Getting Started Tutorial](./guides/getting-started-tutorial) |
| **🔌 Integrating wallets** | [Provider vs Signer](./provider-vs-signer) → [Wallet Documentation](./category/signers) |
| **🏗️ Building transactions** | [Transaction Builder](./wallet/submit-transaction/transaction-builder/) → [Templates](./wallet/template-definition) |
| **🚨 Having issues** | [Troubleshooting](./troubleshooting) → [GitHub Issues](https://github.com/tari-project/tari.js/issues) |
| **📖 Looking for specifics** | [API Reference](./api-reference) → Search this site |

## 🆕 **What's New in v0.5.0**

:::info Major Update
**Provider/Signer Split** — We've separated data access from wallet operations for better security and flexibility. [Learn about the changes →](./provider-vs-signer)
:::

### 🎉 **New Features**
- **🔌 Unified wallet connection API** across all wallet types
- **🏗️ Enhanced transaction builder** with fluent API design
- **📱 Improved mobile support** for React Native and PWAs
- **🛡️ Better error handling** and debugging tools

### 🔄 **Migration Guide**
Upgrading from v0.4.0? Check our [migration guide](./guides/migration-v0.5.0) for step-by-step instructions.

## 🤝 **Community & Support**

- **💬 [GitHub Discussions](https://github.com/tari-project/tari.js/discussions)** — Ask questions, share ideas
- **🐛 [Issue Tracker](https://github.com/tari-project/tari.js/issues)** — Report bugs, request features  
- **📺 [Discord Community](https://discord.gg/tari)** — Real-time chat with developers
- **🎮 [Example Apps](https://github.com/tari-project/tari.js/tree/main/examples)** — See tari.js in action

---

**Ready to build something amazing?** [Install tari.js](./installation) and create your first Tari application in 5 minutes! 🚀
