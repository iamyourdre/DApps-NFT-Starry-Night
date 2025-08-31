"use client";
import { useCallback, useRef, useState, useEffect } from 'react';
import { Card, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ipfsToHttp } from '@/lib/utils';
import { useGetPrice } from '@/hooks/useGetPrice';
import { useClaimNFT } from '@/hooks/useClaimNFT';
import { toast } from 'sonner';
import { InfoIcon } from 'lucide-react';

interface NFTListedCardProps {
  id: number;
  name?: string;
  description?: string;
  image?: string;
  totalSupply?: bigint | null;
  maxTotalSupply?: bigint | null;
}

export function NFTListedCard({ id, name, image, totalSupply, maxTotalSupply }: NFTListedCardProps) {
  const img = ipfsToHttp(image || '');
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const { price, loading: priceLoading } = useGetPrice({ tokenId: id });
  const { claim, isLoading, error, isSuccess } = useClaimNFT({ tokenId: id });

  // Toast lifecycle similar to NFTDetails
  const toastIdRef = useRef<string | number | undefined>(undefined);
  useEffect(() => {
    if (isLoading) {
      toastIdRef.current = toast.loading(`Claiming ${name || 'NFT'}`, { id: toastIdRef.current });
    }
  }, [isLoading, name, id]);
  useEffect(() => {
    if (error) {
      toast.error(error, { id: toastIdRef.current || `claim-${id}` });
    }
  }, [error, id]);
  useEffect(() => {
    if (isSuccess) {
      toast.success(`Successfully claimed ${name || 'NFT'}!`, { id: toastIdRef.current || `claim-${id}` });
    }
  }, [isSuccess, id]);

  const handleMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = -(y / r.height - 0.5) * 12;
    const ry = (x / r.width - 0.5) * 12;
    setStyle({ transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`, '--x': `${(x/r.width)*100}%`, '--y': `${(y/r.height)*100}%` } as any);
  }, []);
  const handleLeave = useCallback(() => setStyle({ transform: 'rotateX(0deg) rotateY(0deg) scale(1)', '--x': '50%', '--y': '50%' } as any), []);

  const progress = (totalSupply != null && maxTotalSupply && maxTotalSupply > BigInt(0))
    ? Number((totalSupply * BigInt(10000)) / maxTotalSupply) / 100
    : null;

  return (
    <div
      className="relative [perspective:900px] cursor-pointer"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={() => { window.location.href = '/nft/' + id; }}
    >
      <Card ref={ref} style={style} className="relative overflow-hidden w-full p-2 bg-linear-to-r from-gray-800 via-cyan-800 to-blue-900 transition-[transform,filter] duration-200 ease-out will-change-transform transform-gpu gap-1">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.28), rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 75%)`, mixBlendMode: 'overlay' }} />
        {img && (
          <Image src={img} alt={name || 'NFT'} width={600} height={600} className="rounded-md object-cover aspect-square w-full" />
        )}
        <CardFooter className="flex-col gap-2 p-2">
          <CardTitle className="text-lg w-full truncate">{name || `#${id}`}</CardTitle>
          <div className="w-full flex items-center justify-between gap-2 text-xs">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Price</span>
              <span className="font-semibold text-sm min-h-[1.05rem]">{priceLoading ? '…' : price ? `${price} ETH` : '—'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">Claimed</span>
              <span className="font-semibold text-sm min-h-[1.05rem]">{totalSupply != null ? `${totalSupply.toString()}` : '—'}</span>
            </div>
          </div>
          {progress !== null && (
            <div className="w-full h-1.5 bg-white/10 rounded overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          )}
          <div className="flex gap-2 w-full pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); window.location.href = '/nft/' + id; }}
            >
              <InfoIcon />
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="sm"
              disabled={priceLoading || !price || isLoading}
              onClick={(e) => { e.stopPropagation(); if (!price || priceLoading) return; claim(); }}
            >
              {priceLoading ? '...' : !price ? 'N/A' : (isLoading ? 'Claiming…' : 'Claim')}
            </Button>
          </div>
          {error && (
            <p className="w-full text-[10px] text-red-400 line-clamp-2">{error}</p>
          )}
          {isSuccess && (
            <p className="w-full text-[10px] text-emerald-400">Claimed!</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
