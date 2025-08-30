'use client';
import Hero from "@/components/templates/Hero";
import LoadingPage from "@/components/templates/LoadingPage";
import ConnectWallet from "@/components/web3/ConnectWallet";
import WagmiContextProvider from "@/components/wrapper/WagmiContextProvider";
import { useGetContractURI } from "@/hooks/useGetContractURI";
import { useGetURI } from "@/hooks/useGetURI";
import Error from "next/error";
import { toast } from "sonner";

export default function Home() {
  const {data, loading, error} = useGetContractURI();
  if (loading) {
    return <LoadingPage />;
  } else if (data) {
    return (
      <div className="bg-cover"
        style={{ backgroundImage: `url('images/grainy-blur.png')` }}
      >
        <div className="bg-background/60 w-full h-full">
          <Hero 
            contractData={data}
            contractLoading={loading}
          />
        </div>
      </div>
    );
  } else if (error) {
    toast.error('Failed to load contract data. Please try again later.');
    return <Error statusCode={520} />;
  }
}
