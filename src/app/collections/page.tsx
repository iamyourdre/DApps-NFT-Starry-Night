'use client';
import React, { useEffect, useState } from 'react';
import { useUserCollections } from '@/hooks/useUserCollections';
import { NFTDemo } from '@/components/organisms/NFTDemo';
import OwnedNFTCard from '@/components/organisms/OwnedNFTCard';
import Loading from '@/components/atoms/Loading';
import { LoaderCircle, RefreshCcw } from 'lucide-react'; 
import { Button } from '@/components/ui/button';

export default function CollectionsPage() {
  const { items, loading, error, refresh, isConnected } = useUserCollections({ fetchMetadata: true, refreshIntervalMs: 0 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="box py-24 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className='space-y-1'>
          <h1 className="text-3xl font-bold">My NFTs</h1>
            <p className="text-sm text-muted-foreground">
            Discover and cherish your unique NFT in your collection.
            </p>
        </div>
        <div>
          <Button
            className="inline-flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => { refresh(); }}
            disabled={!isConnected || loading}
            variant={'outline'}
          >
            {loading ? 
              <LoaderCircle className="animate-spin" />
            :
              <RefreshCcw />
            }
          </Button>
        </div>
      </header>

      {!mounted && (
        <div className="flex justify-center py-10"><Loading /></div>
      )}
      
      {mounted && loading && (
        <div className="flex justify-center py-10"><Loading /></div>
      )}

      {mounted && !isConnected && (
        <div className="rounded-md border border-white/10 p-6 text-center text-sm text-muted-foreground">
          Connect your wallet to view owned NFTs.
        </div>
      )}

      {mounted && isConnected && !loading && error && (
        <div className="text-sm text-red-400">{error}</div>
      )}

      {mounted && isConnected && !loading && !error && items.length === 0 && (
        <div className="text-sm text-muted-foreground">You don&apos;t own any NFTs from this collection yet.</div>
      )}

      {mounted && isConnected && items.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map(item => {
            const data = { name: item.name, description: item.description, image: item.image };
            return (
              <OwnedNFTCard
                key={item.id}
                id={item.id}
                data={data}
                quantity={item.balance}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
