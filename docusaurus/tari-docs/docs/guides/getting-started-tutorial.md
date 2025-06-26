---
sidebar_position: 2
title: Getting Started Tutorial
---

# Getting Started Tutorial

This comprehensive tutorial will guide you through building your first tari.js application step by step. By the end, you'll have a working web app that connects to Tari wallets and performs transactions.

## What You'll Build

A simple wallet interface that can:
- 🔌 Connect to different Tari wallet types
- 💰 Display wallet balance
- 📊 Query blockchain data
- 💸 Send transactions
- 📱 Handle wallet events

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** and **npm/pnpm** installed
- Basic knowledge of **TypeScript/JavaScript**
- **React** familiarity (optional - adaptable to any framework)
- A **Tari wallet** for testing (Wallet Daemon or MetaMask with tari-snap)

## Step 1: Project Setup

### Create a New React Project

```bash
npm create vite@latest tari-wallet-app -- --template react-ts
cd tari-wallet-app
npm install
```

### Install tari.js Dependencies

```bash
# Install core tari.js packages
npm install @tari-project/tarijs

# Install specific wallet providers
npm install @tari-project/wallet-daemon @tari-project/indexer-provider

# Optional: Add MetaMask support
npm install @tari-project/metamask-signer
```

### Configure Build Tools

Update `vite.config.ts` for proper bundling:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@tari-project/tarijs']
  }
})
```

## Step 2: Basic Wallet Connection

### Create Wallet Service

Create `src/services/walletService.ts`:

```typescript
import { 
  WalletDaemonTariSigner, 
  IndexerProvider,
  TariSigner,
  TariProvider,
  TariPermissions
} from '@tari-project/tarijs';

export interface WalletConnection {
  signer: TariSigner;
  provider: TariProvider;
  isConnected: boolean;
}

export class WalletService {
  private connection: WalletConnection | null = null;

  async connectWalletDaemon(endpoint: string = 'http://localhost:18103'): Promise<WalletConnection> {
    try {
      const signer = await WalletDaemonTariSigner.buildFetchSigner({
        serverUrl: endpoint,
        permissions: new TariPermissions()
      });

      const provider = new IndexerProvider({
        endpoint: 'http://localhost:18300'
      });

      // Test connection
      await signer.getAccount();
      
      this.connection = {
        signer,
        provider,
        isConnected: true
      };

      return this.connection;
    } catch (error) {
      console.error('Failed to connect to wallet daemon:', error);
      throw new Error('Could not connect to Tari Wallet Daemon. Is it running?');
    }
  }

  async connectMetaMask(): Promise<WalletConnection> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed. Please install MetaMask Flask.');
    }

    try {
      // Request access to MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Install Tari snap if needed
      await window.ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
          'npm:@tari-project/wallet-snap': {}
        }
      });

      const { MetaMaskSigner } = await import('@tari-project/metamask-signer');
      const signer = new MetaMaskSigner();
      
      const provider = new IndexerProvider({
        endpoint: 'http://localhost:18300'
      });

      this.connection = {
        signer,
        provider,
        isConnected: true
      };

      return this.connection;
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
      throw new Error('Could not connect to MetaMask. Check installation and permissions.');
    }
  }

  getConnection(): WalletConnection | null {
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.signer.disconnect?.();
      this.connection = null;
    }
  }
}
```

### Create Wallet Context

Create `src/contexts/WalletContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import { WalletService, WalletConnection } from '../services/walletService';

