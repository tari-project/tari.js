import { assert, describe, expect, it } from "vitest";

import {
  buildTransactionRequest,
  Network,
  submitAndWaitForTransaction,
  SubmitTransactionRequest,
  TariPermissions,
  TransactionBuilder,
  TransactionStatus,
  waitForTransactionResult,
  WalletDaemonTariSigner,
} from "../../../src";
import { Instruction } from "@tari-project/typescript-bindings";
import { Amount } from "@tari-project/tarijs-types";

const NETWORK = Network.LocalNet;

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
      const txResult = await signer.getTransactionResult(id);
      expect(txResult).toMatchObject({
        transaction_id: id,
      });
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
          network: NETWORK,
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
          network: NETWORK,
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

      expect(txResult.finalizedTxStatus).toEqual(TransactionStatus.DryRun);
    });

    it("submits a transaction, that uses workspaces", async () => {
      const workspaceId = "bucket";
      const signer = await buildSigner();
      const account = await signer.getAccount();
      const xtrAddress = account.resources[0].resource_address;

      const fee = new Amount(2000);
      const network = NETWORK;
      const builder = new TransactionBuilder(network);
      builder.feeTransactionPayFromComponent(account.address, fee.getStringValue());

      builder.callMethod(
        {
          componentAddress: account.address,
          methodName: "withdraw",
        },
        [xtrAddress, 10],
      );
      builder.saveVar(workspaceId);
      builder.callMethod(
        {
          componentAddress: account.address,
          methodName: "deposit",
        },
        [workspaceId],
      );
      builder.addInput({ substate_id: account.address, version: null });
      const transaction = builder.buildUnsignedTransaction();

      const submitTransactionRequest = buildTransactionRequest(transaction, account.account_id);

      const txResult = await submitAndWaitForTransaction(signer, submitTransactionRequest);
      expect(txResult.finalizedTxStatus).toBe(TransactionStatus.Accepted);
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
      assert(substateWithTemplate, "No substate with template found");

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

      const fee = new Amount(2000);
      const builder = new TransactionBuilder(NETWORK);
      builder.feeTransactionPayFromComponent(account.address, fee.getStringValue());
      builder.allocateAddress("Component", "id-1");
      const transaction = builder.buildUnsignedTransaction();

      const submitTransactionRequest = buildTransactionRequest(transaction, account.account_id);

      const txResult = await submitAndWaitForTransaction(signer, submitTransactionRequest);

      expect(txResult.finalizedTxStatus).toBe(TransactionStatus.OnlyFeeAccepted);

      const executionResult = txResult.result;
      const reason =
        executionResult && "AcceptFeeRejectRest" in executionResult && executionResult.AcceptFeeRejectRest[1];
      const failure = reason && typeof reason === "object" && "ExecutionFailure" in reason && reason.ExecutionFailure;
      expect(failure).toEqual("1 dangling address allocations remain after transaction execution");
    });
  });

  describe("assertBucketContains", () => {
    it("fails if bucket does not exist", async () => {
      const signer = await buildSigner();
      const account = await signer.getAccount();

      const fee = new Amount(2000);
      const builder = new TransactionBuilder(NETWORK);
      builder.feeTransactionPayFromComponent(account.address, fee.getStringValue());
      builder.assertBucketContains(
        "not_exist",
        "resource_0000000000000000000000000000000000000000000000000000000000000000",
        Amount.newAmount(1).getValue(),
      );
      const transaction = builder.buildUnsignedTransaction();

      const submitTransactionRequest = buildTransactionRequest(transaction, account.account_id);

      const txResult = await submitAndWaitForTransaction(signer, submitTransactionRequest);

      expect(txResult.finalizedTxStatus).toBe(TransactionStatus.OnlyFeeAccepted);

      const executionResult = txResult.result;
      const reason =
        executionResult && "AcceptFeeRejectRest" in executionResult && executionResult.AcceptFeeRejectRest[1];
      const failure = reason && typeof reason === "object" && "ExecutionFailure" in reason && reason.ExecutionFailure;
      expect(failure).toContain("Item at id 0 does not exist on the workspace");
    });
  });
});
