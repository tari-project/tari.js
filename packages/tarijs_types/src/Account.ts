import { BigAmount, ResourceAddress, ResourceType, Vault, VaultId } from "@tari-project/typescript-bindings";

export interface BuiltInAccount {
  vaults: Map<ResourceAddress, AccountVault>;
}

export class AccountVault {
  private vaultId: VaultId;
  private vault: Vault;

  constructor(vaultId: VaultId, vault: Vault) {
    this.vaultId = vaultId;
    this.vault = vault;
  }

  public static new(vaultId: VaultId, vault: Vault): AccountVault {
    return new AccountVault(vaultId, vault);
  }

  public get id(): VaultId {
    return this.vaultId;
  }

  public get rawVault(): Vault {
    return this.vault;
  }

  public get resourceType(): ResourceType {
    if ("Fungible" in this.vault.resource_container) {
      return "Fungible";
    }
    if ("NonFungible" in this.vault.resource_container) {
      return "NonFungible";
    }
    if ("Confidential" in this.vault.resource_container) {
      return "Confidential";
    }
    throw new Error("Unknown resource type in vault");
  }

  public get balance(): BigAmount {
    if ("Fungible" in this.vault.resource_container) {
      return BigAmount.from(this.vault.resource_container.Fungible.amount);
    }
    if ("NonFungible" in this.vault.resource_container) {
      return BigAmount.from(this.vault.resource_container.NonFungible.token_ids.length);
    }
    if ("Confidential" in this.vault.resource_container) {
      return BigAmount.from(this.vault.resource_container.Confidential.revealed_amount);
    }
    throw new Error("Unknown resource type in vault");
  }

  public get resourceAddress(): ResourceAddress {
    if ("Fungible" in this.vault.resource_container) {
      return this.vault.resource_container.Fungible.address;
    }
    if ("NonFungible" in this.vault.resource_container) {
      return this.vault.resource_container.NonFungible.address;
    }
    if ("Confidential" in this.vault.resource_container) {
      return this.vault.resource_container.Confidential.address;
    }
    throw new Error("Unknown resource type in vault");
  }

  // TODO: add other quality of life helpers e.g balances
}