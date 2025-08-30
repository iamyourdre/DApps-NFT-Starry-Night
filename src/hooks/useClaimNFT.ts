import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import ABI from '../config/ABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

interface UseClaimNFTArgs {
  tokenId: number;
}

interface ClaimOptions {
  quantity?: number;
  receiver?: `0x${string}`;
}

export function useClaimNFT({ tokenId }: UseClaimNFTArgs) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claim = useCallback(async (opts?: ClaimOptions) => {
    setError(null);
    setIsSuccess(false);
    setTxHash(null);

    if (!walletClient) {
      setError('Wallet not connected');
      return;
    }
    if (!CONTRACT_ADDRESS) {
      setError('Missing contract address');
      return;
    }

    try {
      setIsLoading(true);

      if (!publicClient) throw new Error('Public client unavailable');

      // 1. Get active claim condition id for this token
      const activeId: bigint = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI as any,
        functionName: 'getActiveClaimConditionId',
        args: [BigInt(tokenId)],
      }) as any;

      // 2. Fetch the condition struct
      const condition: any = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI as any,
        functionName: 'getClaimConditionById',
        args: [BigInt(tokenId), activeId],
      });

      if (!condition) throw new Error('No active claim condition found');

      const quantity = BigInt(opts?.quantity ?? 1);
  if (quantity <= BigInt(0)) throw new Error('Quantity must be > 0');

      const receiver = opts?.receiver || (address as `0x${string}`);
      if (!receiver) throw new Error('Receiver address missing');

      const perTokenWei = BigInt(condition.pricePerToken);
      const payCurrency = condition.currency as `0x${string}`;

      // Public claim => neutral override values (DO NOT mirror condition or it may mismatch merkle logic)
      const allowlistProof = {
        proof: [] as `0x${string}`[],
        quantityLimitPerWallet: BigInt(0),
        pricePerToken: BigInt(0),
        currency: ZERO_ADDRESS,
      };

      // Sanity debug (remove in prod)
      // eslint-disable-next-line no-console
    const isNative = payCurrency === ZERO_ADDRESS || payCurrency.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    console.debug('[claim] condition', { activeId: activeId.toString(), perTokenWei: perTokenWei.toString(), payCurrency, isNative, quantity: quantity.toString(), receiver });

  const value = isNative ? perTokenWei * quantity : BigInt(0);

      // Preflight simulate (helps surface precise revert reason before gas spend)
      try {
        await publicClient.simulateContract({
          address: CONTRACT_ADDRESS,
          abi: ABI as any,
          functionName: 'claim',
          args: [
            receiver,
            BigInt(tokenId),
            quantity,
            payCurrency,
            perTokenWei,
            allowlistProof,
            '0x',
          ],
          value,
          account: address as `0x${string}`,
        });
      } catch (simErr: any) {
        // eslint-disable-next-line no-console
        console.error('[claim] simulate failed', simErr);
        throw new Error(simErr?.shortMessage || simErr?.message || 'Simulation failed');
      }

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI as any,
        functionName: 'claim',
        args: [
          receiver,
          BigInt(tokenId),
          quantity,
          payCurrency,
          perTokenWei,
          allowlistProof,
          '0x', // _data
        ],
        value,
      });

      setTxHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') setIsSuccess(true); else setError('Transaction failed');
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('[claim] error', e);
      const msg: string = e?.shortMessage || e?.message || '';
      if (/DropClaimInvalidTokenPrice/i.test(msg)) {
        setError('Price or currency mismatch with active claim condition. Refresh metadata or verify dashboard settings.');
      } else if (/DropClaimNotStarted/i.test(msg)) {
        setError('Claim phase not started yet. Check start time.');
      } else if (/DropClaimExceedLimit/i.test(msg)) {
        setError('Quantity exceeds per-wallet limit.');
      } else if (/DropClaimExceedMaxSupply/i.test(msg)) {
        setError('Exceeds remaining supply.');
      } else if (/DropNoActiveCondition/i.test(msg)) {
        setError('No active claim condition for this token.');
      } else {
        setError(msg || 'Claim failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, tokenId, publicClient]);

  return {
    claim,
    isLoading,
    isSuccess,
    error,
    txHash,
  };
}
