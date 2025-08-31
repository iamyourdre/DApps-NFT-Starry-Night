import { useEffect, useState, useCallback } from 'react';
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

interface ClaimCondition {
  startTimestamp: bigint;
  maxClaimableSupply: bigint;
  supplyClaimed: bigint;
  quantityLimitPerWallet: bigint;
  pricePerToken: bigint;
  currency: `0x${string}`;
  [key: string]: unknown;
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

  const fetchData = useCallback(async () => {
    if (!publicClient || CONTRACT_ADDRESS === '') return;
    setLoading(true);
    setError(null);
    try {
      const activeId = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI,
        functionName: 'getActiveClaimConditionId',
        args: [BigInt(tokenId)],
      }) as bigint;

      const condition = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI,
        functionName: 'getClaimConditionById',
        args: [BigInt(tokenId), activeId],
      }) as ClaimCondition;

      const startTs = condition.startTimestamp;
      const maxSupply = condition.maxClaimableSupply;
      const claimed = condition.supplyClaimed;
      const perWallet = condition.quantityLimitPerWallet;
      const pricePerToken = condition.pricePerToken;
      const currencyAddr = condition.currency;

      setStartTimestamp(startTs);
      setMaxClaimableSupply(maxSupply);
      setSupplyClaimed(claimed);
      setQuantityLimitPerWallet(perWallet);
      setRawPrice(pricePerToken);
      setCurrency(currencyAddr);

      setPrice(formatEther(pricePerToken));
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Failed to fetch price';
      setError(msg);
      setRawPrice(null);
      setPrice(null);
      setCurrency(null);
    } finally {
      setLoading(false);
    }
  }, [publicClient, tokenId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
