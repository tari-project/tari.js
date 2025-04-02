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

For this documentation, we will use the `Wallet Daemon Provider`, which allows direct connection to the wallet if you are hosting it locally.
However, you are free to install any other available provider.

```bash npm2yarn
npm install @tari-project/wallet-daemon-provider
```

We will review all providers on their dedicated pages.