'use client';
import LoadingPage from "@/components/templates/LoadingPage";
import { useGetURI } from "@/hooks/useGetURI";
import Error from "next/error";
import { useParams } from "next/navigation";
import NFTDetails from "@/components/templates/NFTDetails";
import { toast } from "sonner";
import { useRef } from "react";

export default function NftDetail() {
  const id = useParams().id as string;
  const tokenId = Number(id);
  const isValidId = Number.isFinite(tokenId) && tokenId >= 0;
  const { data: rawNftData, loading: nftLoading, error: nftError } = useGetURI({ _tokenId: isValidId ? tokenId : undefined });
  const nftData = rawNftData && isValidId ? { ...rawNftData, tokenId } : undefined;
  const errorToastRef = useRef(false);

  if (!isValidId) {
    return <Error statusCode={404} />;
  }

  if (nftLoading || (!nftData && !nftError)) {
    return <LoadingPage />;
  }

  if (nftData) {
    return (
      <div className="bg-cover min-h-screen pt-18" style={{ backgroundImage: `url('/images/grainy-blur.png')` }}>
        <div className="bg-background/70 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 py-10">
            <NFTDetails data={nftData} />
          </div>
        </div>
      </div>
    );
  }

  if (nftError && !errorToastRef.current) {
    errorToastRef.current = true;
    toast.error('Failed to load NFT data. Please try again later.');
  }
  if (nftError) {
    return <Error statusCode={500} />;
  }

  return <LoadingPage />;
}
