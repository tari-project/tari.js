---
sidebar_position: 10
title: Troubleshooting
---

# Troubleshooting Guide

This comprehensive guide covers common issues when working with tari.js and their solutions.

## Installation Issues

### Package Installation Problems

#### ❌ Module '@tari-project/tarijs' not found

**Symptoms:**
```
Error: Cannot resolve module '@tari-project/tarijs'
Module not found: Error: Can't resolve '@tari-project/tarijs'
```

**Solutions:**
```bash
# 1. Clear package manager cache
npm cache clean --force
# or for pnpm
pnpm store prune

# 2. Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Verify package exists in npm registry
npm view @tari-project/tarijs

# 4. Try installing specific version
npm install @tari-project/tarijs@latest
```

#### ❌ Peer dependency warnings

**Symptoms:**
```
npm WARN ERESOLVE overriding peer dependency
npm WARN ERESOLVE Conflicting peerDependencies
```

**Solutions:**
```bash
# Install with legacy peer deps flag
npm install --legacy-peer-deps

# Or force the installation
npm install --force

# For pnpm users
pnpm install --shamefully-hoist
```

#### ❌ TypeScript type errors during installation

**Symptoms:**
```
Cannot find type definition file for '@tari-project/tarijs'
```

**Solutions:**
```bash
# Install TypeScript and Node types
npm install --save-dev typescript @types/node

# Update tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Build and Development Issues

### Bundler Configuration Problems

#### ❌ Vite build errors

**Symptoms:**
```
[ERROR] Could not resolve "@tari-project/tarijs"
Buffer is not defined
global is not defined
```

**Solutions:**

Add to `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@tari-project/tarijs'],
  },
  plugins: [
    NodeGlobalsPolyfillPlugin({
      buffer: true
    })
  ]
})
```

Install required polyfills:
```bash
npm install --save-dev @esbuild-plugins/node-globals-polyfill buffer
```

#### ❌ Webpack build errors

**Symptoms:**
```
Module not found: Error: Can't resolve 'crypto'
Module not found: Error: Can't resolve 'buffer'
```

**Solutions:**

Add to `webpack.config.js`:
```javascript
const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/")
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};
```

Install polyfills:
```bash
npm install --save-dev buffer crypto-browserify stream-browserify util
```

#### ❌ Next.js configuration issues

**Symptoms:**
```
Module parse failed: Unexpected token
ReferenceError: Buffer is not defined
```

**Solutions:**

Add to `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer'),
    };
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    );
    return config;
  },
};

module.exports = nextConfig;
```

## Wallet Connection Issues

### MetaMask Integration Problems

#### ❌ MetaMask not detected

**Symptoms:**
```
MetaMask provider not found
No Ethereum provider detected
```

**Solutions:**
```typescript
// Check if MetaMask is installed
if (typeof window.ethereum === 'undefined') {
  console.error('MetaMask not installed');
  // Guide user to install MetaMask Flask
  window.open('https://metamask.io/flask/', '_blank');
  return;
}

