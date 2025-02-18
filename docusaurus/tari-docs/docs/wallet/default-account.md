---
sidebar_position: 1
---

# Account

The provider is linked to an account in your wallet.

```js
const account = await provider.getAccount();
```

This call returns the account details:

```json
{
  "account_id": 1,
  "address": "component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710",
  "public_key": "a6534c991a5c034b2f81af809b9577fe6b5425f810de292c0a4d4d43793a8f50",
  "resources": [
    {
      "type": "Confidential",
      "resource_address": "resource_0101010101010101010101010101010101010101010101010101010101010101",
      "balance": 999999643,
      "vault_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35bf23f7b434c7e61c4d0b7057",
      "token_symbol": "XTR"
    },
    {
      "type": "Fungible",
      "resource_address": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57",
      "balance": 990,
      "vault_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa",
      "token_symbol": "token-a"
    },
    {
      "type": "Fungible",
      "resource_address": "resource_9cdad1188895b080885a64abb71a66a4a4cb1d81d1a55f018a0472b91ee2b47b",
      "balance": 990,
      "vault_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d352289e045361315cf27335067",
      "token_symbol": "token-b"
    },
    {
      "type": "Fungible",
      "resource_address": "resource_c3df71792220ec8f3d3896991d49e100096020f8e26bce2cd16ba5c27831f988",
      "balance": 20,
      "vault_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35f2bfd6b4ca0aa2ba2fcc4769",
      "token_symbol": "LP"
    }
  ]
}
```