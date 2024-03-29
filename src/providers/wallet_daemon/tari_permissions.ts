export class Hash {
  private value: number[];
  constructor(value: number[]) {
    this.value = value;
  }
  toJSON() {
    return this.value;
  }
}

export enum TAG {
  ComponentAddress = 128,
  Metadata = 129,
  NonFungibleAddress = 130,
  ResourceAddress = 131,
  VaultId = 132,
  TransactionReceipt = 134,
  FeeClaim = 135,
}

export class Tagged {
  private value: any;
  private tag: number;
  constructor(tag: number, value: any) {
    this.tag = tag;
    this.value = value;
  }
  toJSON() {
    return { "@@TAGGED@@": [this.tag, this.value] }
  }
}


export class ResourceAddress {
  private tagged: Tagged;
  constructor(hash: Hash) {
    this.tagged = new Tagged(TAG.ResourceAddress, hash);
  }
  toJSON() {
    return this.tagged.toJSON();
  }
}

export class UnclaimedConfidentialOutputAddress {
  private hash: Hash;
  constructor(hash: Hash) {
    this.hash = hash;
  }
  toJSON() {
    return this.hash.toJSON();
  }
}

export type u64 = number;
export type u32 = number;
export class U256 {
  private value: number[];
  constructor(value: number[]) {
    this.value = value;
  }
  toJSON() {
    return this.value;
  }
}

export type NonFungibleIdType = u32 | u64 | string | U256;

export class NonFungibleId {
  private value: NonFungibleIdType;
  constructor(value: NonFungibleIdType) {
    this.value = value;
  }
  toJSON() {
    switch (typeof this.value) {
      case 'string':
        return { 'string': this.value };
      case 'number':
        return { 'Uint64': this.value };
    }
    return { 'U256': this.value };
  }
}

export class NonFungibleAddressContents {
  private resource_address: ResourceAddress;
  private id: NonFungibleId;
  constructor(resource_address: ResourceAddress, id: NonFungibleId) {
    this.resource_address = resource_address;
    this.id = id;
  }
  toJSON() {
    return { "resource_address": this.resource_address, "id": this.id }
  }
}

export class NonFungibleAddress {
  private tagged: Tagged;
  constructor(value: NonFungibleAddressContents) {
    this.tagged = new Tagged(TAG.NonFungibleAddress, value)
  }
  toJSON() {
    return this.tagged.toJSON();
  }
}

export class NonFungibleIndexAddress {
  private resource_address: ResourceAddress;
  private index: number;
  constructor(resource_address: ResourceAddress, index: number) {
    this.resource_address = resource_address;
    this.index = index;
  }
  toJSON() {
    return { "resource_address": this.resource_address, "index": this.index }
  }
}

export class ComponentAddress {
  private tagged: Tagged;
  constructor(hash: Hash) {
    this.tagged = new Tagged(TAG.ComponentAddress, hash);
  }
  toJSON() {
    return this.tagged.toJSON()
  }
}

export class VaultId {
  private tagged: Tagged;
  constructor(hash: Hash) {
    this.tagged = new Tagged(TAG.VaultId, hash);
  }
  toJSON() {
    return this.tagged.toJSON()
  }
}

export type SubstateAddressType = ResourceAddress | ComponentAddress | VaultId | UnclaimedConfidentialOutputAddress | NonFungibleAddress | NonFungibleIndexAddress;


export class SubstateAddress {
  private value: SubstateAddressType;
  constructor(value: SubstateAddressType) {
    this.value = value;
  }
  toJSON() {
    if (this.value instanceof ComponentAddress) {
      return { "Component": this.value }
    } else if (this.value instanceof ResourceAddress) {
      return { "Resource": this.value }
    } else if (this.value instanceof VaultId) {
      return { "Vault": this.value }
    } else if (this.value instanceof UnclaimedConfidentialOutputAddress) {
      return { "UnclaimedConfidentialOutput": this.value }
    } else if (this.value instanceof NonFungibleAddress) {
      return { "NonFungible": this.value }
    } else if (this.value instanceof NonFungibleIndexAddress) {
      return { "NonFungibleIndex": this.value }
    }
    throw "Unknown type"
  }
}

