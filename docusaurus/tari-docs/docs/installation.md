---
sidebar_position: 1
title: Installation
---

# Installation

`tari.js` consists of a set of [packages](https://github.com/tari-project/tari.js/tree/main/packages).

Usually, you will need to install the base package and at least one package that implements a concrete provider.

## Prerequisites

Before you begin with the above, however, you will need to have at minimum a default web project template set up in your IDE of choice. We have provided instructions for creating a base React + Vite project below in your IDE of choice, but you are not limited to React. 

Tari.js is useable in any Typescript or Javascript application and framework, so you have full flexibility to choose whichever technology and framework suits you.


### Create a React project

The quickest way to set up a new React project is to leverage `vite` to do so.

In the terminal, run the following command below, and select `Y` to continue

```bash
npm create vite@latest
```

When you run this command, you'll be likely asked to install the following. Select `Y` to continue

```bash
Need to install the following packages:
create-vite@6.3.1
Ok to proceed? (y)
```

You'll be asked to enter a project name. You can call it what you like but to make it easy to follow along, let's call it the `'base-app`. 

```bash
> npx
> create-vite

✔ Project name: … base-app
```
Next, select `React` from the list of options:

```bash
? Select a framework: › - Use arrow-keys. Return to submit.
    Vanilla
    Vue
❯   React
    Preact
    Lit
    Svelte
    Solid
    Qwik
    Angular
    Others
```

Lastly, choose the `Typescript` variant:

```bash
? Select a variant: › - Use arrow-keys. Return to submit.
❯   TypeScript
    TypeScript + SWC
    JavaScript
    JavaScript + SWC
    React Router v7 ↗
```

Once this is done, you'll be instructed to enter the following commands. Do so in the same terminal:

```bash
  cd latest
  npm install
  npm run dev
```

The above will install all the necessary dependencies and then run the template Vite + React application. When running the application, you'll see the following message:

```bash
  VITE v6.2.1  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

The `localhost:port` address indicates that you have the app running locally at that address. Entering the address in your browser will open up the stock app. You'll see something equivalent to the below:

You can view the project and its associated files on the left-hand side of VS Code

We'll be modifying this app to get your Hello Ootle app up and running. For now, you can proceed to the next step.

## Install the base package

Use the below commands to install the tari.js base package.

```bash npm2yarn
npm install @tari-project/tarijs
```

## Install a provider or signer.

In order to use the wallet, you will need to connect either to an Ootle indexer or a signer that allows you to interact with the Ootle via several clients. We explain more about providers and signers in the following section, but in short:
- You will use an indexer when you simply want to obtain information from the Ootle.
- A signer is used when you wish to modify, interact with or create on the Ootle.

### Quick Install Commands

For most use cases, install both provider and signer packages:

```bash npm2yarn
# Complete installation with indexer provider and wallet daemon signer
npm install @tari-project/tarijs @tari-project/indexer-provider @tari-project/wallet-daemon-signer
```

For specific wallet types:

```bash npm2yarn
# MetaMask integration
npm install @tari-project/tarijs @tari-project/metamask-signer

# Tari Universe wallet
npm install @tari-project/tarijs @tari-project/tari-universe

# WalletConnect integration  
npm install @tari-project/tarijs @tari-project/walletconnect
```

## Verification

After installation, verify everything works:

```typescript
import { TariProvider } from '@tari-project/tarijs';

// This should not throw any import errors
console.log('tari.js installed successfully!');
```

## Common Installation Issues

### ❌ Package not found errors

**Problem:** `Module '@tari-project/tarijs' not found`

**Solution:**
```bash
# Clear package manager cache
npm cache clean --force
# or for pnpm
pnpm store prune

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ TypeScript compilation errors

**Problem:** TypeScript can't find type definitions

**Solution:**
```bash
# Install TypeScript and Node types
npm install --save-dev typescript @types/node

# Ensure your tsconfig.json includes:
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

### ❌ Version compatibility issues

**Problem:** Conflicting dependency versions

**Solution:**
```bash
# Check for peer dependency warnings during install
npm install --legacy-peer-deps

# or use exact versions
npm install @tari-project/tarijs@latest
```

### ❌ Build tool configuration

**Problem:** Vite/Webpack build errors with tari.js

**Solution:**

For **Vite**, add to `vite.config.ts`:
```typescript
export default defineConfig({
  optimizeDeps: {
    include: ['@tari-project/tarijs']
  },
  define: {
    global: 'globalThis',
  }
});
```

For **Webpack**, add to config:
```javascript
module.exports = {
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer"),
      "crypto": require.resolve("crypto-browserify")
    }
  }
};
```

### ❌ Node.js polyfill errors in browser

**Problem:** `Buffer is not defined` or similar Node.js polyfill errors

**Solution:**
```bash
# Install polyfills
npm install --save-dev buffer crypto-browserify

# For Vite projects, also install:
npm install --save-dev @esbuild-plugins/node-globals-polyfill
```

## Next Steps

Once installation is complete:

1. 📖 Read about [Provider vs Signer concepts](./provider-vs-signer.md)
2. 🚀 Follow our [Getting Started Tutorial](./guides/getting-started-tutorial.md)  
3. 🔧 Set up your [wallet connections](./signers/wallet-daemon.md)
4. 💼 Learn about [transaction building](./wallet/submit-transaction/transaction-builder/)

## Need Help?

- 📚 Check our [Troubleshooting Guide](./troubleshooting.md)
- 💬 Ask questions in [GitHub Discussions](https://github.com/tari-project/tari.js/discussions)
- 🐛 Report bugs in [GitHub Issues](https://github.com/tari-project/tari.js/issues)