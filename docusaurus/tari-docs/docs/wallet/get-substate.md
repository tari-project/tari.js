---
sidebar_position: 4
---

# Get substate

It is possible to get substate details by substate address:

```js
const substateAddress = "component_9cdad1188895b080885a64abb71a66a4a4cb1d8117679d85c8b35a4ec5d02243";
const substate = await provider.getSubstate(substateAddress);
```

```json
{
  "value": {
    "substate": {
      "Component": {
        "access_rules": {
          "default": "AllowAll",
          "method_access": {}
        },
        "body": {
          "state": {
            "Map": [
              [
                {
                  "Text": "vault"
                },
                {
                  "Tag": [
                    132,
                    {
                      "Bytes": [
                        156,
                        218,
                        209,
                        24,
                        136,
                        149,
                        176,
                        128,
                        136,
                        90,
                        100,
                        171,
                        183,
                        26,
                        102,
                        164,
                        164,
                        203,
                        29,
                        129,
                        22,
                        248,
                        9,
                        1,
                        100,
                        31,
                        71,
                        132,
                        87,
                        88,
                        252,
                        4
                      ]
                    }
                  ]
                }
              ]
            ]
          }
        },
        "entity_id": [
          156,
          218,
          209,
          24,
          136,
          149,
          176,
          128,
          136,
          90,
          100,
          171,
          183,
          26,
          102,
          164,
          164,
          203,
          29,
          129
        ],
        "module_name": "TestFaucet",
        "owner_key": "a6534c991a5c034b2f81af809b9577fe6b5425f810de292c0a4d4d43793a8f50",
        "owner_rule": "OwnedBySigner",
        "template_address": "20a814546424dae7496451a170325ddaed52d118e4fcf46c1abd32b3d6ee8163"
      }
    },
    "version": 0
  },
  "address": {
    "substate_id": "component_9cdad1188895b080885a64abb71a66a4a4cb1d8117679d85c8b35a4ec5d02243",
    "version": 0
  }
}
```