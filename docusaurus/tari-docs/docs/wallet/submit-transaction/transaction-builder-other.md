---
sidebar_position: 2
---

# Other functionality

## callFunction

`callFunction` can be used to create instances of components or call other _static_ methods.

```js
  builder = builder.callFunction(
    {
      templateAddress: componentTemplate,
      functionName: "new",
    },
    []
  );
```