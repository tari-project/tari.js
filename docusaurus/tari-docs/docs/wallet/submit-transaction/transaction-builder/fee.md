---
sidebar_position: 4
---

# Fee

Executing a transaction requires a fee. This fee can originate from sources other than the transaction sender's account.

```js
const account = await provider.getAccount();
const fee = new Amount(2000);
builder = builder
  .feeTransactionPayFromComponent(account.address, fee.getStringValue());
```

Under the hood, `feeTransactionPayFromComponent` creates an instruction that calls the `pay_fee` method on a component.

```js
builder.addFeeInstruction({
  CallMethod: {
    component_address: componentAddress,
    method: "pay_fee",
    args: [maxFee],
  },
});
```

You might need to take this explicit route if the fee payment method is named something other than `pay_fee`.
