'use client';
import React from 'react';
import WagmiContextProvider from './WagmiContextProvider';
import Navbar from '@/components/organisms/Navbar';

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper = ({ children }: ClientWrapperProps) => {
  return (
    <WagmiContextProvider>
      <Navbar />
      {children}
    </WagmiContextProvider>
  );
};

export default ClientWrapper;