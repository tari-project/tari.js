---
sidebar_position: 1
---

# Transaction Builder

A transaction consists of one or more instructions, which are executed as a single batch. It is possible to save the intermediate result of one instruction and pass it to the next within the same transaction. This can be done using `saveVar()` and `fromWorkspace()`.

## Create an instance of Transaction Builder

```js
import {
  Amount,
  buildTransactionRequest,
  fromWorkspace,
  Network,
  submitAndWaitForTransaction,
  TransactionBuilder,
} from "@tari-project/tarijs";

let builder = new TransactionBuilder();
```

## Fee

Specify the minimum fee and where it should come from.

```js
const account = await provider.getAccount();
const fee = new Amount(2000);
builder = builder
  .feeTransactionPayFromComponent(account.address, fee.getStringValue());
```

## Build transaction

Build a transaction that withdraws _10_ tokens and deposits them back.

```js
const amount = 10;
const tokenResource = "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57";
  
builder = builder.callMethod({
    componentAddress: account.address,
    methodName: "withdraw",
}, [tokenResource, amount.toString()])
.saveVar("bucket")
.callMethod(
  {
    componentAddress: account.address,
    methodName: "deposit",
  },
  [fromWorkspace("bucket")]
);
const transaction = builder.build();
```

## Execute the transaction and wait for fulfillment.

```js
const isDryRun = false;
const inputRefs = undefined;
const network = Network.LocalNet;
const requiredSubstates = [{ substate_id: account.address }];
const submitTransactionRequest = buildTransactionRequest(
  transaction,
  account.account_id,
  requiredSubstates,
  inputRefs,
  isDryRun,
  network
);

const txResult = await submitAndWaitForTransaction(provider, submitTransactionRequest);
```


## Output only for information purposes

