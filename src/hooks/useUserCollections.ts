import { useCallback, useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import type { Abi } from 'viem';
import ABI from '../config/ABI.json';
import { ipfsToHttp } from '../lib/utils';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const contractAbi = ABI as unknown as Abi;

interface TokenMetadata {
  name?: string;
  description?: string;
  image?: string;
  [key: string]: unknown;
}

export interface UserNFTMetadata {
  id: number;
  balance: bigint;
  metadata: TokenMetadata | null;
  name?: string;
  description?: string;
  image?: string;
  error?: string;
}

interface UseUserCollectionsOptions {
  fetchMetadata?: boolean;
  refreshIntervalMs?: number;
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
      const nextId = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractAbi,
        functionName: 'nextTokenIdToMint',
        args: [],
      }) as bigint;

      const totalMinted = Number(nextId);
      if (totalMinted === 0) {
        setItems([]);
        setLastUpdated(new Date());
        return;
      }

      const ids: bigint[] = [];
      const accounts: `0x${string}`[] = [];
      for (let i = 0; i < totalMinted; i++) {
        ids.push(BigInt(i));
        accounts.push(address as `0x${string}`);
      }

      const balances = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractAbi,
        functionName: 'balanceOfBatch',
        args: [accounts, ids],
      }) as bigint[];

      const owned: { id: number; balance: bigint }[] = [];
      balances.forEach((b, idx) => {
        if (b && b > BigInt(0)) owned.push({ id: idx, balance: b });
      });

      if (!fetchMetadata) {
        setItems(owned.map(o => ({ id: o.id, balance: o.balance, metadata: null })));
        setLastUpdated(new Date());
        return;
      }

      const concurrency = 5;
      const results: UserNFTMetadata[] = [];
      let idx = 0;

      async function worker() {
        while (true) {
          const currentIndex = idx++;
          if (currentIndex >= owned.length) break;
          const current = owned[currentIndex];
          const base: UserNFTMetadata = {
            id: current.id,
            balance: current.balance,
            metadata: null,
          };
          try {
            if (!publicClient) {
              results.push(base);
              continue;
            }
            const uriRaw = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: contractAbi,
              functionName: 'uri',
              args: [BigInt(current.id)],
            }) as string;

            const uri = ipfsToHttp(uriRaw);
            let json: TokenMetadata | null = null;
            try {
              const res = await fetch(uri);
              if (res.ok) {
                json = await res.json() as TokenMetadata;
              }
            } catch {
              // ignore metadata fetch error
            }
            results.push({
              ...base,
              metadata: json,
              name: json?.name,
              description: json?.description,
              image: json?.image,
            });
          } catch (readErr: unknown) {
            const msg =
              typeof readErr === 'object' && readErr && 'message' in readErr
                ? String((readErr as { message?: unknown }).message)
                : 'Read error';
            results.push({ ...base, error: msg });
          }
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(concurrency, owned.length) }, () => worker()),
      );

      results.sort((a, b) => a.id - b.id);
      setItems(results);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Failed to load user collections';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, fetchMetadata]);

  useEffect(() => {
    load();
  }, [load]);

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
