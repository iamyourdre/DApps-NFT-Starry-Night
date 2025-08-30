import { LoaderCircle } from 'lucide-react';
import React from 'react'

interface LoadingProps {
  message?: string;
}

const Loading = ({
  message = "Loading..."
}: LoadingProps) => {
  return (
    <>
      <LoaderCircle className='animate-spin' /> {message}
    </>
  )
}

export default Loading