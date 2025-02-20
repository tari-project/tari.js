---
sidebar_position: 8
---

# Raw instructions

Sometimes the functionality of the *Transaction Builder* is insufficient, and you might need to execute one of the raw [instructions](./instruction.md). In that case, use the `addInstruction` method:

```js
builder = builder.addInstruction({
  EmitLog: {
    level: "Info",
    message: "Test log",
  },
});
```
