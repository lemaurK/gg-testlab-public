'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { ModeIndicator } from '@/components/mode-indicator'
import { 
  Rocket, 
  Upload, 
  Brain, 
  BarChart3,
  CheckCircle,
  X,
  Github,
  Download,
  Zap,
  Shield,
  Globe,
  HardDrive
} from 'lucide-react'

export default function ThrustBenchLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">ThrustBench</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#home" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Home
            </Link>
            <Link href="/demo" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Demo
            </Link>
            <Link href="/analyze" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Analyze
            </Link>
            <Link href="/download" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Download
            </Link>
            <Link href="https://github.com/lemaurK/gg-testlab-public" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              GitHub
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <ModeIndicator />
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/demo">Try Demo</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/analyze">Analyze Data</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Sensor Data. <span className="text-blue-600">Smarter Insights.</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Upload your propulsion sensor data. Get intelligent analytics and simple visualizations. 
            No ML experience needed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" asChild>
              <Link href="/demo">
                <Globe className="mr-2 h-5 w-5" />
                Try Interactive Demo
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3" asChild>
              <Link href="/analyze">
                <BarChart3 className="mr-2 h-5 w-5" />
                Analyze Your Data
              </Link>
            </Button>
          </div>
          
          <div className="mt-12">
            <div className="relative mx-auto max-w-3xl">
              <div className="rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-8">
                <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-16 w-16 mr-4" />
                  <div className="text-left">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard Preview</div>
                    <div className="text-sm">Interactive analytics interface coming soon...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Engineers, By Engineers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              ThrustBench handles the complexity so you can focus on what matters — 
              understanding your propulsion system performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg text-gray-900 dark:text-white">Drag-and-Drop CSV Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Simply drag your sensor data files. Support for CSV, TSV, and JSON formats.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg text-gray-900 dark:text-white">Smart Sensor Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Automatically detects thrust, temperature, pressure sensors and data types.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg text-gray-900 dark:text-white">Neural Pattern Modeling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Lightweight AI models detect anomalies and classify burn patterns automatically.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg text-gray-900 dark:text-white">Run Anywhere</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Works in your browser or install locally for maximum privacy and performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From raw sensor data to actionable insights in four simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Upload Sensor Data</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Drop your CSV files containing thrust, temperature, pressure, or other sensor readings.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Smart Parsing</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                ThrustBench automatically detects sensor types, data formats, and extracts key metrics.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Neural networks run in-browser to detect patterns, anomalies, and performance metrics.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Export Results</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Get interactive charts, PDF reports, and downloadable analysis data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Options Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Deployment
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Try it online or run it completely offline — your choice
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Public Demo Card */}
            <Card className="relative bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">Public Demo</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">Try the hosted version of ThrustBench</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">No setup required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Works with small CSVs (&lt;10MB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">All processing in browser</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Limited privacy (public hosting)</span>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/demo">
                    Try Demo
                  </Link>
                </Button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Perfect for testing and small datasets
                </p>
              </CardContent>
            </Card>

            {/* Local Mode Card */}
            <Card className="relative bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <HardDrive className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">Local Installation</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">Run the tool 100% locally</CardDescription>
                  </div>
                </div>
                <Badge className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  Recommended
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Complete privacy &amp; security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Supports large files (GB+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">No internet required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Full feature access</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50" asChild>
                  <Link href="/download">
                    <Download className="mr-2 h-4 w-4" />
                    Install Instructions
                  </Link>
                </Button>
                
                <p className="text-xs text-gray-500">
                  Best for production and sensitive data
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Format Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Data Format
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              ThrustBench works with standard CSV, TSV, or JSON files containing time-series sensor data
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Recommended CSV Format</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Your data file should have columns for time and sensor readings. Headers are automatically detected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                  <div className="text-gray-400"># thrust_test_data.csv</div>
                  <div>time,thrust,chamber_pressure,nozzle_temp,ambient_temp</div>
                  <div>0.0,0.0,14.7,294.5,293.1</div>
                  <div>0.1,12.3,45.2,295.8,293.2</div>
                  <div>0.2,45.7,156.7,301.2,293.4</div>
                  <div>0.3,89.4,234.1,318.7,293.8</div>
                  <div>0.4,134.2,298.5,342.1,294.2</div>
                  <div className="text-gray-500">...</div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold mb-2">✅ Supported Formats</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• CSV (Comma Separated Values)</li>
                      <li>• TSV (Tab Separated Values)</li>
                      <li>• JSON (with arrays or objects)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">📊 Common Column Names</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Time:</strong> time, timestamp, t, seconds</li>
                      <li>• <strong>Thrust:</strong> thrust, force, f_thrust</li>
                      <li>• <strong>Pressure:</strong> pressure, p_chamber</li>
                      <li>• <strong>Temperature:</strong> temp, temperature</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ThrustBench automatically detects time and sensor columns</li>
                    <li>• Use consistent units throughout your dataset</li>
                    <li>• Higher sampling rates provide better analysis resolution</li>
                    <li>• Include multiple sensor types for comprehensive analysis</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Rocket className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">ThrustBench</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link 
                href="https://github.com/lemaurK/gg-testlab-public" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                Public Repo
              </Link>
              <Link 
                href="https://github.com/lemaurK/gg-testlab-local" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                Local Repo
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-300">
            <p>© 2024 ThrustBench. Built with ❤️ by <strong>LeMaur Kydd</strong></p>
          </div>
        </div>
      </footer>
    </div>
  )
}