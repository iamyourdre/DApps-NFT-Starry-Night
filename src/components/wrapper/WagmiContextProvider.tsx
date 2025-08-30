import React from 'react'
import { WagmiProvider } from "wagmi";
import { config } from "@/config/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

interface WagmiContextProviderProps {
  children: React.ReactNode;
}

const WagmiContextProvider = ({ children }: WagmiContextProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default WagmiContextProvider