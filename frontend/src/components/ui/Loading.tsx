import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  variant?: 'card' | 'chart' | 'globe' | 'text' | 'stat'
  className?: string
}

export function LoadingSkeleton({ variant = 'card', className = '' }: LoadingSkeletonProps) {
  const baseClass = 'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-xl'
  
  const variants = {
    card: (
      <div className={`${baseClass} ${className} p-6 space-y-4`}>
        <div className="h-6 bg-white/20 rounded w-1/3" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
        <div className="h-32 bg-white/5 rounded" />
      </div>
    ),
    chart: (
      <div className={`${baseClass} ${className} p-6`}>
        <div className="h-6 bg-white/20 rounded w-1/4 mb-4" />
        <div className="h-64 bg-white/5 rounded" />
      </div>
    ),
    globe: (
      <div className={`${baseClass} ${className} flex items-center justify-center`} style={{ height: '600px' }}>
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto"
          />
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded w-48 mx-auto" />
            <div className="h-3 bg-white/10 rounded w-32 mx-auto" />
          </div>
        </div>
      </div>
    ),
    text: (
      <div className={`${baseClass} ${className} space-y-2`}>
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-5/6" />
        <div className="h-4 bg-white/10 rounded w-4/6" />
      </div>
    ),
    stat: (
      <div className={`${baseClass} ${className} p-4`}>
        <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
        <div className="h-8 bg-white/20 rounded w-3/4" />
      </div>
    ),
  }
  
  return variants[variant]
}

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }
  
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-blue-500/30 border-t-blue-500 rounded-full ${className}`}
    />
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            SkyCast
          </h2>
          <p className="text-white/60 text-sm">Loading NASA Air Quality Data...</p>
        </motion.div>
        
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-blue-500 rounded-full"
            />
          ))}
        </div>
        
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
        />
      </div>
    </div>
  )
}

export function ErrorFallback({ error, resetError }: { error: Error, resetError: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6"
    >
      <div className="max-w-lg w-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl">
        <div className="text-center space-y-6">
          <div className="text-6xl">⚠️</div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-white/60 text-sm">
              We encountered an error while loading the application
            </p>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <div className="text-xs text-red-400 font-mono overflow-auto max-h-32">
              {error.message}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={resetError}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Go Home
            </button>
          </div>
          
          <p className="text-xs text-white/40">
            If this problem persists, please contact support or check the console for more details.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
