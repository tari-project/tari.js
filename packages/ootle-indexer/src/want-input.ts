//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { SubstateRequirement } from "@tari-project/ootle-ts-bindings";
import type { IndexerClient } from "./transport/indexer-client";

/**
 * Lazily describes an input the transaction needs, resolved by querying the indexer.
 * Mirrors `WantInput` from the Rust ootle-rs crate.
 *
 * - `VaultForResource` — find the vault component that holds the given resource address.
 * - `SpecificSubstate` — resolve a specific substate by ID (same as `resolveInputs` but
 *   deferred until `resolveWantInputs` is called).
 */
export type WantInput =
  | { type: "VaultForResource"; resourceAddress: string }
  | { type: "SpecificSubstate"; substateId: string; version?: number | null };

/**
 * Resolves a list of `WantInput` descriptors by querying the indexer, returning
 * fully-versioned `SubstateRequirement` objects ready to attach to a transaction.
 *
 * Mirrors `TransactionInputResolver` from the Rust ootle-rs crate.
 */
export async function resolveWantInputs(
  client: IndexerClient,
  wants: WantInput[],
): Promise<SubstateRequirement[]> {
  return Promise.all(
    wants.map(async (want): Promise<SubstateRequirement> => {
      if (want.type === "SpecificSubstate") {
        if (want.version != null) {
          return { substate_id: want.substateId, version: want.version };
        }
        const substate = await client.substatesGet(want.substateId, {
          version: null,
          local_search_only: false,
        });
        return { substate_id: want.substateId, version: substate.version };
      }

      // VaultForResource: list substates filtered by the resource template and
      // find the vault component that owns this resource.
      const result = await client.listSubstates({
        filter_by_template: null,
        filter_by_type: "Vault",
        limit: null,
        offset: null,
      });

      const match = result.substates.find(
        (s) => s.template_address === want.resourceAddress || s.substate_id.includes(want.resourceAddress),
      );

      if (!match) {
        throw new Error(`Could not find a vault for resource address: ${want.resourceAddress}`);
      }

      return { substate_id: match.substate_id, version: match.version };
    }),
  );
}
