'use client';
import Hero from "@/components/templates/Hero";
import LoadingPage from "@/components/templates/LoadingPage";
import ConnectWallet from "@/components/web3/ConnectWallet";
import WagmiContextProvider from "@/components/wrapper/WagmiContextProvider";
import { useGetContractURI } from "@/hooks/useGetContractURI";
import { useGetURI } from "@/hooks/useGetURI";
import Error from "next/error";

export default function Home() {
  const {data: contractData, loading : contractLoading, error: contractError} = useGetContractURI();
  const {data: nftData, loading: nftLoading, error: nftError} = useGetURI({ _tokenId: 0 });
  if (contractLoading || nftLoading) {
    return <LoadingPage />;
  } else if (contractData && nftData) {
    return (
      <div className="bg-cover"
        style={{ backgroundImage: `url('images/grainy-blur.png')` }}
      >
        <div className="bg-background/60 w-full h-full">
          <Hero 
            contractData={contractData}
            contractLoading={contractLoading}
            nftData={nftData}
            nftLoading={nftLoading}
          />
        </div>
      </div>
    );
  } else if (contractError || nftError) {
    return <Error statusCode={520} />;
  }
}
