'use client';
import { useRef, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ipfsToHttp } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChevronsUpDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useClaimNFT } from "@/hooks/useClaimNFT";

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
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">
            {data.name} <span className="text-sm font-normal text-muted-foreground">#{data.tokenId}</span>
          </CardTitle>
          <CardDescription className="text-xs uppercase tracking-wider">
            Supply: {data.supply || '—'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-background/40 backdrop-blur border-white/10">
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
            <CollapsibleContent className="mt-2 data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
              <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {data.description || '—'}
              </div>
            </CollapsibleContent>
          </Collapsible>
          {data.attributes && data.attributes.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {data.attributes.map((a, i) => (
                <div key={i} className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{a.trait_type}</p>
                  <p className="text-sm font-medium">{a.value as any}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur border-white/10">
        <CardContent className="space-y-6">
          {data.attributes && data.attributes.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {data.attributes.map((a, i) => (
                <div key={i} className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{a.trait_type}</p>
                  <p className="text-sm font-medium">{a.value as any}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-lg font-semibold">
                {data.price_amount ? `${data.price_amount} ETH` : '—'}
              </p>
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
              disabled={!data.price_amount || isLoading}
              className="gap-2"
              onClick={() => claim()}
            >
              <ShoppingCart className="w-4 h-4" />
              {isLoading ? 'Claiming...' : 'Buy'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      
    </div>
  );
}
