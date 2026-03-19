//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { IndexerGetTransactionResultResponse } from "@tari-project/ootle-ts-bindings";
import type { TransactionOutcome, FinalizeOutcome } from "@tari-project/ootle";
import { classifyOutcome } from "@tari-project/ootle";
import { openEventStream } from "./event-stream";
import type { IndexerClient } from "@tari-project/indexer-client";

/** Shape of a `TransactionFinalized` SSE event payload from the indexer. */
interface TransactionFinalizedPayload {
  transaction_id: string;
  final_decision: "Commit" | { Abort: unknown };
  fee_decision?: "Commit" | { Abort: unknown };
  abort_details?: string | null;
}

interface PendingWaiter {
  resolve: (outcome: TransactionOutcome) => void;
  reject: (err: Error) => void;
}

/**
 * Subscribes to the indexer's SSE `/events` stream and routes
 * `TransactionFinalized` events to waiting callers.
 *
 * The stream is paused (abort + reconnect deferred) when no transactions are
 * being watched, and resumed on the first new `watch()` call.
 * Mirrors `TransactionWatcher` from the Rust ootle-rs crate.
 *
 * Lifecycle: call `start()` once (idempotent), then obtain
 * `PendingTransaction` handles via `watch()`. Call `stop()` to shut down.
 */
export class TransactionWatcher {
  private readonly baseUrl: string;
  private pending = new Map<string, PendingWaiter>();
  private abortController: AbortController | null = null;
  private loopPromise: Promise<void> | null = null;

  constructor(baseUrl: string) {
    // Normalise: strip trailing slash so we can append /events consistently.
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  }

  /**
   * Starts the background SSE loop (idempotent — safe to call multiple times).
   */
  public start(): void {
    if (this.abortController && !this.abortController.signal.aborted) return;
    this.abortController = new AbortController();
    this.loopPromise = this.run(this.abortController.signal);
  }

  /** Stops the background loop and rejects all pending watchers. */
  public stop(): void {
    this.abortController?.abort();
    const err = new Error("TransactionWatcher stopped");
    for (const waiter of this.pending.values()) {
      waiter.reject(err);
    }
    this.pending.clear();
  }

  /**
   * Returns a `PendingTransaction` that resolves when the network finalises
   * the given transaction ID, or times out and falls back to polling.
   *
   * Automatically starts the watcher loop if it isn't running yet.
   */
  public watch(txId: string, client: IndexerClient, timeoutMs = 32_000): PendingTransaction {
    this.start();
    return new PendingTransaction(txId, this, client, timeoutMs);
  }

  /** Internal: register a waiter for a transaction ID. */
  public register(txId: string): Promise<TransactionOutcome> {
    return new Promise<TransactionOutcome>((resolve, reject) => {
      this.pending.set(txId, { resolve, reject });
    });
  }

  /** Internal: remove a pending waiter (e.g. on timeout) to prevent memory leaks. */
  public unregister(txId: string): void {
    this.pending.delete(txId);
  }

  private async run(signal: AbortSignal): Promise<void> {
    const url = `${this.baseUrl}/events`;

    for await (const event of openEventStream(url, signal)) {
      if (event.type !== "TransactionFinalized") continue;

      const payload = event.data as TransactionFinalizedPayload;
      const waiter = this.pending.get(payload.transaction_id);
      if (!waiter) continue;

      this.pending.delete(payload.transaction_id);

      // Classify the SSE payload directly into a TransactionOutcome.
      // The SSE payload carries final_decision and abort_details but not the full
      // execution_result, so we map the decision variants ourselves rather than
      // delegating to classifyOutcome (which expects the full Finalized structure).
      const decision = payload.final_decision;
      let outcome: TransactionOutcome;

      if (decision === "Commit") {
        outcome = { outcome: "Commit" as FinalizeOutcome };
      } else if (typeof decision === "object" && "Abort" in decision) {
        const reason = payload.abort_details ?? JSON.stringify(decision.Abort);
        outcome = { outcome: "Reject", reason };
      } else {
        waiter.reject(new Error(`Unexpected SSE decision for tx ${payload.transaction_id}: ${JSON.stringify(decision)}`));
        continue;
      }

      waiter.resolve(outcome);
    }
  }
}

/**
 * A handle for a submitted transaction that can be awaited via SSE or
 * polled as a fallback.
 *
 * Mirrors `PendingTransaction` from the Rust ootle-rs crate.
 *
 * @example
 * ```ts
 * const pending = watcher.watch(txId, client);
 * const outcome = await pending.watch();          // SSE-first, poll fallback
 * const receipt = await pending.getReceipt();     // raw indexer response
 * ```
 */
export class PendingTransaction {
  private readonly txId: string;
  private readonly watcher: TransactionWatcher;
  private readonly client: IndexerClient;
  private readonly timeoutMs: number;

  constructor(txId: string, watcher: TransactionWatcher, client: IndexerClient, timeoutMs: number) {
    this.txId = txId;
    this.watcher = watcher;
    this.client = client;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Waits for the transaction to finalise via SSE, falling back to polling
   * if the SSE event doesn't arrive within `timeoutMs`.
   *
   * Returns the `TransactionOutcome` — does NOT throw on `FeeIntentCommit` or
   * `Reject`; the caller decides how to handle each outcome.
   */
  public async watch(): Promise<TransactionOutcome> {
    const ssePromise = this.watcher.register(this.txId);

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), this.timeoutMs);
    });
    const result = await Promise.race([ssePromise, timeoutPromise]);

    if (result !== null) {
      return result;
    }

    // SSE timed out — clean up the pending entry to prevent memory leaks.
    this.watcher.unregister(this.txId);

    // Fall back to a single REST poll.
    return this.pollOnce();
  }

  /**
   * Polls the indexer once for the current transaction result and returns
   * the raw response. Useful for fetching full receipt data after `watch()`.
   */
  public async getReceipt(): Promise<IndexerGetTransactionResultResponse> {
    return this.client.getTransactionResult(this.txId);
  }

  private async pollOnce(): Promise<TransactionOutcome> {
    const POLL_INTERVAL_MS = 500;
    const POLL_DEADLINE = Date.now() + 30_000;

    while (Date.now() < POLL_DEADLINE) {
      const response = await this.client.getTransactionResult(this.txId);
      const outcome = classifyOutcome(response.result);
      if (outcome !== null) return outcome;
      await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    throw new Error(`Transaction ${this.txId} did not finalise within the fallback poll window`);
  }
}
