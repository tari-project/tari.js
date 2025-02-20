---
sidebar_position: 5
---

# CallMethod

`callMethod` calls a method on an instance of a template—in other words, on a component.

```js
const amount = 10;
const tokenResource = "resource_217d58767480fbaa48693e11de34baf7fd727e33ee7627f0c4e5b78def378e57";
  
builder = builder.callMethod({
    componentAddress: account.address,
    methodName: "withdraw",
}, [tokenResource, amount.toString()]);
```
