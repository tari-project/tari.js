---
sidebar_position: 2
---

# Template definition

A Tari contract template provides a standardized structure and pre-written code for creating smart contracts on the Tari blockchain. It simplifies development by offering a foundation with common functionalities and best practices, allowing developers to focus on the specific logic of their contract.


Let's take a look at the template definition of the `XtrFaucet` template.  
The template address varies by installation. You can easily examine them using the `Tari Validation Node` UI.

```js
const templateAddress = "0102030000000000000000000000000000000000000000000000000000000000";
const template = await provider.getTemplateDefinition(templateAddress);
```

The result should look similar to:

```json
{
  "V1": {
    "functions": [
      {
        "arguments": [
          {
            "arg_type": {
              "Other": {
                "name": "&self"
              }
            },
            "name": "self"
          },
          {
            "arg_type": {
              "Other": {
                "name": "Amount"
              }
            },
            "name": "amount"
          }
        ],
        "is_mut": false,
        "name": "take",
        "output": {
          "Other": {
            "name": "Bucket"
          }
        }
      },
      {
        "arguments": [
          {
            "arg_type": {
              "Other": {
                "name": "&self"
              }
            },
            "name": "self"
          },
          {
            "arg_type": {
              "Other": {
                "name": "Amount"
              }
            },
            "name": "amount"
          },
          {
            "arg_type": {
              "Other": {
                "name": "ConfidentialOutputStatement"
              }
            },
            "name": "output"
          },
          {
            "arg_type": {
              "Other": {
                "name": "BalanceProofSignature"
              }
            },
            "name": "balance_proof"
          }
        ],
        "is_mut": false,
        "name": "take_confidential",
        "output": {
          "Other": {
            "name": "Bucket"
          }
        }
      }
    ],
    "tari_version": "0.8.0",
    "template_name": "XtrFaucet"
  }
}
```

This template has two methods - `take` and `take_confidential`. First one takes `amount` only, second requires additional confidential output statement along with balance proof signature. Both methods return  a bucket.