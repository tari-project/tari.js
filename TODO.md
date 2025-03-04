# TODO

- In the wallet provider interface:
  - Full TypeScript class definitions for transaction requests (instructions, etc.).
  - Common return types for both types of wallets.
  - Implement `getSubstate` method for the Tari Wallet Daemon provider.
  - Add account balance to `getAccountData` method for the Tari Wallet Daemon provider.
- For the example site:
  - The button should indicate when a connection was established.
  - The `TariConnect` button could be made into a reusable React component, ready to be imported by any web.
- Typescript-bindings
  - [Types refactor and cleanup](https://github.com/tari-project/tari.js/issues/29)
- Other
  - Configure prettier to not change entire file while saving
