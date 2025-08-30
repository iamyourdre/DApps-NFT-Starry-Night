import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import ABI from '../config/ABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export interface UseGetPriceResult {
  price: string | null;          // Human readable (ETH) if native or formatted ERC20 using its decimals (assumed 18 if not fetched)
  rawPrice: bigint | null;       // Raw wei value
  currency: `0x${string}` | null;// Currency address (zero address => native)
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  startTimestamp: bigint | null;
  maxClaimableSupply: bigint | null;
  supplyClaimed: bigint | null;
  quantityLimitPerWallet: bigint | null;
}

interface UseGetPriceParams {
  tokenId: number; // ERC1155 token id
}

// Zero address helper (native token)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function useGetPrice({ tokenId }: UseGetPriceParams): UseGetPriceResult {
  const publicClient = usePublicClient();
  const [rawPrice, setRawPrice] = useState<bigint | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [currency, setCurrency] = useState<`0x${string}` | null>(null);
  const [startTimestamp, setStartTimestamp] = useState<bigint | null>(null);
  const [maxClaimableSupply, setMaxClaimableSupply] = useState<bigint | null>(null);
  const [supplyClaimed, setSupplyClaimed] = useState<bigint | null>(null);
  const [quantityLimitPerWallet, setQuantityLimitPerWallet] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!publicClient || CONTRACT_ADDRESS === '') return;
    setLoading(true);
    setError(null);
    try {
      const activeId = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI as any,
        functionName: 'getActiveClaimConditionId',
        args: [BigInt(tokenId)],
      }) as bigint;

      const condition: any = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI as any,
        functionName: 'getClaimConditionById',
        args: [BigInt(tokenId), activeId],
      });

      // Because ABI returns a struct, viem should give an object with named properties
      const startTs: bigint = condition.startTimestamp;
      const maxSupply: bigint = condition.maxClaimableSupply;
      const claimed: bigint = condition.supplyClaimed;
      const perWallet: bigint = condition.quantityLimitPerWallet;
      const pricePerToken: bigint = condition.pricePerToken;
      const currencyAddr: `0x${string}` = condition.currency;

      setStartTimestamp(startTs);
      setMaxClaimableSupply(maxSupply);
      setSupplyClaimed(claimed);
      setQuantityLimitPerWallet(perWallet);
      setRawPrice(pricePerToken);
      setCurrency(currencyAddr);

      // Assume 18 decimals for native or standard ERC20. For differing decimals, you'd need to call decimals() on the currency contract when currency != ZERO_ADDRESS.
      const human = formatEther(pricePerToken);
      setPrice(human);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch price');
      setRawPrice(null);
      setPrice(null);
      setCurrency(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // We intentionally only re-run on tokenId/publicClient changes.
  }, [tokenId, publicClient]);

  return {
    price,
    rawPrice,
    currency,
    loading,
    error,
    refresh: fetchData,
    startTimestamp,
    maxClaimableSupply,
    supplyClaimed,
    quantityLimitPerWallet,
  };
}
