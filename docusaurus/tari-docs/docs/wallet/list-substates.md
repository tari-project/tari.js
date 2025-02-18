---
sidebar_position: 3
---

# List substates

In the Tari network, substates are discrete units of state within the Tari Digital Assets Network. Each substate encapsulates a specific piece of data—such as ownership records, smart contract states, or asset balances.  
Substates follow a create-spend lifecycle, meaning they are created, referenced, and eventually consumed or modified according to network rules.

You can query substates using the `listSubstates` method of a `TariProvider`.

```ts
listSubstates(
  filter_by_template: string | null,
  filter_by_type: SubstateType | null,
  limit: number | null,
  offset: number | null
): Promise<ListSubstatesResponse>;
```


## List by template

```js
const accountTemplate = "0000000000000000000000000000000000000000000000000000000000000000";
const accountSubstates = await provider.listSubstates(accountTemplate, null, 1, 0);
```

The result could be similar to:

```json
{
  "substates": [
    {
      "substate_id": "component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710",
      "module_name": "Account",
      "version": 3,
      "template_address": "0000000000000000000000000000000000000000000000000000000000000000"
    }
  ]
}
```

## List by substate type

```js
const accountSubstatesByType = await provider.listSubstates(null, "Component", 2, 0);
```

Output:

```json
{
  "substates": [
    {
      "substate_id": "component_24b679b98056c7ca7e3d9f9266fec928c7f29d35e7aec546ed69f532aff40710",
      "module_name": "Account",
      "version": 3,
      "template_address": "0000000000000000000000000000000000000000000000000000000000000000"
    },
    {
      "substate_id": "component_1120a9ce46a820a955580cd7d07ee6b93a2ce16ee1671e4dcefd72dfbd33a168",
      "module_name": "TariswapIndex",
      "version": 1,
      "template_address": "60041a6b62a9aa5dbbcc99d8be3ac59765f619c522fd387906dd30c9a9a78d3f"
    }
  ]
}
```