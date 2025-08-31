import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';

import ABI from '../config/ABI.json';
import { ipfsToHttp } from '../lib/utils';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

interface UseGetURIProps {
  _tokenId: number | undefined;
}

interface TokenMetadata {
  name?: string;
  description?: string;
  image?: string;
  animation_url?: string;
  // ERC-721 / 1155 common metadata attributes array
  attributes?: Array<{ trait_type?: string; value?: string | number }>; 
  // Optional pricing & supply fields if backend / metadata includes them
  price_amount?: string;
  price_currency?: string;
  supply?: string;
  [key: string]: unknown;
}

export function useGetURI({
  _tokenId
}: UseGetURIProps) {
	const [data, setData] = useState<TokenMetadata | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const publicClient = usePublicClient();

	useEffect(() => {
    if(_tokenId === undefined || _tokenId === null || !publicClient) return;
		let cancelled = false;
			(async () => {
				setLoading(true);
				setError(null);
				try {
          let uri = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ABI,
            functionName: 'uri',
            args: [_tokenId],
          }) as string;
          uri = ipfsToHttp(uri);
          const res = await fetch(uri);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json() as TokenMetadata;
          if (!cancelled) setData(json);
				} catch (err: unknown) {
					if (cancelled) return;
					const msg =
          (typeof err === 'object' && err && 'message' in err)
            ? String((err as { message?: unknown }).message)
            : 'Failed to fetch token URI';
          setError(msg);
				} finally {
					if (!cancelled) setLoading(false);
				}
			})();
		return () => { cancelled = true; };
	}, [_tokenId, publicClient]);

	return { data, loading, error };
}
