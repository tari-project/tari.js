import { useState, useCallback } from "react";
import { IndexerProvider } from "@tari-project/ootle-indexer";
import { Network } from "@tari-project/ootle";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

export interface SubstateEntry {
  substate_id: string;
  module_name: string | null;
  version: number;
  template_address: string | null;
  timestamp: string;
}

/**
 * Manages a read-only connection to an Ootle indexer.
 *
 * IndexerProvider.connect() fetches the indexer identity to verify the URL
 * is reachable before returning. All subsequent calls go through the provider.
 *
 * Usage:
 *   const { status, connect, getSubstate, listSubstates } = useIndexer()
 *   await connect("http://localhost:18300", Network.LocalNet)
 */
export function useIndexer() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [provider, setProvider] = useState<IndexerProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (url: string, network: Network) => {
    setStatus("connecting");
    setError(null);
    try {
      const p = await IndexerProvider.connect({ url: url.trim(), network });
      setProvider(p);
      setStatus("connected");
    } catch (err) {
      setStatus("disconnected");
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setStatus("disconnected");
    setError(null);
  }, []);

  const getSubstate = useCallback(
    async (substateId: string) => {
      if (!provider) throw new Error("Not connected");
      return provider.getSubstate(substateId);
    },
    [provider],
  );

  const listSubstates = useCallback(
    async (opts: { filterByType?: string; limit?: number } = {}) => {
      if (!provider) throw new Error("Not connected");
      return provider.listSubstates({
        filterByType: opts.filterByType,
        limit: opts.limit ?? 20,
      });
    },
    [provider],
  );

  return { status, provider, error, connect, disconnect, getSubstate, listSubstates };
}
