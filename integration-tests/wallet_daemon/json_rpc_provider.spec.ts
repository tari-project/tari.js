import { assert, describe, expect, it } from "vitest";

import { SubmitTransactionRequest, TariPermissions, WalletDaemonTariProvider } from "../../src";

function buildProvider(): Promise<WalletDaemonTariProvider> {
  const permissions = new TariPermissions().addPermission("Admin");
  const serverUrl = process.env.WALLET_DAEMON_JSON_RPC_URL;
  assert(serverUrl, "WALLET_DAEMON_JSON_RPC_URL must be set");
  return WalletDaemonTariProvider.buildFetchProvider({
    permissions,
    serverUrl,
  });
}

describe("WalletDaemonTariProvider", () => {
  describe("providerName", () => {
    it("returns the provider name", async () => {
      const provider = await buildProvider();
      expect(provider.providerName).toBe("WalletDaemon");
    });
  });

  describe("isConnected", () => {
    it("is always connected", async () => {
      const provider = await buildProvider();
      expect(provider.isConnected()).toBe(true);
    });
  });

  describe("getAccount", () => {
    it("returns account information", async () => {
      const provider = await buildProvider();
      const account = await provider.getAccount();

      expect(account).toMatchObject({
        account_id: expect.any(Number),
        address: expect.any(String),
        public_key: expect.any(String),
      });
    });
  });

  describe("getSubstate", () => {
    it("returns substate details", async () => {
      const provider = await buildProvider();
      const listedSubstates = await provider.listSubstates(null, null, 1, 0);
      const firstSubstate = listedSubstates.substates[0];
      const substate = await provider.getSubstate(firstSubstate.substate_id);

      expect(substate).toMatchObject({
        value: expect.any(Object),
        address: {
          substate_id: firstSubstate.substate_id,
          version: firstSubstate.version,
        },
      });
    });
  });

  describe("getTransactionResult", () => {
    it("returns transaction result", async () => {
      const provider = await buildProvider();

      const id = "d5f5a26e7272b1bba7bed331179e555e28c40d92ba3cde1e9ba2b4316e50f486";
      const txResult = await provider.getTransactionResult(id);
      expect(txResult).toMatchObject({
        transaction_id: id,
      });
    });
  });

  describe("submitTransaction", () => {
    it("submits a transaction", async () => {
      const provider = await buildProvider();

      const account = await provider.getAccount();

      const fee = 2000;
      const fee_instructions = [
          {
              CallMethod: {
                  component_address: account.address,
                  method: "pay_fee",
                  args: [`Amount(${fee})`]
              }
          }
      ];
      
      const request: SubmitTransactionRequest = {
        network: 0x10, // LocalNet
        account_id: account.account_id,
        fee_instructions,
        instructions: [],
        inputs: [],
        input_refs: [],
        required_substates: [],
        is_dry_run: false,
        min_epoch: null,
        max_epoch: null,
        is_seal_signer_authorized: true,
        detect_inputs_use_unversioned: true,
      };
      const result = await provider.submitTransaction(request);

      expect(result).toMatchObject({
        transaction_id: expect.any(String),
      });
    });
  });

  describe("getAccountBalances", () => {
    it("returns account balances", async () => {
      const provider = await buildProvider();

      const account = await provider.getAccount();
      const accountBalances = await provider.getAccountBalances(account.address);

      expect(accountBalances).toHaveProperty("address");

      assert(
        accountBalances &&
          typeof accountBalances === "object" &&
          "balances" in accountBalances &&
          accountBalances.balances,
        "accountBalances is not an object",
      );
      assert(Array.isArray(accountBalances.balances), "accountBalances.balances is not an array");
      expect(accountBalances.balances.length).toBeGreaterThan(0);

      expect(accountBalances.balances[0]).toMatchObject({
        balance: expect.any(Number),
        resource_address: expect.any(String),
        resource_type: expect.any(String),
        token_symbol: expect.any(String),
        vault_address: expect.any(String),
      });
    });
  });

  describe("getTemplateDefinition", () => {
    it("returns template definition", async () => {
      const provider = await buildProvider();
      const accountTemplateAddress = "0000000000000000000000000000000000000000000000000000000000000000";
      const templateDefinition = await provider.getTemplateDefinition(accountTemplateAddress);

      expect(templateDefinition).toMatchObject({
        V1: {
          functions: expect.any(Array),
        }
      });
    });
  });

  describe("getPublicKey", () => {
    it("returns public key", async () => {
      const provider = await buildProvider();
      const publicKey = await provider.getPublicKey("transaction", 0);

      expect(publicKey).toEqual(expect.any(String));
    });
  });

  describe("listSubstates", () => {
    it("returns substates", async () => {
      const provider = await buildProvider();
      const { substates } = await provider.listSubstates(null, null, 10, 0);

      expect(substates.length).toBeGreaterThan(0);
    });

    it("filters substates by template address", async () => {
      const provider = await buildProvider();
      const { substates } = await provider.listSubstates(null, null, 10, 0);

      const substateWithTemplate = substates.find((substate) => substate.template_address);
      assert(substateWithTemplate, "No substate with template found");

      const templateAddress = substateWithTemplate.template_address
      const { substates: filteredSubstates } = await provider.listSubstates(templateAddress, null, 10, 0);

      expect(filteredSubstates.every((substate) => substate.template_address === templateAddress)).toBe(true);
    });

    it("filters substates by type", async () => {
      const provider = await buildProvider();
      const { substates } = await provider.listSubstates(null, "Component", 10, 0);

      expect(substates.every((substate) => substate.module_name)).toBe(true);
    });
  });
});