export class TariPermissionAccountBalance {
  private value: SubstateAddress;
  constructor(value: SubstateAddress) {
    this.value = value;
  }
  toJSON() {
    console.log("stringify", this.value)
    return { "AccountBalance": this.value }
  }
}

export class TariPermissionAccountInfo {
  constructor() {}
  toJSON() {
    return "AccountInfo"
  }
}

export class TariPermissionAccountList {
  private value?: ComponentAddress | null;
  constructor(value?: ComponentAddress) {
    if (value === undefined) {
      this.value = null;
    } else {
      this.value = value;
    }
  }
  toJSON() {
    console.log('JSON TariPermissionAccountList', this.value)
    if (this.value === undefined) {
      return { "AccountList": null }
    } else {
      return { "AccountList": this.value }
    }
  }
}

export class TariPermissionKeyList {
  constructor() {}
  toJSON() {
    return "KeyList"
  }
}

export class TariPermissionTransactionGet {
  constructor() {}
  toJSON() {
    return "TransactionGet"
  }
}
export class TariPermissionTransactionSend {
  private value?: SubstateAddress;
  constructor(value?: SubstateAddress) {
    this.value = value;
  }
  toJSON() {
    console.log('JSON TariPermissionTransactionSend', this.value)
    if (this.value === undefined) {
      return { "TransactionSend": null }
    } else {
      return { "TransactionSend": this.value }
    }
  }
}

export class TariPermissionGetNft {
  private value0?: SubstateAddress;
  private value1?: ResourceAddress;
  constructor(value0?: SubstateAddress, value1?: ResourceAddress) {
    this.value0 = value0;
    this.value1 = value1;
  }
  toJSON() {
    return { "GetNft": [this.value0, this.value1] }
  }
}

export class TariPermissionNftGetOwnershipProof {
  private value?: ResourceAddress;
  constructor(value?: ResourceAddress) {
    this.value = value;
  }
  toJSON() {
    return { "NftGetOwnershipProof": this.value }
  }
}

export class TariPermissionTransactionsGet {
  constructor() {}
  toJSON() {
    return "TransactionGet"
  }
}

export class TariPermissionSubstatesRead {
  constructor() {}
  toJSON() {
    return "SubstatesRead"
  }
}

export class TariPermissionTemplatesRead {
  constructor() {}
  toJSON() {
    return "TemplatesRead"
  }
}

export type TariPermission = TariPermissionNftGetOwnershipProof | TariPermissionAccountBalance | TariPermissionAccountInfo | TariPermissionAccountList | TariPermissionKeyList | TariPermissionTransactionGet | TariPermissionTransactionSend | TariPermissionGetNft | TariPermissionTransactionsGet | TariPermissionSubstatesRead | TariPermissionTemplatesRead | string;

// export enum TariPermission {
//   AccountBalance = "AccountBalance",
//   AccountInfo = "AccountInfo",
//   AccountList = "AccountList",
//   KeyList = "KeyList",
//   TransactionGet = "TransactionGet",
//   TransactionSend = "TransactionSend",
//   GetNft = "GetNft",
//   NftGetOwnershipProof = "NftGetOwnershipProof",
//   TransactionsGet = "TransactionsGet",
//   SubstatesRead = "SubstatesRead",
//   TemplatesRead = "TemplatesRead",
// }

export class TariPermissions {
  private permissions: TariPermission[];

  constructor() {
    this.permissions = []
  }

  addPermission(permission: TariPermission): this {
    this.permissions.push(permission);
    return this;
  }

  addPermissions(other: TariPermissions): this {
    this.permissions.push(...other.permissions);
    return this;
  }

  toJSON() {
    return this.permissions;
  }
}

// TariPermissionType.prototype.toString = function () {
//   return "wtf"
// }
