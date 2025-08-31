'use client';
import { useRef, useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ipfsToHttp } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChevronsUpDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useClaimNFT } from "@/hooks/useClaimNFT";
import { toast } from 'sonner';
import { useGetPrice } from "@/hooks/useGetPrice";

interface NFTDetailsProps {
  data: {
    tokenId: number;
    name?: string;
    description?: string;
    image?: string;
    price_amount?: string;
    price_currency?: string;
    supply?: string;
    attributes?: Array<{ trait_type?: string; value?: string | number }>;
  };
}

export default function NFTDetails({ data }: NFTDetailsProps) {
  const img = ipfsToHttp(data.image || "");
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ '--x': '-20%', '--y': '-20%' } as React.CSSProperties);
  const [descOpen, setDescOpen] = useState(true);

  const { claim, isLoading, error, isSuccess } = useClaimNFT({
    tokenId: data.tokenId,
  });

  // Toast lifecycle handling
  const toastIdRef = useRef<string | number | undefined>(undefined);
  useEffect(() => {
    // Start loading toast
    if (isLoading) {
      toastIdRef.current = toast.loading(`Claiming ${data.name || 'NFT'}`, { id: toastIdRef.current });
    }
  }, [isLoading, data.name, data.tokenId]);

  useEffect(() => {
    if (error) {
      toast.error(error, { id: toastIdRef.current || `claim-${data.tokenId}` });
    }
  }, [error, data.tokenId]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(`Successfully claimed! You can view it in your collections.`, { id: toastIdRef.current || `claim-${data.tokenId}` } );
    }
  }, [isSuccess, data.tokenId]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = -(y / r.height - 0.5) * 14;
    const ry = (x / r.width - 0.5) * 14;
    setStyle({
      transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`,
      '--x': `${(x / r.width) * 100}%`,
      '--y': `${(y / r.height) * 100}%`,
    } as React.CSSProperties);
  }, []);

  const handleLeave = useCallback(() => {
    setStyle({ transform: 'rotateX(0deg) rotateY(0deg) scale(1)', '--x': '-20%', '--y': '-20%' } as React.CSSProperties);
  }, []);

  console.log(data);

  // On-chain dynamic claim condition price
  const { price, loading: priceLoading, error: priceErr, maxClaimableSupply, supplyClaimed } = useGetPrice({ tokenId: data.tokenId });
  const remaining = (maxClaimableSupply && supplyClaimed !== null) ? (maxClaimableSupply - supplyClaimed) : null;
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const explorerBase = 'https://sepolia.etherscan.io'; // adjust if deploying to another chain
  const tokenExplorerUrl = contractAddress ? `${explorerBase}/token/${contractAddress}?a=${data.tokenId}` : undefined;

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div
        className="relative [perspective:1100px]"
        onPointerMove={handlePointerMove}
        onPointerLeave={handleLeave}
      >
        <div
          ref={cardRef}
          style={style}
          className="relative rounded-xl overflow-hidden transition-transform duration-200 ease-out will-change-transform transform-gpu ring-1 ring-white/10 bg-gradient-to-br from-gray-800 via-cyan-800 to-blue-900"
        >
          {img && (
            <Image
              src={img}
              alt={data.name || 'NFT'}
              width={800}
              height={800}
              priority
              className="object-cover w-full aspect-square"
            />
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.35), rgba(255,255,255,0.05) 38%, rgba(0,0,0,0.4) 75%)`,
              mixBlendMode: 'overlay',
              transition: 'background-position 120ms ease'
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(56,189,248,0.35), rgba(30,64,175,0) 60%)`,
              mixBlendMode: 'color-dodge'
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
      <Card className="bg-background/40 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl">{data.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Collapsible open={descOpen} onOpenChange={setDescOpen}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Description</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">Toggle description</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2 data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down flex flex-col gap-4">
              <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {data.description || '—'}
              </div>
              {tokenExplorerUrl && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(tokenExplorerUrl, '_blank')}
                  >
                    View on Explorer
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur border-white/10">
        <CardContent className="space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-lg font-semibold min-h-[1.75rem]">
                {priceLoading ? '…' : price ? `${price} ETH` : '—'}
              </p>
              {remaining !== null && (
                <p className="text-[11px] text-muted-foreground">Remaining: {
                  remaining === null ? '—' : remaining > 99 ? '99+' : remaining.toString()
                }</p>
              )}
              {priceErr && (
                <p className="mt-1 text-xs text-red-400 max-w-[220px] break-words">
                  {priceErr}
                </p>
              )}
              {error && (
                <p className="mt-1 text-xs text-red-400 max-w-[220px] break-words">
                  {error}
                </p>
              )}
              {isSuccess && (
                <p className="mt-1 text-xs text-emerald-400">Claimed!</p>
              )}
            </div>
            <Button
              size="lg"
              disabled={priceLoading || !price || isLoading}
              className="gap-2"
              onClick={() => { claim(); }}
            >
              {priceLoading ? 'Loading…' : !price ? 'Coming Soon' : (isLoading ? 'Claiming…' : 'Claim')}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      
    </div>
  );
}
