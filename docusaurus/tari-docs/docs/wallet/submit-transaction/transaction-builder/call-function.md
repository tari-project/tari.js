---
sidebar_position: 5
---

# CallFunction

`callFunction` can be used to create instances of components or call other *static* methods.

```js
builder = builder.callFunction(
  {
    templateAddress,
    functionName: "new",
  },
  [1, 2, 3]
);
```
