'use client';
import Hero from "@/components/templates/Hero";
import LoadingPage from "@/components/templates/LoadingPage";
import { useGetContractURI } from "@/hooks/useGetContractURI";
import { useGetURI } from "@/hooks/useGetURI";
import Error from "next/error";
import { useParams } from "next/navigation";

export default function NftDetail() {
  const id = useParams().id as string;
  const tokenId = id ? Number(id) : undefined;
  const {data: nftData, loading: nftLoading, error: nftError} = useGetURI({ _tokenId: tokenId });
  console.log(nftData);
  if (nftLoading) {
    return <LoadingPage />;
  } else if (true) {
    return (
      <div className="bg-cover"
        style={{ backgroundImage: `url('images/grainy-blur.png')` }}
      >
        <div className="bg-background/60 w-full h-full">
          {/* <Hero 
            contractData={contractData}
            contractLoading={contractLoading}
            nftData={nftData}
            nftLoading={nftLoading}
          /> */}
        </div>
      </div>
    );
  } else if (!tokenId || nftError || !nftData) {
    return <Error statusCode={404} />;
  }
}
