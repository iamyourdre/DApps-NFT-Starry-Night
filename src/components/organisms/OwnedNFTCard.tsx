import React from 'react';
import { NFTDemo } from './NFTDemo';
import { Badge } from '@/components/ui/badge';

interface OwnedNFTCardProps {
  id: number;
  data?: {
    name?: string;
    description?: string;
    image?: string;
    price_amount?: string;
    supply?: string;
  } | null;
  quantity: bigint | number; // raw on-chain balance
  showWhenOne?: boolean; // optional flag if you want to also show badge when quantity === 1
}
export function OwnedNFTCard({ id, data, quantity, showWhenOne = false }: OwnedNFTCardProps) {
  const qtyNum = typeof quantity === 'bigint' ? Number(quantity) : quantity;
  const display = qtyNum > 999 ? '999+' : qtyNum.toString();
  const shouldShow = showWhenOne ? qtyNum >= 1 : qtyNum > 1;

  return (
    <div className="relative">
      <NFTDemo id={id} data={data} quantity={quantity} />
    </div>
  );
}

export default OwnedNFTCard;
