import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';

import ABI from '../config/ABI.json';
import { ipfsToHttp } from '../lib/utils';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

interface ContractMetadata {
  name?: string;
  description?: string;
  image?: string;
  external_link?: string;
  seller_fee_basis_points?: number;
  fee_recipient?: string;
  // Allow extra fields
  [key: string]: unknown;
}

export function useGetContractURI() {
  const [data, setData] = useState<ContractMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!CONTRACT_ADDRESS || !publicClient) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const uriRaw = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: ABI,
          functionName: 'contractURI',
        }) as string;

        const uri = ipfsToHttp(uriRaw);
        const res = await fetch(uri);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as ContractMetadata;
        if (!cancelled) setData(json);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          (typeof err === 'object' && err && 'message' in err)
            ? String((err as { message?: unknown }).message)
            : 'Failed to fetch contractURI';
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [publicClient]); // CONTRACT_ADDRESS is a module-level constant; exclude from deps

  return { data, loading, error };
}
