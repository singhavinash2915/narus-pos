import { useState, useEffect } from 'react'
import { BREAKPOINTS } from '@/lib/constants'

interface BreakpointState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => getBreakpoint())

  useEffect(() => {
    const mobileQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile - 1}px)`)
    const tabletQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`)
    const desktopQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.tablet}px)`)

    function handleChange() {
      setState(getBreakpoint())
    }

    mobileQuery.addEventListener('change', handleChange)
    tabletQuery.addEventListener('change', handleChange)
    desktopQuery.addEventListener('change', handleChange)

    return () => {
      mobileQuery.removeEventListener('change', handleChange)
      tabletQuery.removeEventListener('change', handleChange)
      desktopQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return state
}

function getBreakpoint(): BreakpointState {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1280
  return {
    isMobile: width < BREAKPOINTS.mobile,
    isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.tablet,
    width,
  }
}
