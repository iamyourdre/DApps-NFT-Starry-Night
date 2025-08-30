import { LoaderCircle } from 'lucide-react';
import React from 'react'

interface LoadingProps {
  message?: string;
}

const Loading = () => {
  return (
    <>
      <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-cyan-400"></div>
    </>
  )
}

export default Loading