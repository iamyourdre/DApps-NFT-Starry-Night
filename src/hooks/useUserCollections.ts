import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import ABI from '../config/ABI.json';
import { ipfsToHttp } from '../lib/utils';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export interface UserNFTMetadata {
  id: number;
  balance: bigint;
  // Raw fetched JSON (standard ERC1155 metadata fields)
  metadata: any;
  name?: string;
  description?: string;
  image?: string;
}

interface UseUserCollectionsOptions {
  fetchMetadata?: boolean; // default true
  refreshIntervalMs?: number; // optional auto refresh
}

export function useUserCollections(options: UseUserCollectionsOptions = {}) {
  const { fetchMetadata = true, refreshIntervalMs } = options;
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [items, setItems] = useState<UserNFTMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!address || !publicClient || !CONTRACT_ADDRESS) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Get nextTokenIdToMint to know range of token IDs
      const nextId = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI as any,
        functionName: 'nextTokenIdToMint',
        args: [],
      }) as bigint;

      const totalMinted = Number(nextId); // token ids are 0..nextId-1
      if (totalMinted === 0) {
        setItems([]);
        setLastUpdated(new Date());
        return;
      }

      // 2. Build arrays for balanceOfBatch
      const ids: bigint[] = [];
      const accounts: `0x${string}`[] = [];
      for (let i = 0; i < totalMinted; i++) {
        ids.push(BigInt(i));
        accounts.push(address as `0x${string}`);
      }

      const balances = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI as any,
        functionName: 'balanceOfBatch',
        args: [accounts, ids],
      }) as bigint[];

      // 3. Filter owned ids
      const owned: { id: number; balance: bigint }[] = [];
      balances.forEach((b, idx) => {
        if (b && b > BigInt(0)) owned.push({ id: idx, balance: b });
      });

      if (!fetchMetadata) {
        setItems(owned.map(o => ({ id: o.id, balance: o.balance, metadata: null })));
        setLastUpdated(new Date());
        return;
      }

      // 4. Fetch metadata URIs for owned ids concurrently (limit concurrency if large)
      const concurrency = 5;
      const results: UserNFTMetadata[] = [];
      let index = 0;

      async function worker() {
        while (index < owned.length) {
          const current = owned[index++];
          try {
            if (!publicClient) return; // safety
            const uriRaw = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: ABI as any,
              functionName: 'uri',
              args: [BigInt(current.id)],
            }) as string;
            const uri = ipfsToHttp(uriRaw);
            let json: any = null;
            try {
              const res = await fetch(uri);
              json = await res.json();
            } catch (fetchErr) {
              // ignore fetch error; still return minimal item
            }
            results.push({
              id: current.id,
              balance: current.balance,
              metadata: json,
              name: json?.name,
              description: json?.description,
              image: json?.image,
            });
          } catch (innerErr) {
            // push partial entry
            results.push({ id: current.id, balance: current.balance, metadata: null });
          }
        }
      }

      const workers = Array.from({ length: Math.min(concurrency, owned.length) }, () => worker());
      await Promise.all(workers);

      // Preserve original order (sort by id)
      results.sort((a, b) => a.id - b.id);
      setItems(results);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message || 'Failed to load user collections');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, fetchMetadata]);

  // Initial + address change
  useEffect(() => {
    load();
  }, [load]);

  // Optional polling
  useEffect(() => {
    if (!refreshIntervalMs) return;
    const id = setInterval(load, refreshIntervalMs);
    return () => clearInterval(id);
  }, [refreshIntervalMs, load]);

  return {
    items,
    loading,
    error,
    refresh: load,
    lastUpdated,
    isConnected: !!address,
  };
}
