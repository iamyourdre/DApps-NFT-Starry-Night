import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePublicClient } from 'wagmi';
import ABI from '../config/ABI.json';
import { ipfsToHttp } from '../lib/utils';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export interface NFTSeriesItem {
  id: number;
  uri?: string | null;
  metadata?: any; // raw json
  name?: string;
  description?: string;
  image?: string;
  totalSupply?: bigint | null;
  maxTotalSupply?: bigint | null;
  error?: string | null;
}

export interface UseNFTSeriesOptions {
  pageSize?: number; // number of tokens to fetch per page (default 24)
  autoLoad?: boolean; // load first page automatically (default true)
  fetchMetadata?: boolean; // fetch JSON metadata (default true)
  includeSupply?: boolean; // also fetch totalSupply & maxTotalSupply (extra RPC calls) (default false)
  concurrency?: number; // concurrent metadata fetch workers (default 6)
  refreshOnMount?: boolean; // refetch on mount even if cached (default true)
}

interface UseNFTSeriesReturn {
  items: NFTSeriesItem[]; // accumulated (pages appended)
  loading: boolean;
  loadingPage: boolean;
  error: string | null;
  hasMore: boolean;
  page: number; // zero-based
  totalMinted: number; // nextTokenIdToMint value (static for session unless refresh)
  refresh: () => Promise<void>; // clears + reloads first page
  loadMore: () => Promise<void>; // loads next page
  setPage: (p: number) => void; // manual page set (will (re)fetch)
  isRefreshing: boolean;
}

export function useNFTSeries(options: UseNFTSeriesOptions = {}): UseNFTSeriesReturn {
  const {
    pageSize = 24,
    autoLoad = true,
    fetchMetadata = true,
    includeSupply = false,
    concurrency = 6,
    refreshOnMount = true,
  } = options;

  const publicClient = usePublicClient();
  const [items, setItems] = useState<NFTSeriesItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalMinted, setTotalMinted] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialized = useRef(false);

  const fetchNextTokenId = useCallback(async () => {
    if (!publicClient || !CONTRACT_ADDRESS) return 0;
    try {
      const nextId = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI as any,
        functionName: 'nextTokenIdToMint',
        args: [],
      }) as bigint;
      return Number(nextId);
    } catch (e) {
      return 0;
    }
  }, [publicClient]);

  const loadPage = useCallback(async (targetPage: number, replace = false) => {
    if (!publicClient || !CONTRACT_ADDRESS) return;
    setLoading(true);
    setLoadingPage(true);
    setError(null);
    try {
      // Ensure we have totalMinted
      let minted = totalMinted;
      if (minted === 0) {
        minted = await fetchNextTokenId();
        setTotalMinted(minted);
      }
      if (minted === 0) {
        setItems([]);
        setHasMore(false);
        return;
      }

      const start = targetPage * pageSize;
      if (start >= minted) {
        setHasMore(false);
        return;
      }
      const endExclusive = Math.min(start + pageSize, minted);
      const idsRange = Array.from({ length: endExclusive - start }, (_, i) => start + i);

      const pageResults: NFTSeriesItem[] = idsRange.map(id => ({ id, metadata: undefined, uri: undefined }));

      if (!fetchMetadata && !includeSupply) {
        setItems(prev => replace ? pageResults : [...prev, ...pageResults]);
        setHasMore(endExclusive < minted);
        return;
      }

      // Worker pattern for metadata + optional supply
      const queue = [...idsRange];
      const resMap = new Map<number, NFTSeriesItem>();

      async function worker() {
        while (queue.length) {
          const id = queue.shift();
          if (id === undefined) break;
            if (!publicClient) break;
          let item: NFTSeriesItem = { id };
          try {
            // uri
            let uriRaw: string | null = null;
            try {
              uriRaw = await publicClient.readContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: ABI as any,
                functionName: 'uri',
                args: [BigInt(id)],
              }) as string;
            } catch (uriErr: any) {
              item.error = uriErr?.message || 'uri() failed';
            }
            const uri = uriRaw ? ipfsToHttp(uriRaw) : null;
            item.uri = uri;

            if (fetchMetadata && uri) {
              try {
                const resp = await fetch(uri);
                const json = await resp.json();
                item.metadata = json;
                item.name = json?.name;
                item.description = json?.description;
                item.image = json?.image;
              } catch (mErr: any) {
                item.error = (item.error ? item.error + '; ' : '') + (mErr?.message || 'metadata fetch failed');
              }
            }

            if (includeSupply) {
              try {
                const [supply, max] = await Promise.all([
                  publicClient.readContract({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    abi: ABI as any,
                    functionName: 'totalSupply',
                    args: [BigInt(id)],
                  }) as Promise<bigint>,
                  publicClient.readContract({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    abi: ABI as any,
                    functionName: 'maxTotalSupply',
                    args: [BigInt(id)],
                  }) as Promise<bigint>,
                ]);
                item.totalSupply = supply;
                item.maxTotalSupply = max;
              } catch (sErr: any) {
                item.error = (item.error ? item.error + '; ' : '') + (sErr?.message || 'supply fetch failed');
              }
            }
          } catch (outer: any) {
            item.error = item.error || (outer?.message || 'failed');
          }
          resMap.set(id, item);
        }
      }

      const workerCount = Math.min(concurrency, idsRange.length);
      await Promise.all(Array.from({ length: workerCount }, () => worker()));

      const merged = idsRange.map(id => resMap.get(id) || { id, error: 'Missing result' });

      setItems(prev => {
        if (replace) return merged; // first page
        const map = new Map<number, NFTSeriesItem>();
        [...prev, ...merged].forEach(it => map.set(it.id, it));
        return Array.from(map.values()).sort((a, b) => a.id - b.id);
      });
      setHasMore(endExclusive < minted);
      setPage(targetPage);
    } catch (e: any) {
      setError(e.message || 'Failed to load NFT series');
    } finally {
      setLoading(false);
      setLoadingPage(false);
    }
  }, [publicClient, totalMinted, pageSize, fetchMetadata, includeSupply, concurrency]);

  const refresh = useCallback(async () => {
    if (!publicClient) return;
    setIsRefreshing(true);
    setItems([]);
    setTotalMinted(0); // force re-fetch
    await loadPage(0, true);
    setIsRefreshing(false);
  }, [publicClient, loadPage]);

  const loadMore = useCallback(async () => {
    if (loadingPage || !hasMore) return;
    await loadPage(page + 1);
  }, [page, hasMore, loadPage, loadingPage]);

  // Auto initial load
  useEffect(() => {
    if (!autoLoad) return;
    if (initialized.current && !refreshOnMount) return;
    initialized.current = true;
    loadPage(0, true);
  }, [autoLoad, refreshOnMount, loadPage]);

  return {
    items,
    loading,
    loadingPage,
    error,
    hasMore,
    page,
    totalMinted,
    refresh,
    loadMore,
    setPage,
    isRefreshing,
  };
}