```json
{
  "response": {
    "transaction_id": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
  },
  "result": {
    "transaction_id": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857",
    "status": 3,
    "result": {
      "events": [
        {
          "payload": {
            "amount": "2000"
          },
          "substate_id": "component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710",
          "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
          "topic": "pay_fee",
          "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
        },
        {
          "payload": {
            "amount": "10",
            "resource": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57"
          },
          "substate_id": "component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710",
          "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
          "topic": "withdraw",
          "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
        },
        {
          "payload": {
            "amount": "10",
            "resource_address": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57",
            "resource_type": "Fungible",
            "vault_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa"
          },
          "substate_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa",
          "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
          "topic": "std.vault.withdraw",
          "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
        },
        {
          "payload": {
            "amount": "10",
            "resource": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57"
          },
          "substate_id": "component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710",
          "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
          "topic": "deposit",
          "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
        },
        {
          "payload": {
            "amount": "10",
            "resource_address": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57",
            "resource_type": "Fungible",
            "vault_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa"
          },
          "substate_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa",
          "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
          "topic": "std.vault.deposit",
          "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
        }
      ],
      "execution_results": [
        {
          "indexed": {
            "indexed": {
              "bucket_ids": [
                0
              ],
              "component_addresses": [],
              "metadata": [],
              "non_fungible_addresses": [],
              "proof_ids": [],
              "published_template_addresses": [],
              "resource_addresses": [],
              "transaction_receipt_addresses": [],
              "unclaimed_confidential_output_address": [],
              "validator_node_fee_pools": [],
              "vault_ids": []
            },
            "value": {
              "Tag": [
                133,
                {
                  "Integer": 0
                }
              ]
            }
          },
          "return_type": {
            "Other": {
              "name": "Bucket"
            }
          }
        },
        {
          "indexed": {
            "indexed": {
              "bucket_ids": [],
              "component_addresses": [],
              "metadata": [],
              "non_fungible_addresses": [],
              "proof_ids": [],
              "published_template_addresses": [],
              "resource_addresses": [],
              "transaction_receipt_addresses": [],
              "unclaimed_confidential_output_address": [],
              "validator_node_fee_pools": [],
              "vault_ids": []
            },
            "value": "Null"
          },
          "return_type": "Unit"
        },
        {
          "indexed": {
            "indexed": {
              "bucket_ids": [],
              "component_addresses": [],
              "metadata": [],
              "non_fungible_addresses": [],
              "proof_ids": [],
              "published_template_addresses": [],
              "resource_addresses": [],
              "transaction_receipt_addresses": [],
              "unclaimed_confidential_output_address": [],
              "validator_node_fee_pools": [],
              "vault_ids": []
            },
            "value": "Null"
          },
          "return_type": "Unit"
        }
      ],
      "fee_receipt": {
        "cost_breakdown": {
          "breakdown": {
            "Events": 5,
            "Logs": 3,
            "RuntimeCall": 27,
            "Storage": 90
          }
        },
        "total_fee_payment": 2000,
        "total_fees_paid": 125
      },
      "logs": [
        {
          "level": "Info",
          "message": "Dispatcher called with function pay_fee"
        },
        {
          "level": "Info",
          "message": "Dispatcher called with function withdraw"
        },
        {
          "level": "Info",
          "message": "Dispatcher called with function deposit"
        }
      ],
      "result": {
        "Accept": {
          "down_substates": [
            [
              "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35bf23f7b434c7e61c4d0b7057",
              32
            ],
            [
              "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa",
              3
            ]
          ],
          "up_substates": [
            [
              "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35bf23f7b434c7e61c4d0b7057",
              {
                "substate": {
                  "Vault": {
                    "resource_container": {
                      "Confidential": {
                        "address": "resource_0101010101010101010101010101010101010101010101010101010101010101",
                        "commitments": {},
                        "locked_commitments": {},
                        "locked_revealed_amount": 0,
                        "revealed_amount": 999994831
                      }
                    }
                  }
                },
                "version": 33
              }
            ],
            [
              "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa",
              {
                "substate": {
                  "Vault": {
                    "resource_container": {
                      "Fungible": {
                        "address": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57",
                        "amount": 990,
                        "locked_amount": 0
                      }
                    }
                  }
                },
                "version": 4
              }
            ],
            [
              "txreceipt_e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857",
              {
                "substate": {
                  "TransactionReceipt": {
                    "events": [
                      {
                        "payload": {
                          "amount": "2000"
                        },
                        "substate_id": "component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710",
                        "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
                        "topic": "pay_fee",
                        "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
                      },
                      {
                        "payload": {
                          "amount": "10",
                          "resource": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57"
                        },
                        "substate_id": "component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710",
                        "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
                        "topic": "withdraw",
                        "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
                      },
                      {
                        "payload": {
                          "amount": "10",
                          "resource_address": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57",
                          "resource_type": "Fungible",
                          "vault_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa"
                        },
                        "substate_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa",
                        "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
                        "topic": "std.vault.withdraw",
                        "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
                      },
                      {
                        "payload": {
                          "amount": "10",
                          "resource": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57"
                        },
                        "substate_id": "component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710",
                        "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
                        "topic": "deposit",
                        "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
                      },
                      {
                        "payload": {
                          "amount": "10",
                          "resource_address": "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57",
                          "resource_type": "Fungible",
                          "vault_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa"
                        },
                        "substate_id": "vault_24b679b98056c7ca7e3d9f9266fec928c7f29d35ba5d265d0bfc518baa4de2fa",
                        "template_address": "0000000000000000000000000000000000000000000000000000000000000000",
                        "topic": "std.vault.deposit",
                        "tx_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
                      }
                    ],
                    "fee_receipt": {
                      "cost_breakdown": {
                        "breakdown": {
                          "Events": 5,
                          "Logs": 3,
                          "RuntimeCall": 27,
                          "Storage": 90
                        }
                      },
                      "total_fee_payment": 2000,
                      "total_fees_paid": 125
                    },
                    "logs": [
                      {
                        "level": "Info",
                        "message": "Dispatcher called with function pay_fee"
                      },
                      {
                        "level": "Info",
                        "message": "Dispatcher called with function withdraw"
                      },
                      {
                        "level": "Info",
                        "message": "Dispatcher called with function deposit"
                      }
                    ],
                    "transaction_hash": [
                      232,
                      236,
                      4,
                      56,
                      49,
                      0,
                      45,
                      159,
                      108,
                      132,
                      129,
                      106,
                      70,
                      11,
                      0,
                      0,
                      158,
                      189,
                      228,
                      159,
                      47,
                      211,
                      102,
                      233,
                      28,
                      77,
                      65,
                      242,
                      43,
                      170,
                      8,
                      87
                    ]
                  }
                },
                "version": 0
              }
            ]
          ]
        }
      },
      "transaction_hash": "e8ec043831002d9f6c84816a460b00009ebde49f2fd366e91c4d41f22baa0857"
    }
  }
}
```
