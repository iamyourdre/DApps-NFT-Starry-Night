import React, { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner';
import { Eye, SquareLibrary, Unlink } from 'lucide-react';

interface ConnectWalletProps {
  className?: string;
  size?: 'sm' | 'lg' | 'default';
}

const ConnectWallet = ({
  className = '',
  size = 'default',
}: ConnectWalletProps) => {
  const { connectors, connect, isPending, isSuccess } = useConnect();
  const { address } = useAccount()
  const { data: balanceData } = useBalance({ address });
  const { disconnect } = useDisconnect()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isSuccess) {
      setIsDialogOpen(false)
      
      toast.success("Wallet connected successfully.")
    }
  }, [isSuccess])

  if (!mounted) {
    // Prevent hydration mismatch by not rendering wallet UI until mounted
    return (
      <Button
        className={`rounded-full ${className}`}
        variant='default'
        size={size}
        disabled
      >
        Connect Wallet
      </Button>
    )
  }

  return (
    <>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button onClick={() => setIsDialogOpen(true)}
        className={`rounded-full ${className}`} 
        variant={!address ? 'default' : 'outline'}
        size={size}
      >
        {!address && 'Connect Wallet'}
        {typeof address === 'string' && address && (
          <>{address.slice(0, 6)}...{address.slice(-4)}</>
        )}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!address ? 'Connect Wallet' : 'Wallet Connected'}
          </DialogTitle>
          <DialogDescription className='my-2 flex flex-col'>
            {!address ? 'Please connect your wallet to continue.' : (
              <>
                <span>{address}</span>
                <span>
                  <b>Balance: &nbsp;</b>
                  {balanceData
                    ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
                    : ''}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {!address ? (
          <div>
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => connect({connector})}
                disabled={isPending}
                className="w-full mb-2"
              >
                {!address && connector.name}
              </Button>
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-2'>
            <Button 
            className='col-span-2 bg-white'
              disabled={!address}
              asChild
            >
              <a href="/collections">
                <SquareLibrary /> My Collections
              </a>
            </Button>
            <Button 
              onClick={() => {
                disconnect()
                setIsDialogOpen(false)
              }} 
              disabled={!address}
              variant={'destructive'}
            >
              <Unlink /> Disconnect
            </Button>
            <Button 
              onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
              disabled={!address}
              variant={'outline'}
            >
              <Eye /> Etherscan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )

}

export default ConnectWallet