---
sidebar_position: 2
---

# Tari Universe provider

This provider is designed for building Tari Universe apps.

## Install required dependencies

```bash npm2yarn
npm install @tari-project/tari-universe-provider @tari-project/tari-permissions
```

## Establish the connection

```js
import { TariPermissions } from "@tari-project/tari-permissions";
import { TariUniverseProvider } from "@tari-project/tari-universe-provider";

const permissions = new TariPermissions().addPermission("Admin");
const optionalPermissions = new TariPermissions();
const provider = new TariUniverseProvider({
  permissions,
  optionalPermissions,
});
```
