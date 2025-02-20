---
sidebar_position: 7
---

# SaveVar / FromWorkspace

## saveVar

```js
builder = builder
  .callMethod(
    {
      componentAddress: account.address,
      methodName: "withdraw",
    },
    [tokenResource, amount.toString()],
  )
  .saveVar("bucket")
```

This saves the result of the `withdraw` instruction to the intermediate variable `bucket`, which can later be accessed using `fromWorkspace`.

## fromWorkspace

```js
builder = builder
  .callMethod(
    {
      componentAddress: account.address,
      methodName: "deposit",
    },
    [fromWorkspace("bucket")],
  );
```

It is important to note that some methods may return *multiple values*, and you might want to access them separately.
In that case, you can address them using `.0`, `.1`, and so on.

```js
builder = builder
  .callMethod(
    {
      componentAddress: poolComponent,
      methodName: "remove_liquidity",
    },
    [fromWorkspace("tokens_lp")]
  )
  .saveVar("buckets")
  .callMethod(
    {
      componentAddress: account.address,
      methodName: "deposit",
    },
    [fromWorkspace("buckets.0")]
  )
  .callMethod(
    {
      componentAddress: account.address,
      methodName: "deposit",
    },
    [fromWorkspace("buckets.1")]
  );
```