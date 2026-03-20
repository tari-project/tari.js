import { useState, useCallback } from "react";
import { ProviderBuilder, IndexerProvider, IndexerClient } from "@tari-project/ootle-indexer";
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
 * Uses `ProviderBuilder` to construct the provider fluently. The builder
 * verifies connectivity (fetches indexer identity) before resolving.
 *
 * Usage:
 *   const { status, connect, getSubstate, listSubstates } = useIndexer()
 *   await connect("http://localhost:18300", Network.LocalNet)
 */
export function useIndexer() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [provider, setProvider] = useState<IndexerProvider | null>(null);
  const [client, setClient] = useState<IndexerClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (url: string, network: Network) => {
    setStatus("connecting");
    setError(null);
    try {
      const p = await ProviderBuilder.new().withNetwork(network).withUrl(url.trim()).connect();
      setProvider(p);
      const c = p?.getClient();
      setClient(c);
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

  const getIndexerInfo = useCallback(async () => {
    const networkInfo = await client?.networkInfo();
    const connections = await client?.getConnections();

    return { ...networkInfo, ...connections };
  }, [client]);

  return { status, provider, error, connect, disconnect, getSubstate, getIndexerInfo };
}
