'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                We encountered an unexpected error. This is often caused by large datasets or browser memory limitations.
              </p>
              
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Quick fixes:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Try a smaller dataset (&lt;10,000 rows)</li>
                  <li>• Reduce file size (&lt;5MB recommended)</li>
                  <li>• Use 10-100Hz sampling instead of higher frequencies</li>
                  <li>• Close other browser tabs to free memory</li>
                </ul>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-left">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If this issue persists, try using smaller datasets or refreshing the page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Lightweight error boundary for specific components
export function ComponentErrorBoundary({ 
  children, 
  componentName = 'Component' 
}: { 
  children: ReactNode
  componentName?: string 
}) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {componentName} Error
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Unable to render this component
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  )
}