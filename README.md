# tari.js

> **🚀 The complete TypeScript toolkit for building on Tari** — Connect any wallet, query the blockchain, and create powerful dApps with confidence.

[![npm version](https://badge.fury.io/js/@tari-project%2Ftarijs.svg)](https://badge.fury.io/js/@tari-project%2Ftarijs)
[![License](https://img.shields.io/badge/license-BSD%203--Clause-blue.svg)](LICENSE)
[![Documentation](https://img.shields.io/badge/docs-tari--project.github.io-brightgreen)](https://tari-project.github.io/tari.js/)

**✨ What makes tari.js special?**
- **🔌 Universal Wallet Support** — MetaMask, Wallet Daemon, Universe, WalletConnect — all with one API
- **🛡️ Privacy-First** — Built-in confidential transactions and zero-knowledge proofs
- **📱 Developer Friendly** — Full TypeScript support, intuitive APIs, comprehensive docs
- **⚡ Production Ready** — Battle-tested, optimized, and actively maintained

## 🎯 Quick Start (5 minutes)

Get your first Tari app running in minutes:

```bash
# Install tari.js
npm install @tari-project/tarijs @tari-project/wallet-daemon-signer

# Run your first connection test
node -e "
import { WalletDaemonTariSigner, TariPermissions } from '@tari-project/tarijs';
const wallet = await WalletDaemonTariSigner.buildFetchSigner({
  serverUrl: 'http://localhost:18103',
  permissions: new TariPermissions()
});
console.log('Connected to Tari!');
"
```

**👉 [Complete Installation Guide](https://tari-project.github.io/tari.js/installation) | [5-Minute Tutorial](https://tari-project.github.io/tari.js/guides/getting-started-tutorial)**

## 🏗️ What You Can Build

### 🪙 **DeFi Applications**
```typescript
// Transfer tokens
const transaction = new TransactionBuilder()
  .feeTransactionPayFromComponent(account.address, "100")
  .callMethod({
    componentAddress: account.address,
    methodName: 'withdraw'
  }, [{ type: 'Amount', value: '1000' }])
  .build();
```

### 🎮 **Gaming & NFTs**  
```typescript
// Call a smart contract function
const transaction = new TransactionBuilder()
  .feeTransactionPayFromComponent(account.address, "100")
  .callFunction({
    templateAddress: nftTemplate.address,
    functionName: 'mint_nft'
  }, [{ name: 'metadata', value: { name: "Epic Sword", rarity: "legendary" } }])
  .build();
```

### 💼 **Enterprise Solutions**
```typescript
// Multiple operations in one transaction
const transaction = new TransactionBuilder()
  .feeTransactionPayFromComponent(account.address, "100")
  .callMethod({ componentAddress: account1, methodName: 'withdraw' }, [amount1])
  .callMethod({ componentAddress: account2, methodName: 'withdraw' }, [amount2])
  .build();
```

## 🔗 Supported Wallets

| Wallet | Best For | Status |
|--------|----------|--------|
| **🖥️ [Tari Wallet Daemon](https://tari-project.github.io/tari.js/signers/wallet-daemon)** | Servers, advanced features | ✅ Production |
| **🦊 [MetaMask](https://tari-project.github.io/tari.js/signers/metamask)** | Browser apps, familiar UX | ✅ Production |
| **🌌 [Tari Universe](https://tari-project.github.io/tari.js/signers/tari-universe)** | Mobile, native experience | ✅ Production |
| **📱 [WalletConnect](https://tari-project.github.io/tari.js/signers/wallet-connect)** | Cross-platform, mobile-first | ✅ Production |

## 📚 Documentation Hub

### 🚀 **Get Started**
- **[Installation Guide](https://tari-project.github.io/tari.js/installation)** — Set up your development environment
- **[First App Tutorial](https://tari-project.github.io/tari.js/guides/getting-started-tutorial)** — Build a working wallet app
- **[Provider vs Signer](https://tari-project.github.io/tari.js/provider-vs-signer)** — Understand the core concepts

### 📖 **Guides & Examples**
- **[Wallet Integration](https://tari-project.github.io/tari.js/category/signers)** — Connect different wallet types
- **[Transaction Building](https://tari-project.github.io/tari.js/wallet/submit-transaction/transaction-builder/)** — Create complex transactions
- **[Production Deployment](https://tari-project.github.io/tari.js/guides/production-deployment)** — Go live with confidence

### 🔧 **Reference**
- **[Complete API Reference](https://tari-project.github.io/tari.js/api-reference)** — Every method documented
- **[Troubleshooting](https://tari-project.github.io/tari.js/troubleshooting)** — Common issues & solutions
- **[Templates & Examples](https://github.com/tari-project/tari.js/tree/main/examples)** — Copy-paste code snippets

---

## 🛠️ Contributing & Development  

**Want to contribute?** We'd love your help! Here's how to get started:

### 🚀 **Quick Development Setup**

```bash
# 1. Clone with required dependencies
git clone https://github.com/tari-project/tari.js
git clone https://github.com/tari-project/tari-ootle ../tari-ootle

# 2. Install toolchain
curl -fsSL https://moonrepo.dev/install/proto.sh | bash
proto use

# 3. Build everything
pnpm install
moon tarijs:build
```

### 🧪 **Run the Example App**
```bash
cd packages/tarijs/example
cp .env.example .env    # Configure your wallet endpoints
pnpm run dev           # Start development server
```

### 📦 **Docker Development**
```bash
docker build -t tarijs .
docker create --name tarijs-build tarijs
docker cp tarijs-build:/app/combined_dist/ ./dist
```

### 📖 **Documentation Development**
```bash
moon tari-docs:start   # http://localhost:3000/tari.js/
```

**Need help getting started?** Check our **[Contributing Guide](https://tari-project.github.io/tari.js/contributing)** or ask in [GitHub Discussions](https://github.com/tari-project/tari.js/discussions).

## 🤝 Community & Support

- **📚 [Complete Documentation](https://tari-project.github.io/tari.js/)** — Everything you need to know
- **💬 [GitHub Discussions](https://github.com/tari-project/tari.js/discussions)** — Ask questions, share ideas  
- **🐛 [Issue Tracker](https://github.com/tari-project/tari.js/issues)** — Report bugs, request features
- **🔧 [Troubleshooting Guide](https://tari-project.github.io/tari.js/troubleshooting)** — Common issues & solutions
- **🎮 [Example Apps](https://github.com/tari-project/tari.js/tree/main/examples)** — See tari.js in action

## 📄 License

This project is licensed under the **BSD 3-Clause License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the [Tari Project](https://tari.com)**

[Website](https://tari.com) • [Blog](https://blog.tari.com) • [Twitter](https://twitter.com/tari) • [Discord](https://discord.gg/tari)

</div>
