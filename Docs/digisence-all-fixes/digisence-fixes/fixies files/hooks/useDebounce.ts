'use client'

import { useState, useEffect } from 'react'

/**
 * Debounces a value by delaying updates until after the specified delay.
 * 
 * Previously this was illegally defined INSIDE the SuperAdminDashboard component,
 * which violates React's Rules of Hooks. Hooks must be defined at module level.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
