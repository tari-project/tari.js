# tari.js

This project provides a unified TypeScript library to connect and send requests to a Tari wallet. It's intended for web application developers that want to interact with a Tari wallet (connect, get substates, submit transactions, etc.).

Tari wallets supported:
* Tari Wallet Daemon
* MetaMask through the [tari-snap](https://github.com/tari-project/tari-snap)

An example site (under the `example` folder) contains a web project that allows the user to connect to any type of Tari wallet and perform common actions.

Please read the [TODO](TODO.md) file for upcoming features.

## Library building

To build the library:
```shell
npm install
npm run build
```

The bundled files for deployment or publication will be located under the `dist` folder.

## Running the example site

To run the example site you will need to:
* Compile the library following the previous section.
* Have access to a Tari Wallet Daemon and to the Tari MetaMask Snap.
* Copy the `example/.env.example` file to `example/.env` and edit the correct environment variable values.

To run in development mode:
```shell
cd example
npm install
npm run dev
```

For building and distribution
```shell
cd example
npm install
npm run build
```
The distribution files will be under the `example/dist` folder. 

