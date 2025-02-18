---
sidebar_position: 2
title: Installation
---

# Installation

`tari.js` consists of a set of [packages](https://github.com/tari-project/tari.js/tree/main/packages).

Usually, you will need to install the base package and at least one package that implements a concrete provider.

## Install base package

```bash npm2yarn
npm install @tari-project/tarijs
```

## Install a provider

For this documentation, we will use the `Wallet Daemon Provider`, which allows direct connection to the wallet if you are hosting it locally.
However, you are free to install any other available provider.

```bash npm2yarn
npm install @tari-project/wallet-daemon-provider
```

We will review all providers on their dedicated pages.
