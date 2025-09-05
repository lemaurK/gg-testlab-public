'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { ModeIndicator } from '@/components/mode-indicator'
import { 
  Download,
  Github,
  Terminal,
  CheckCircle,
  ArrowLeft,
  Copy,
  Monitor,
  Shield,
  Zap,
  HardDrive,
  Code2,
  FileCode
} from 'lucide-react'
import { useState } from 'react'

export default function DownloadPage() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = (text: string, command: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Download className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">ThrustBench</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <ModeIndicator />
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/demo">Try Demo</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/analyze">Analyze Data</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Install ThrustBench Locally
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Run ThrustBench completely offline with full privacy, security, and support for large datasets.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-gray-900 dark:text-white">Complete Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                All data processing happens locally. No internet connection required after installation.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <HardDrive className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-gray-900 dark:text-white">Large Files</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Process multi-gigabyte datasets without browser memory limitations.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <Zap className="h-12 w-12 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg text-gray-900 dark:text-white">Full Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Native desktop performance with optimized processing algorithms.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Installation Options */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Installation Options
          </h2>

          {/* Option 1: Quick Install */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Quick Install (Recommended)</CardTitle>
                    <CardDescription>One command setup with Node.js</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">Fastest</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  <strong>Requirements:</strong> Node.js 18+ and npm installed on your system
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Clone the repository:</h4>
                  <div className="relative">
                    <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono dark:text-gray-100">
                      git clone https://github.com/lemaurK/gg-testlab-local.git thrustbench
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('git clone https://github.com/lemaurK/gg-testlab-local.git thrustbench', 'clone')}
                    >
                      {copiedCommand === 'clone' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Install dependencies:</h4>
                  <div className="relative">
                    <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono dark:text-gray-100">
                      cd thrustbench && npm install
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('cd thrustbench && npm install', 'install')}
                    >
                      {copiedCommand === 'install' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Start ThrustBench:</h4>
                  <div className="relative">
                    <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono dark:text-gray-100">
                      npm run dev
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('npm run dev', 'start')}
                    >
                      {copiedCommand === 'start' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ThrustBench will open automatically at <strong>http://localhost:3000</strong>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Option 2: Docker Install */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Code2 className="h-6 w-6 text-orange-600" />
                  <div>
                    <CardTitle>Docker Install</CardTitle>
                    <CardDescription>Containerized deployment</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">Isolated</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  <strong>Requirements:</strong> Docker installed on your system
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Pull and run the container:</h4>
                  <div className="relative">
                    <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono text-xs overflow-x-auto dark:text-gray-100">
                      docker run -p 3000:3000 thrustbench/local:latest
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('docker run -p 3000:3000 thrustbench/local:latest', 'docker')}
                    >
                      {copiedCommand === 'docker' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Or build from source by cloning the repository and running <code className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 px-1 rounded">docker-compose up</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Option 3: Source Install */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCode className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle>From Source</CardTitle>
                    <CardDescription>For developers and contributors</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">Advanced</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Perfect for developers who want to modify ThrustBench or contribute to the project.
              </p>
              
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="https://github.com/lemaurK/gg-testlab-local">
                    <Github className="h-4 w-4 mr-2" />
                    View Source Code
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://github.com/lemaurK/gg-testlab-local/blob/main/README.md">
                    <FileCode className="h-4 w-4 mr-2" />
                    Development Guide
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Troubleshooting
          </h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Port already in use?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  If port 3000 is busy, ThrustBench will automatically use the next available port (3001, 3002, etc.)
                </p>
                <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm dark:text-gray-100">
                  npm run dev -- --port 3001
                </code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Node.js version issues?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  ThrustBench requires Node.js 18 or higher. Check your version:
                </p>
                <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm dark:text-gray-100">
                  node --version
                </code>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Install the latest Node.js from <Link href="https://nodejs.org" className="text-blue-600 hover:underline">nodejs.org</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help?
          </h2>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="https://github.com/lemaurK/gg-testlab-local/issues">
                <Github className="h-4 w-4 mr-2" />
                Report Issue
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Or try the <Link href="/demo" className="text-blue-600 hover:underline">online demo</Link> first
          </p>
        </div>
      </div>
    </div>
  )
}