// Wait for MetaMask initialization
await new Promise(resolve => {
  if (window.ethereum) resolve();
  else window.addEventListener('ethereum#initialized', resolve);
});
```

#### ❌ Tari Snap installation failures

**Symptoms:**
```
Snap installation failed
Snap not found in MetaMask
```

**Solutions:**
```typescript
// Install the Tari snap
try {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      'npm:@tari-project/wallet-snap': {}
    }
  });
} catch (error) {
  console.error('Snap installation failed:', error);
  // Ensure MetaMask Flask is being used
  // Check snap permissions in MetaMask settings
}
```

#### ❌ MetaMask connection rejected

**Symptoms:**
```
User rejected the request
Connection request denied
```

**Solutions:**
```typescript
// Implement proper error handling
try {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
} catch (error) {
  if (error.code === 4001) {
    console.log('User rejected connection');
    // Show user-friendly message
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Wallet Daemon Connection Problems

#### ❌ Connection refused to wallet daemon

**Symptoms:**
```
ECONNREFUSED 127.0.0.1:18103
fetch failed: Connection refused
```

**Solutions:**
```bash
# 1. Check if wallet daemon is running
ps aux | grep minotari_wallet_daemon

# 2. Start wallet daemon with JSON-RPC enabled
./target/release/minotari_wallet_daemon --config-path ./config.toml

# 3. Verify JSON-RPC endpoint in config.toml
[wallet]
json_rpc_address = "127.0.0.1:18103"

# 4. Check firewall settings
sudo ufw status
```

#### ❌ Authentication errors

**Symptoms:**
```
401 Unauthorized
Invalid credentials
```

**Solutions:**
```typescript
// Check authentication configuration
const signer = new WalletDaemonSigner({
  endpoint: 'http://localhost:18103',
  // Add authentication if required
  auth: {
    username: 'your-username',
    password: 'your-password'
  }
});
```

#### ❌ CORS errors with wallet daemon

**Symptoms:**
```
Access to fetch blocked by CORS policy
```

**Solutions:**

Add CORS headers to wallet daemon config:
```toml
[wallet.json_rpc]
cors_allowed_origins = ["http://localhost:3000", "http://localhost:5173"]
```

Or use a proxy in development:
```typescript
// In vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:18103',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

### Tari Universe Wallet Issues

#### ❌ Tari Universe not responding

**Symptoms:**
```
Wallet connection timeout
No response from Tari Universe
```

**Solutions:**
```typescript
// Add timeout and retry logic
const signer = new TariUniverseSigner({
  timeout: 30000, // 30 second timeout
  retryAttempts: 3,
  retryDelay: 1000
});

// Check wallet status
try {
  const status = await signer.getWalletStatus();
  console.log('Wallet status:', status);
} catch (error) {
  console.error('Wallet not responding:', error);
}
```

### WalletConnect Integration Issues

#### ❌ WalletConnect pairing fails

**Symptoms:**
```
QR code not scanning
Pairing request timeout
```

**Solutions:**
```typescript
// Ensure proper WalletConnect configuration
import { WalletConnectSigner } from '@tari-project/walletconnect';

const signer = new WalletConnectSigner({
  projectId: 'your-walletconnect-project-id', // Get from WalletConnect Cloud
  metadata: {
    name: 'Your App Name',
    description: 'Your App Description',
    url: 'https://your-app.com',
    icons: ['https://your-app.com/icon.png']
  }
});

// Handle connection errors
signer.on('connect_error', (error) => {
  console.error('WalletConnect error:', error);
});
```

## Transaction Issues

### Transaction Building Problems

#### ❌ Invalid transaction structure

**Symptoms:**
```
Transaction validation failed
Invalid instruction format
```

**Solutions:**
```typescript
// Ensure proper transaction structure
const transaction = new TransactionBuilder()
  .fee(100) // Always set fee first
  .inputs([...requiredInputs]) // Add all required inputs
  .callMethod('account', 'transfer', {
    amount: 1000,
    destination: destinationAddress
  })
  .build();

// Validate before submission
if (!transaction.isValid()) {
  console.error('Transaction validation failed');
  return;
}
```

#### ❌ Insufficient funds errors

**Symptoms:**
```
Insufficient balance
Not enough funds for transaction
```

**Solutions:**
```typescript
// Check balance before transaction
const account = await signer.getDefaultAccount();
const balance = await signer.getBalance(account);

if (balance < transactionAmount + fee) {
  throw new Error(`Insufficient funds. Required: ${transactionAmount + fee}, Available: ${balance}`);
}
```

#### ❌ Fee calculation errors

**Symptoms:**
```
Fee too low
Transaction rejected due to insufficient fee
```

**Solutions:**
```typescript
// Use fee estimation
const estimatedFee = await provider.estimateFee(transaction);
const transaction = new TransactionBuilder()
  .fee(estimatedFee * 1.1) // Add 10% buffer
  .callMethod(...)
  .build();
```

### Transaction Submission Problems

#### ❌ Transaction timeout

**Symptoms:**
```
Transaction submission timeout
No response from network
```

**Solutions:**
```typescript
// Add proper timeout handling
try {
  const result = await Promise.race([
    signer.submitTransaction(transaction),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 30000)
    )
  ]);
} catch (error) {
  if (error.message === 'Timeout') {
    console.error('Transaction submission timed out');
    // Implement retry logic
  }
}
```

#### ❌ Transaction rejected by network

**Symptoms:**
```
Transaction validation failed
Invalid transaction format
```

**Solutions:**
```typescript
// Validate transaction before submission
const validationResult = await provider.validateTransaction(transaction);
if (!validationResult.isValid) {
  console.error('Transaction validation errors:', validationResult.errors);
  return;
}

