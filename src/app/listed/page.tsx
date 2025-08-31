'use client';
import React, { useEffect, useState } from 'react';
import { useNFTSeries } from '@/hooks/useNFTSeries';
import { NFTListedCard } from '@/components/organisms/NFTListedCard';
import { Button } from '@/components/ui/button';
import Loading from '@/components/atoms/Loading';
import { LoaderCircle, RefreshCcw } from 'lucide-react';

export default function ListedPage() {
  const { items, loading, error, loadMore, hasMore, refresh, isRefreshing } = useNFTSeries({ pageSize: 12, includeSupply: true, fetchMetadata: true });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="box py-24 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className='space-y-1'>
          <h1 className="text-3xl font-bold">All NFTs</h1>
          <p className="text-sm text-muted-foreground">Browse every minted token in this drop series.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={refresh} disabled={isRefreshing || loading}>
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

      {mounted && loading && items.length === 0 && (
        <div className="flex justify-center py-10"><Loading /></div>
      )}

      {mounted && !loading && error && (
        <div className="text-sm text-red-400">{error}</div>
      )}

      {mounted && !error && items.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map(it => (
            <NFTListedCard key={it.id} id={it.id} name={it.name} description={it.description} image={it.image} totalSupply={it.totalSupply} maxTotalSupply={it.maxTotalSupply} />
          ))}
        </div>
      )}

      {mounted && hasMore && (
        <div className="flex justify-center pt-4">
          <Button onClick={loadMore} disabled={loading}>Load More</Button>
        </div>
      )}
    </div>
  );
}
