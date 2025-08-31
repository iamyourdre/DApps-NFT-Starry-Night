import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';

import ABI from '../config/ABI.json';
import { ipfsToHttp } from '../lib/utils';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

interface UseGetURIProps {
  _tokenId: number | undefined;
}

export function useGetURI({
  _tokenId
}: UseGetURIProps) {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const publicClient = usePublicClient();

	useEffect(() => {
    if(_tokenId === undefined || _tokenId === null || !publicClient) return;
		setLoading(true);
		setError(null);
			(async () => {
				try {
          let uri = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ABI,
            functionName: 'uri',
            args: [_tokenId],
          }) as string;
          uri = ipfsToHttp(uri);
          const res = await fetch(uri);
          const json = await res.json();
          setData(json);
				} catch (err: any) {
					setError(err.message || 'Failed to fetch contractURI');
				} finally {
					setLoading(false);
				}
			})();
	}, [_tokenId, publicClient]);

	return { data, loading, error };
}
