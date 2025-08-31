'use client';
import Hero from "@/components/templates/Hero";
import LoadingPage from "@/components/templates/LoadingPage";
import ConnectWallet from "@/components/web3/ConnectWallet";
import WagmiContextProvider from "@/components/wrapper/WagmiContextProvider";
import { useGetContractURI } from "@/hooks/useGetContractURI";
import { useGetURI } from "@/hooks/useGetURI";
import Error from "next/error";
import { toast } from "sonner";
import { useEffect, useRef } from 'react';

export default function Home() {
  const {data, loading, error} = useGetContractURI();
  const errorToastedRef = useRef(false);

  if (loading || (!data && !error)) {
    return <LoadingPage />;
  }

  if (data) {
    return (
      <div className="bg-cover bg-right"
        style={{ backgroundImage: `url('/images/codioful-formerly-gradienta-IAeyspe9YEo-unsplash.jpg')` }}
      >
        <div className="bg-background/60 w-full h-full min-h-screen py-30 backdrop-blur-md">
          <Hero 
            contractData={data}
            contractLoading={loading}
          />
        </div>
      </div>
    );
  }

  if (error && !errorToastedRef.current) {
    errorToastedRef.current = true;
    toast.error('Failed to load contract data. Please try again later.');
  }
  if (error) {
    return <Error statusCode={500} />;
  }

  return <LoadingPage />;
}
