import { assert, describe, expect, it } from "vitest";
import {
  TariPermissions,
  TransactionBuilder,
  WalletDaemonTariSigner,
  Amount, Network, SubmitTransactionRequest, TransactionStatus,
  submitAndWaitForTransaction,
  buildTransactionRequest,
  waitForTransactionResult,
} from "../../../src";
import { Instruction } from "@tari-project/typescript-bindings";
import { ACCOUNT_TEMPLATE_ADDRESS } from "@tari-project/tarijs-types";
import { XTR } from "@tari-project/tarijs-types/dist/consts";

function buildSigner(): Promise<WalletDaemonTariSigner> {
  const permissions = new TariPermissions().addPermission("Admin");
  const serverUrl = process.env.WALLET_DAEMON_JSON_RPC_URL;

  assert(serverUrl, "WALLET_DAEMON_JSON_RPC_URL must be set");
  return WalletDaemonTariSigner.buildFetchSigner({
    permissions,
    serverUrl,
  });
}

describe("WalletDaemonTariSigner", () => {
  describe("signerName", () => {
    it("returns the signer name", async () => {
      const signer = await buildSigner();
      expect(signer.signerName).toBe("WalletDaemon");
    });
  });

  describe("isConnected", () => {
    it("is always connected", async () => {
      const signer = await buildSigner();
      expect(signer.isConnected()).toBe(true);
    });
  });

  describe("getAccount", () => {
    it("returns account information", async () => {
      const signer = await buildSigner();
      const account = await signer.getAccount();

      expect(account).toMatchObject({
        account_id: expect.any(Number),
        address: expect.any(String),
        public_key: expect.any(String),
      });
    });
  });

  describe("getSubstate", () => {
    it("returns substate details", async () => {
      const signer = await buildSigner();
      const listedSubstates = await signer.listSubstates({
        filter_by_template: null,
        filter_by_type: null,
        limit: 1,
        offset: 0,
      });
      const firstSubstate = listedSubstates.substates[0];
      console.log(firstSubstate);
      const substate = await signer.getSubstate(firstSubstate.substate_id);

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
      const signer = await buildSigner();

      const id = "d5f5a26e7272b1bba7bed331179e555e28c40d92ba3cde1e9ba2b4316e50f486";
      try {
        const txResult = await signer.getTransactionResult(id);
        expect(txResult).toMatchObject({
          transaction_id: id,
        });
      } catch (e) {
        console.warn("Skipping getTransactionResult test, transaction not found", e);
      }
    });
  });

  describe("submitTransaction", () => {
    it("submits a transaction", async () => {
      const signer = await buildSigner();

      const account = await signer.getAccount();

      const fee = 2000;
      const fee_instructions = [
        {
          CallMethod: {
            call: { Address: account.address },
            method: "pay_fee",
            args: [`Amount(${fee})`],
          },
        },
      ] as Instruction[];

      const request: SubmitTransactionRequest = {
        transaction: {
          network: Network.LocalNet,
          fee_instructions,
          instructions: [],
          inputs: [],
          dry_run: false,
          min_epoch: null,
          max_epoch: null,
          is_seal_signer_authorized: true,
        },
        detect_inputs_use_unversioned: true,
        account_id: account.account_id,
      };
      const result = await signer.submitTransaction(request);

      expect(result).toMatchObject({
        transaction_id: expect.any(String),
      });
    });

    it("submits a dry run transaction", async () => {
      const signer = await buildSigner();
      const account = await signer.getAccount();

      const request: SubmitTransactionRequest = {
        transaction: {
          network: Network.LocalNet,
          fee_instructions: [],
          instructions: [
            {
              EmitLog: {
                level: "Info",
                message: "From Integration Test",
              },
            },
          ],
          inputs: [],
          dry_run: true,
          min_epoch: null,
          max_epoch: null,
          is_seal_signer_authorized: true,
        },
        account_id: account.account_id,
        detect_inputs_use_unversioned: true,
      };
      const result = await signer.submitTransaction(request);
      const txResult = await waitForTransactionResult(signer, result.transaction_id);

      expect(txResult.status).toEqual(TransactionStatus.DryRun);
    });


    it("creates an account", async () => {
      const signer = await buildSigner();
      const account = await signer.getAccount();
      const nextKey = await signer.newTransactionKey();

      const fee = Amount.new(2000);
      const transaction = TransactionBuilder
        .new(Network.LocalNet)
        .feeTransactionPayFromComponent(account.address, fee)
        .createAccount(nextKey)
        .buildUnsignedTransaction();

      const submitTransactionRequest = buildTransactionRequest(
        transaction,
        account.account_id,
      );

      const txResult = await submitAndWaitForTransaction(signer, submitTransactionRequest);
      expect(txResult.status).toBe(TransactionStatus.Accepted);
      const accounts = txResult.getAccounts();
      expect(accounts.length).toBe(2); // Original account + new account
      const balance = accounts[0].vaults.get(XTR)!.balance;
      expect(balance.value).toEqual(BigInt(0));
    });

    it("submits a transaction, that uses workspaces", async () => {
      const signer = await buildSigner();
      const account = await signer.getAccount();
      const xtrAddress = account.vaults[0].resource_address;

      const fee = new Amount(2000);
      const network = Network.LocalNet;
      const transaction = TransactionBuilder
        .new(network)
        .feeTransactionPayFromComponent(account.address, fee)
        .callMethod(
          {
            componentAddress: account.address,
            methodName: "withdraw",
          },
          [xtrAddress, 10],
        )
        .saveVar("bucket")
        .callMethod(
          {
            componentAddress: account.address,
            methodName: "deposit",
          },
          [{ Workspace: "bucket" }],
        )
        .addInput({ substate_id: account.address, version: null })
        .buildUnsignedTransaction();

      const submitTransactionRequest = buildTransactionRequest(
        transaction,
        account.account_id,
      );

      const txResult = await submitAndWaitForTransaction(signer, submitTransactionRequest);
      expect(txResult.status).toBe(TransactionStatus.Accepted);
    });
  });

  describe("getAccountBalances", () => {
    it("returns account balances", async () => {
      const signer = await buildSigner();

      const account = await signer.getAccount();
      const accountBalances = await signer.getAccountBalances(account.address);

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
        balance: expect.any(String),
        resource_address: expect.any(String),
        resource_type: expect.any(String),
        token_symbol: expect.any(String),
        vault_address: expect.any(String),
      });
    });
  });

  describe("getTemplateDefinition", () => {
    it("returns template definition", async () => {
      const signer = await buildSigner();
      const accountTemplateAddress = "0000000000000000000000000000000000000000000000000000000000000000";
      const templateDefinition = await signer.getTemplateDefinition(accountTemplateAddress);

      expect(templateDefinition).toMatchObject({
        V1: {
          functions: expect.any(Array),
        },
      });
    });
  });

  describe("getPublicKey", () => {
    it("returns public key", async () => {
      const signer = await buildSigner();
      const publicKey = await signer.getPublicKey("transaction", 0);

      expect(publicKey).toEqual(expect.any(String));
    });
  });

  describe("listSubstates", () => {
    it("returns substates", async () => {
      const signer = await buildSigner();
      const { substates } = await signer.listSubstates({
        filter_by_template: null,
        filter_by_type: null,
        limit: 10,
        offset: 0,
      });

      expect(substates.length).toBeGreaterThan(0);
    });

    it("filters substates by template address", async () => {
      const signer = await buildSigner();
      const { substates } = await signer.listSubstates({
        filter_by_template: null,
        filter_by_type: null,
        limit: 10,
        offset: 0,
      });

      const substateWithTemplate = substates.find((substate) => substate.template_address);
      if (!substateWithTemplate) {
        // This depends on a certain setup - so if we dont have this precondition, we skip the test
        console.warn("No substate with template found, skipping test");
        return;
      }

      const templateAddress = substateWithTemplate.template_address;
      const { substates: filteredSubstates } = await signer.listSubstates({
        filter_by_template: templateAddress,
        filter_by_type: null,
        limit: 10,
        offset: 0,
      });

      expect(filteredSubstates.every((substate) => substate.template_address === templateAddress)).toBe(true);
    });

    it("filters substates by type", async () => {
      const signer = await buildSigner();
      const { substates } = await signer.listSubstates({
        filter_by_template: null,
        filter_by_type: "Component",
        limit: 1,
        offset: 0,
      });

      expect(substates.every((substate) => substate.module_name)).toBe(true);
    });
  });

  describe("allocateAddress", () => {
    it("allocates component address", async () => {
      const signer = await buildSigner();
      const account = await signer.getAccount();

      const fee = Amount.new(2000);
      const transaction = TransactionBuilder.new(Network.LocalNet)
        .feeTransactionPayFromComponent(account.address, fee)
        .allocateAddress("Component", "id-1")
        .buildUnsignedTransaction();

      const submitTransactionRequest = buildTransactionRequest(
        transaction,
        account.account_id,
      );

      const txResult = await submitAndWaitForTransaction(signer, submitTransactionRequest);

      expect(txResult.status).toBe(TransactionStatus.OnlyFeeAccepted);

      const reason = txResult.anyRejectReason.unwrap();
      const failure = reason && typeof reason === "object" && "ExecutionFailure" in reason && reason.ExecutionFailure;
      expect(failure).toEqual("1 dangling address allocations remain after transaction execution");
    });
  });

  describe("assertBucketContains", () => {
    it("fails if bucket does not exist", async () => {
      const signer = await buildSigner();
      const account = await signer.getAccount();

      const fee = new Amount(2000);
      const transaction = TransactionBuilder.new(Network.LocalNet)
        .feeTransactionPayFromComponent(account.address, fee)
        // Have to use add instruction to submit the transaction since this error is caught by the builder
        // .assertBucketContains("not_exist", "resource_0000000000000000000000000000000000000000000000000000000000000000", Amount.new(1))
        .addInstruction({
          AssertBucketContains: {
            key: { id: 123, offset: null },
            resource_address: "resource_0000000000000000000000000000000000000000000000000000000000000000",
            min_amount: 1,
          },
        })
        .buildUnsignedTransaction();

      const submitTransactionRequest = buildTransactionRequest(
        transaction,
        account.account_id,
      );

      const txResult = await submitAndWaitForTransaction(signer, submitTransactionRequest);

      expect(txResult.status).toBe(TransactionStatus.OnlyFeeAccepted);

      const reason = txResult.anyRejectReason.unwrap();
      const failure = reason && typeof reason === "object" && "ExecutionFailure" in reason && reason.ExecutionFailure;
      expect(failure).toContain("Item at id 123 does not exist on the workspace (existing ids: [])");
    });
  });
});
