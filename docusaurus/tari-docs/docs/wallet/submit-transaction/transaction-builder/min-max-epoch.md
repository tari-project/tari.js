---
sidebar_position: 7
---

# WithMinEpoch / WithMaxEpoch

In some circumstances, it is important to limit the time window during which a transaction is valid for execution. These bounds can be specified using `withMinEpoch` and `withMaxEpoch`.

## withMinEpoch

```js
builder = builder.withMinEpoch(2);
```

## withMaxEpoch

```js
builder = builder.withMaxEpoch(10000);
```