// Check network status
const networkInfo = await provider.getNetworkInfo();
if (!networkInfo.isHealthy) {
  console.warn('Network may be experiencing issues');
}
```

## Performance Issues

### Slow Query Performance

#### ❌ Slow substate queries

**Symptoms:**
```
Long response times for getSubstate calls
```

**Solutions:**
```typescript
// Use batch queries for multiple substates
const substates = await provider.getSubstatesBatch([id1, id2, id3]);

// Implement caching
const cache = new Map();
const cachedResult = cache.get(substateId);
if (cachedResult) {
  return cachedResult;
}

// Use connection pooling
const provider = new IndexerProvider({
  endpoint: 'http://localhost:18300',
  maxConnections: 10,
  timeout: 5000
});
```

#### ❌ Memory leaks in long-running applications

**Symptoms:**
```
Increasing memory usage over time
Application becoming unresponsive
```

**Solutions:**
```typescript
// Properly cleanup resources
class MyApp {
  private signer?: TariSigner;
  
  async cleanup() {
    if (this.signer) {
      await this.signer.disconnect();
      this.signer = undefined;
    }
  }
}

// Remove event listeners
signer.removeAllListeners();

// Clear caches periodically
setInterval(() => {
  cache.clear();
}, 300000); // Clear every 5 minutes
```

## Debugging Tips

### Enable Debug Logging

```typescript
// Enable debug mode
localStorage.setItem('debug', 'tari:*');

// Or set specific debug levels
localStorage.setItem('debug', 'tari:signer,tari:provider');
```

### Common Debug Commands

```typescript
// Check provider connection
console.log('Provider status:', await provider.getStatus());

// Verify signer state
console.log('Signer accounts:', await signer.getAccounts());

// Monitor transaction status
const txId = await signer.submitTransaction(tx);
const status = await provider.getTransactionStatus(txId);
console.log('Transaction status:', status);
```

### Browser Developer Tools

1. **Network Tab**: Check for failed HTTP requests
2. **Console Tab**: Look for JavaScript errors and warnings
3. **Application Tab**: Verify localStorage/sessionStorage state
4. **Sources Tab**: Set breakpoints for debugging

## Getting Help

If you're still experiencing issues:

1. **Check the latest documentation**: https://tari-project.github.io/tari.js/
2. **Search existing issues**: https://github.com/tari-project/tari.js/issues
3. **Ask in discussions**: https://github.com/tari-project/tari.js/discussions
4. **Create a new issue** with:
   - Your environment (OS, Node.js version, browser)
   - Complete error messages
   - Minimal reproduction steps
   - Expected vs actual behavior

## Environment Information

When reporting issues, include:

```bash
# System information
node --version
npm --version
# or
pnpm --version

# Package versions
npm list @tari-project/tarijs
npm list typescript

# Browser information (for web apps)
# Check developer tools → console → navigator.userAgent
```

---

*Last updated: 2025-06-25*
