'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Error boundary for business catalog pages.
 * Previously any unhandled error in BusinessProfile showed a white screen to customers.
 */
export default function BusinessError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Business profile error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5C2.3 17.333 3.262 19 4.8 19z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Something went wrong</h2>
        <p className="text-slate-500 mb-8">
          We couldn't load this business profile. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="bg-slate-800 text-white hover:bg-slate-700 rounded-full">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="rounded-full">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
