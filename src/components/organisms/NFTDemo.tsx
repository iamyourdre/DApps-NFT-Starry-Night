import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import { ipfsToHttp } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import Image from "next/image";
import Loading from "../atoms/Loading";
import { useRef, useState, useCallback } from "react";

interface NFTDemoProps {
  id: number;
  data: {
    name?: string;
    description?: string;
    image?: string;
    price_amount?: string;
    supply?: string;
  } | undefined;
}

export function NFTDemo(
  { id, data }: NFTDemoProps
) {
  const imageUrl = ipfsToHttp(data?.image || '');
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = -(y / rect.height - 0.5) * 16;
    const ry = (x / rect.width - 0.5) * 16;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    setStyle({
      transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`,
      '--x': `${xPercent}%`,
      '--y': `${yPercent}%`,
    } as React.CSSProperties);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setStyle({
      transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
      '--x': '50%',
      '--y': '50%',
    } as React.CSSProperties);
  }, []);

  console.log(data);

  return (
    <div
      className="relative [perspective:900px] cursor-pointer"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={() => { window.location.href = '/nft/' + id }}
    >
      <Card
        ref={cardRef}
        style={style}
        className="relative overflow-hidden w-full md:max-w-xs h-auto! p-2 bg-linear-to-r from-gray-800 via-cyan-800 to-blue-900 gap-0 transition-[transform,filter] duration-200 ease-out will-change-transform transform-gpu"
      >
        {/* Dynamic light overlay */}
        <div
          aria-hidden
            /* radial highlight + subtle hue shift via gradient overlay */
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `
              radial-gradient(
                circle at var(--x,50%) var(--y,50%),
                rgba(255,255,255,0.35),
                rgba(255,255,255,0.05) 35%,
                rgba(0,0,0,0.25) 70%
              ),
              linear-gradient(to right,rgba(255,255,255,0.05),rgba(0,0,0,0))
            `,
            mixBlendMode: 'overlay',
            transition: 'background-position 120ms ease, opacity 250ms ease'
          }}
        />
        {/* Optional color glow border */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-md"
          style={{
            background: 'radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(56,189,248,0.35), rgba(30,64,175,0) 60%)',
            mixBlendMode: 'color-dodge',
            transition: 'background-position 120ms ease'
          }}
        />
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={data?.name || 'NFT Image'}
            width={500}
            height={500}
            className="rounded-md object-cover aspect-square w-full"
          />
        )}
        <CardFooter className="flex-col gap-2 p-2">
          <CardTitle className="text-xl me-auto">{data?.name || 'NFT Name'}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground me-auto pb-1">
            {(data?.description ? data.description.substring(0, 120)+' ... (Read more)' : 'NFT Description')}
          </CardDescription>
          <div className="flex gap-2 w-full">
            <Button variant="outline">
              <InfoIcon />
            </Button>
            <Button variant="outline" className="flex-1">
              {data?.price_amount ? (
                <p className="tracking-tight">
                  <b>{data.price_amount}</b> ETH
                </p>
              ) : (
                <Loading />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