interface WalletContextType {
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  connectWalletDaemon: () => Promise<void>;
  connectMetaMask: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletService] = useState(new WalletService());

  const handleConnection = useCallback(async (connectFn: () => Promise<WalletConnection>) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const conn = await connectFn();
      setConnection(conn);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectWalletDaemon = useCallback(() => 
    handleConnection(() => walletService.connectWalletDaemon()), 
    [handleConnection, walletService]
  );

  const connectMetaMask = useCallback(() => 
    handleConnection(() => walletService.connectMetaMask()), 
    [handleConnection, walletService]
  );

  const disconnect = useCallback(async () => {
    await walletService.disconnect();
    setConnection(null);
    setError(null);
  }, [walletService]);

  return (
    <WalletContext.Provider value={{
      connection,
      isConnecting,
      error,
      connectWalletDaemon,
      connectMetaMask,
      disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
};
```

## Step 3: Wallet Connection UI

### Create Wallet Connect Component

Create `src/components/WalletConnect.tsx`:

```typescript
import React from 'react';
import { useWallet } from '../contexts/WalletContext';

export const WalletConnect: React.FC = () => {
  const { 
    connection, 
    isConnecting, 
    error, 
    connectWalletDaemon, 
    connectMetaMask, 
    disconnect 
  } = useWallet();

  if (connection?.isConnected) {
    return (
      <div className="wallet-connected">
        <div className="success-message">
          ✅ Wallet Connected Successfully!
        </div>
        <button onClick={disconnect} className="disconnect-btn">
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <h2>Connect Your Tari Wallet</h2>
      
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="wallet-options">
        <button
          onClick={connectWalletDaemon}
          disabled={isConnecting}
          className="wallet-btn wallet-daemon-btn"
        >
          {isConnecting ? '🔄 Connecting...' : '🖥️ Connect Wallet Daemon'}
        </button>

        <button
          onClick={connectMetaMask}
          disabled={isConnecting}
          className="wallet-btn metamask-btn"
        >
          {isConnecting ? '🔄 Connecting...' : '🦊 Connect MetaMask'}
        </button>
      </div>

      <div className="wallet-help">
        <h3>Need Help?</h3>
        <ul>
          <li>
            <strong>Wallet Daemon:</strong> Make sure your Tari Wallet Daemon is running on localhost:18103
          </li>
          <li>
            <strong>MetaMask:</strong> Install MetaMask Flask and the Tari snap from our example site
          </li>
        </ul>
      </div>
    </div>
  );
};
```

## Step 4: Display Wallet Information

### Create Wallet Info Component

Create `src/components/WalletInfo.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface AccountInfo {
  address: string;
  balance: number;
  name?: string;
}

export const WalletInfo: React.FC = () => {
  const { connection } = useWallet();
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connection?.isConnected) {
      loadAccountInfo();
    }
  }, [connection]);

  const loadAccountInfo = async () => {
    if (!connection) return;

    setLoading(true);
    setError(null);

    try {
      // Get default account
      const account = await connection.signer.getAccount();
      
      setAccounts([{
        address: account.address,
        balance: account.resources.reduce((total, resource) => total + resource.balance, 0),
        name: 'Default Account'
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  if (!connection?.isConnected) {
    return null;
  }

  if (loading) {
    return (
      <div className="wallet-info loading">
        <h3>Loading wallet information...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-info error">
        <h3>Error loading wallet info</h3>
        <p>{error}</p>
        <button onClick={loadAccountInfo}>Retry</button>
      </div>
    );
  }

  return (
    <div className="wallet-info">
      <div className="info-header">
        <h3>💰 Wallet Information</h3>
        <button onClick={loadAccountInfo} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="accounts-list">
        {accounts.length === 0 ? (
          <p>No accounts found</p>
        ) : (
          accounts.map((account, index) => (
            <div key={index} className="account-card">
              <div className="account-name">
                <strong>{account.name}</strong>
              </div>
              <div className="account-address">
                Address: <code>{account.address}</code>
              </div>
              <div className="account-balance">
                Balance: <strong>{account.balance.toLocaleString()} Tari</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

## Step 5: Simple Transaction Interface

### Create Transaction Component

Create `src/components/TransactionForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { TransactionBuilder } from '@tari-project/tarijs';

export const TransactionForm: React.FC = () => {
  const { connection } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connection?.isConnected) {
      setError('Wallet not connected');
      return;
    }

    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      // Get default account
      const account = await connection.signer.getAccount();
      
      // Build transaction
      const transaction = new TransactionBuilder()
        .feeTransactionPayFromComponent(account.address, fee)
        .callMethod({
          componentAddress: account.address,
          methodName: 'withdraw',
        }, [{ type: 'Amount', value: amount }])
        .build();

      // Submit transaction
      const txResult = await connection.signer.submitTransaction({ transaction });
      
      setResult(`Transaction submitted successfully! ID: ${txResult.transaction_id}`);
      
      // Clear form
      setRecipient('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connection?.isConnected) {
    return (
      <div className="transaction-form disabled">
        <h3>💸 Send Transaction</h3>
        <p>Connect a wallet to send transactions</p>
      </div>
    );
  }

  return (
    <div className="transaction-form">
      <h3>💸 Send Transaction</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address:</label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient address..."
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (Tari):</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            min="1"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fee">Fee (Tari):</label>
          <input
            id="fee"
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="Enter fee..."
            min="1"
            disabled={isSubmitting}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !recipient || !amount}
          className="submit-btn"
        >
          {isSubmitting ? '🔄 Sending...' : '📤 Send Transaction'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="success-message">
          ✅ {result}
        </div>
      )}
    </div>
  );
};
```

## Step 6: Bring It All Together

### Update Main App

Update `src/App.tsx`:

```typescript
import React from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { WalletConnect } from './components/WalletConnect';
import { WalletInfo } from './components/WalletInfo';
import { TransactionForm } from './components/TransactionForm';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <div className="app">
        <header className="app-header">
          <h1>🏗️ Tari Wallet Demo</h1>
          <p>Connect to your Tari wallet and perform transactions</p>
        </header>

        <main className="app-main">
          <section className="connect-section">
            <WalletConnect />
          </section>

          <section className="info-section">
            <WalletInfo />
          </section>

          <section className="transaction-section">
            <TransactionForm />
          </section>
        </main>

        <footer className="app-footer">
          <p>
            Built with <a href="https://tari-project.github.io/tari.js/">tari.js</a> | 
            <a href="https://github.com/tari-project/tari.js">GitHub</a>
          </p>
        </footer>
      </div>
    </WalletProvider>
  );
}

export default App;
```

### Add Basic Styling

Create/update `src/App.css`:

```css
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
}

.app-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Wallet Connect Styles */
.wallet-connect {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.wallet-options {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 20px 0;
}

.wallet-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.wallet-daemon-btn {
  background: #007bff;
  color: white;
}

.metamask-btn {
  background: #f6851b;
  color: white;
}

.wallet-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.wallet-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-connected {
  background: #d4edda;
  color: #155724;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.disconnect-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

/* Wallet Info Styles */
.wallet-info {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.refresh-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.account-card {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.account-address code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

/* Transaction Form Styles */
.transaction-form {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.submit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Message Styles */
.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .wallet-options {
    flex-direction: column;
    align-items: center;
  }
  
  .wallet-btn {
    width: 100%;
    max-width: 300px;
  }
}
```

## Step 7: Testing Your Application

### Start the Development Server

```bash
npm run dev
```

Your app should now be running at `http://localhost:5173`

### Test Wallet Connections

#### Testing with Wallet Daemon:

1. Ensure your Tari Wallet Daemon is running:
   ```bash
   ./target/release/minotari_wallet_daemon --config-path ./config.toml
   ```

2. Click "Connect Wallet Daemon" in your app
3. If successful, you should see wallet information displayed

#### Testing with MetaMask:

1. Install MetaMask Flask (developer version)
2. Visit the tari.js example site to install the Tari snap
3. Click "Connect MetaMask" in your app
4. Follow the MetaMask prompts to connect

## Step 8: Advanced Features

### Add Real-time Updates

```typescript
// In WalletInfo component, add polling for balance updates
useEffect(() => {
  if (!connection?.isConnected) return;

  const interval = setInterval(() => {
    loadAccountInfo();
  }, 30000); // Update every 30 seconds

  return () => clearInterval(interval);
}, [connection]);
```

### Add Transaction History

```typescript
// Add to WalletInfo component
const [transactions, setTransactions] = useState([]);

const loadTransactionHistory = async () => {
  if (!connection) return;
  
  try {
    const accounts = await connection.signer.getAccounts();
    const txHistory = await connection.provider.getTransactionHistory(accounts[0]);
    setTransactions(txHistory);
  } catch (error) {
    console.error('Failed to load transaction history:', error);
  }
};
```

### Error Boundaries

```typescript
// Create src/components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong!</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Next Steps

Congratulations! 🎉 You've built a functional Tari wallet application. Here's what you can explore next:

### 📚 Learn More:
- **[Advanced Transaction Building](../wallet/submit-transaction/transaction-builder/)** - Complex smart contract interactions
- **[Template System](../wallet/template-definition.md)** - Working with smart contract templates  
- **[Provider Types](../providers/indexer-provider.md)** - Different data access patterns

### 🚀 Production Ready:
- **[Production Deployment Guide](./production-deployment.md)** - Security and performance best practices
- **[Error Handling](../troubleshooting.md)** - Comprehensive error management
- **[Testing Guide](./testing-guide.md)** - Unit and integration testing

### 🛠️ Extend Your App:
- Add support for multiple wallet types
- Implement transaction history visualization
- Create reusable wallet components
- Add offline transaction queuing
- Implement advanced authentication

### 💬 Get Help:
- **[Discord Community](https://discord.gg/tari)** - Join the conversation
- **[GitHub Discussions](https://github.com/tari-project/tari.js/discussions)** - Ask questions
- **[API Reference](../api-reference.md)** - Complete method documentation

---

*Happy building with tari.js! 🏗️*
