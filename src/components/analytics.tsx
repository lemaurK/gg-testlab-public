'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { shouldEnableAnalytics, isPublicMode } from '@/lib/deployment-modes'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

const GA_TRACKING_ID = 'G-50J1PH4YMQ'

export function Analytics() {
  const enableAnalytics = shouldEnableAnalytics()
  
  useEffect(() => {
    // Only initialize if analytics should be enabled
    if (enableAnalytics && isPublicMode()) {
      window.dataLayer = window.dataLayer || []
      
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args)
      }
      
      window.gtag = gtag
      gtag('js', new Date())
      gtag('config', GA_TRACKING_ID, {
        // Privacy-focused configuration
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      })
    }
  }, [enableAnalytics])

  // Only render analytics in public mode with consent
  if (!enableAnalytics || !isPublicMode()) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
    </>
  )
}

// Utility functions for privacy-compliant tracking
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (shouldEnableAnalytics() && isPublicMode() && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      // Always anonymize
      anonymize_ip: true,
      ...parameters
    })
  }
}

export const trackPageView = (url: string) => {
  if (shouldEnableAnalytics() && isPublicMode() && typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      anonymize_ip: true
    })
  }
}