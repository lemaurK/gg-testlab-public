'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/theme-toggle'
import { ModeIndicator } from '@/components/mode-indicator'
import { 
  Mail,
  Github,
  MessageSquare,
  ArrowLeft,
  ExternalLink,
  Bug,
  Lightbulb,
  Users,
  BookOpen,
  Rocket
} from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Rocket className="h-8 w-8 text-blue-600" />
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
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions about ThrustBench? Need help with your propulsion data analysis? We&apos;re here to help.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Direct Contact */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Mail className="h-6 w-6 text-blue-600" />
                Direct Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Get in touch directly with the ThrustBench development team for technical support, 
                partnership inquiries, or custom solutions.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Email Support</div>
                    <a href="mailto:support@thrustbench.app" className="text-blue-600 hover:underline text-sm">
                      support@thrustbench.app
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Creator</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">LeMaur Kydd - Propulsion Engineer</div>
                  </div>
                </div>
              </div>
              
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  <strong>Response time:</strong> Typically within 24-48 hours for technical inquiries
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Community Support */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                <Github className="h-6 w-6 text-green-600" />
                Community & Open Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Join the ThrustBench community, report bugs, request features, or contribute to the project.
              </p>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="https://github.com/lemaurK/gg-testlab-public/issues">
                    <Bug className="h-4 w-4 mr-2" />
                    Report Bug or Issue
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="https://github.com/lemaurK/gg-testlab-public/discussions">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Feature Requests
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="https://github.com/lemaurK/gg-testlab-public">
                    <Github className="h-4 w-4 mr-2" />
                    View Source Code
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Is ThrustBench free to use?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! ThrustBench is completely free and open source. You can use both the online demo 
                  and local installation at no cost. The project is supported by the propulsion engineering community.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What file formats are supported?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  ThrustBench supports CSV, TSV, and JSON formats. The tool automatically detects sensor types 
                  and data structures, making it compatible with most propulsion test data formats.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How private is my data?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  In the online demo, all processing happens in your browser - no data is uploaded to servers. 
                  For maximum privacy, use the local installation which runs completely offline.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I customize ThrustBench for my needs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Absolutely! ThrustBench is open source and designed to be extensible. You can modify the code, 
                  add custom metrics, or integrate with your existing workflows. Contact us for consulting services.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer enterprise support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, we provide custom development, integration services, and enterprise support for organizations 
                  using ThrustBench in production environments. Contact us for pricing and availability.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documentation & Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Documentation & Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href="https://github.com/lemaurK/gg-testlab-public/blob/main/README.md">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="text-left">
                    <div className="font-medium">User Guide</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Complete documentation and tutorials</div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href="/demo">
                <div className="flex items-start gap-3">
                  <Rocket className="h-5 w-5 text-green-600 mt-1" />
                  <div className="text-left">
                    <div className="font-medium">Try the Demo</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Test ThrustBench with your data</div>
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href="/download">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-orange-600 mt-1" />
                  <div className="text-left">
                    <div className="font-medium">Installation Guide</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Set up ThrustBench locally</div>
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href="https://github.com/lemaurK/gg-testlab-public/wiki">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-purple-600 mt-1" />
                  <div className="text-left">
                    <div className="font-medium">Developer Wiki</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">API reference and development guides</div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Ready to get started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Try ThrustBench now or install it locally for your propulsion data analysis needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/demo">
                    Try Demo Now
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/download">
                    Download & Install
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}