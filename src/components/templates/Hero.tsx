'use client';
import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import { Github, ScanSearch } from 'lucide-react';
import { useGetContractURI } from '@/hooks/useGetContractURI';
import { Badge } from '../ui/badge';
import { NFTDemo } from '../organisms/NFTDemo';
import { useGetURI } from '@/hooks/useGetURI';
import Loading from '../atoms/Loading';
import { toast } from 'sonner';

const Hero = ({contractData, contractLoading} : 
  {contractData: any, contractLoading: boolean}
) => {
  const highlightedId = 0;
  const {data: nftData, loading: nftLoading, error: nftError} = useGetURI({ _tokenId: highlightedId });
  if (nftError) {
    toast.error('Failed to load NFT data. Please try again later.');
  }
  return (
    <div className="box">
      <div className="grid grid-cols-10 gap-12 lg:gap-20">
        <div className="col-span-10 md:col-span-6 md:py-0 flex flex-col items-center lg:items-start gap-3">
          <Badge variant={'secondary'} className='rounded-full px-3 text-base'>Collectible NFTs</Badge>
          <div className="py-6 text-center lg:text-left">
            <h1 className='mb-4 text-5xl md:text-6xl lg:text-7xl font-bold text-balance'>
              <span className="gradient-glow">
                {contractData && contractData.name+' '}
              </span>Presale is Live Now!
            </h1>
            <h2 className='text-pretty text-lg'>
              Get your early access to the exclusive ${contractData && contractData.symbol} before the public sale. Be part of {contractData && contractData.name} early adopters and get future benefits!
            </h2>
          </div>
          <Button className="py-6 rounded-full px-6!" asChild>
            <a href="/listed">
              <ScanSearch /> Explore NFTs
            </a>
          </Button>
        </div>
        <div className="col-span-10 md:col-span-4 min-h-auto pb-12 flex flex-col items-center">
          {nftLoading ?
            <Loading /> :
            <div className="max-w-xs animate-in fade-in duration-1000">
              <NFTDemo data={nftData} id={highlightedId} />
            </div>
          }
        </div>
      </div>
      <style jsx>{`
        .gradient-glow {
          background: linear-gradient(
            115deg,
            #215c82,
            #2c7394 20%,
            #7fb9cf 30%,
            #7fb9cf 50%,
            #f2e9b0 80%
          );
          background-size: 240% 240%;
          -webkit-background-clip: text;
          color: transparent;
          position: relative;
          animation: glowShift 10s ease-in-out infinite;
        }
        .gradient-glow::after {
          content: '';
          position: absolute;
          inset: 0;
            background: inherit;
            filter: drop-shadow(0 0 5px #2c7394) blur(12px);
            opacity: 0.42;
            z-index: -1;
            animation: glowPulse 5s ease-in-out infinite;
        }
        @keyframes glowShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glowPulse {
          0%,100% { opacity:.34; filter:drop-shadow(0 0 4px #215c82) blur(10px); }
          50% { opacity:.68; filter:drop-shadow(0 0 10px #f2e9b0) blur(15px); }
        }
      `}</style>
    </div>
  )
};

export default Hero;