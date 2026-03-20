//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import { Network } from "../network";

/**
 * Returns a known default indexer URL for the given network.
 * Mirrors `default_indexer_url()` from the Rust ootle-rs crate.
 *
 * Throws for networks where no default URL is configured.
 */
export function defaultIndexerUrl(network: Network): string {
  switch (network) {
    case Network.LocalNet:
      return "http://localhost:12500";
    case Network.Esmeralda:
      return "https://ootle-indexer-a.tari.com";
    case Network.MainNet:
      throw new Error("No default indexer URL configured for MainNet");
    case Network.StageNet:
      throw new Error("No default indexer URL configured for StageNet");
    case Network.NextNet:
      throw new Error("No default indexer URL configured for NextNet");
    case Network.Igor:
      throw new Error("No default indexer URL configured for Igor");
  }
}
