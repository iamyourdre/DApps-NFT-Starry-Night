import React from 'react'

const LoadingPage = () => {
  return (
    <div className="z-10 w-full h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-cyan-400"></div>
    </div>
  )
}

export default LoadingPage