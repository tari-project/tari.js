# connect-button

Minimal example showing how to connect to a Tari Wallet Daemon and display account information — the "hello world" of Ootle dApp development.

## What it demonstrates

- Connecting to a wallet daemon over JSON-RPC
- Displaying the account address and public key
- Handling loading and error states
- The `useWalletDaemon` React hook pattern

## Prerequisites

You need a running **Tari Ootle Wallet Daemon**. The daemon holds your private key and signs transactions; it never exposes the key to the browser.

### 1. Download the daemon

Grab the latest release for your OS from the [tari-ootle releases page](https://github.com/tari-project/tari-ootle/releases).

### 2. Start the daemon

```bash
./tari_ootle_walletd --network igor
```

The daemon will:
- Sync with the Igor testnet
- Create a wallet if one doesn't exist yet
- Start listening for JSON-RPC requests on **port 9000**

The wallet web UI is also available at `http://localhost:5100` where you can fund your account with test tokens.

### 3. Optional: custom port

```bash
./tari_ootle_walletd --network igor --listen-on 127.0.0.1:12345
```

## Run the example

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

Enter `http://127.0.0.1:9000/json_rpc` as the daemon URL (pre-filled by default) and click **Connect Wallet**.

## Key files

| File | Purpose |
|------|---------|
| `src/hooks/useWalletDaemon.ts` | State machine: disconnected → connecting → connected |
| `src/App.tsx` | Connect form and connected account view |

## Learn more

- [Ootle docs](https://ootle.tari.com)
- [Setup a wallet guide](https://ootle.tari.com/guides/setup-a-wallet/)
- [`@tari-project/ootle-wallet-daemon-signer`](../../packages/ootle-wallet-daemon-signer/)
