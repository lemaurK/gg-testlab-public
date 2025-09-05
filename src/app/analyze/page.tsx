'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileUploader } from '@/components/file-uploader'
import { DataPreview } from '@/components/data-preview'
import { MetricsDisplay } from '@/components/metrics-display'
import { DataVisualization } from '@/components/data-visualization'
import { DriftVisualizer } from '@/components/drift-visualizer'
import { AIClassification } from '@/components/ai-classification'
import { PDFExport } from '@/components/pdf-export'
import { PrivacyDisclaimer } from '@/components/privacy-disclaimer'
import { ThemeToggle } from '@/components/theme-toggle'
import { ModeIndicator } from '@/components/mode-indicator'
import { processFile, ParsedData, detectCommonColumns } from '@/lib/file-processors'
import { extractMetricsFromFile, PropulsionMetrics } from '@/lib/metric-extraction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rocket, BarChart3, Upload, Loader2, ArrowLeft, Play, FileText, Zap } from 'lucide-react'
import { shouldShowPrivacyDisclaimer } from '@/lib/deployment-modes'
import { trackEvent } from '@/components/analytics'
import { ErrorBoundary } from '@/components/error-boundary'

interface FileAnalysis {
  parsedData: ParsedData
  metrics: PropulsionMetrics | null
}

export default function ThrustBenchAnalyze() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileAnalyses, setFileAnalyses] = useState<FileAnalysis[]>([])
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [, setPrivacyAccepted] = useState(false)
  const [showPrivacyDisclaimer, setShowPrivacyDisclaimer] = useState(shouldShowPrivacyDisclaimer())

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    if (files.length === 0) {
      setFileAnalyses([])
      setErrors([])
    }
  }

  const handlePrivacyAccept = () => {
    setPrivacyAccepted(true)
    setShowPrivacyDisclaimer(false)
    trackEvent('privacy_disclaimer_accepted', { mode: 'public' })
  }

  const handlePrivacyDecline = () => {
    window.location.href = 'https://github.com/lemaurK/gg-testlab-local'
  }

  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) return

    setProcessing(true)
    setErrors([])
    const results: FileAnalysis[] = []
    const newErrors: string[] = []

    for (const file of selectedFiles) {
      try {
        const result = await processFile(file)
        if (result.success && result.data) {
          const parsedData = result.data
          
          let metrics: PropulsionMetrics | null = null
          const commonColumns = detectCommonColumns(parsedData.headers)
          
          if (commonColumns.time && commonColumns.thrust) {
            try {
              metrics = extractMetricsFromFile(
                parsedData.rows, 
                commonColumns.time, 
                commonColumns.thrust
              )
            } catch (error) {
              newErrors.push(`${file.name} metrics: ${error instanceof Error ? error.message : 'Metric extraction failed'}`)
            }
          } else {
            const numericColumns = parsedData.headers.filter(header => 
              parsedData.inferredTypes[header] === 'number'
            )
            const timeColumns = parsedData.headers.filter(header => 
              parsedData.inferredTypes[header] === 'timestamp' || 
              parsedData.inferredTypes[header] === 'number'
            )
            
            if (timeColumns.length > 0 && numericColumns.length > 0) {
              const timeCol = timeColumns[0]
              const thrustCol = numericColumns.find(col => col !== timeCol) || numericColumns[0]
              
              try {
                metrics = extractMetricsFromFile(parsedData.rows, timeCol, thrustCol)
                newErrors.push(`${file.name}: Using auto-detected columns - Time: '${timeCol}', Thrust: '${thrustCol}'`)
              } catch (error) {
                newErrors.push(`${file.name} metrics: Auto-detection failed - ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }
          }

          results.push({
            parsedData,
            metrics
          })
        } else {
          newErrors.push(`${file.name}: ${result.error}`)
        }
      } catch (error) {
        newErrors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    setFileAnalyses(results)
    setErrors(newErrors)
    setProcessing(false)
    
    trackEvent('analyze_files_processed', { 
      file_count: selectedFiles.length,
      successful_count: results.length,
      error_count: newErrors.length,
      has_metrics: results.some(r => r.metrics !== null)
    })
  }

  return (
    <>
      {showPrivacyDisclaimer && (
        <PrivacyDisclaimer 
          onAccept={handlePrivacyAccept}
          onDecline={handlePrivacyDecline}
        />
      )}
      
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Rocket className="h-10 w-10 text-blue-600" />
                <span className="text-4xl font-bold text-gray-900 dark:text-white">ThrustBench</span>
              </Link>
              <Badge variant="outline" className="ml-2">Data Analysis</Badge>
              <div className="flex items-center gap-2 ml-4">
                <ModeIndicator />
                <ThemeToggle />
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              Upload your propulsion test data files for comprehensive analysis including metrics extraction, 
              visualization, and AI-powered insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/demo" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Try Demo
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {fileAnalyses.length === 0 && (
              <>
                {/* File Upload */}
                <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Upload className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle className="text-2xl">Upload Your Propulsion Data</CardTitle>
                        <p className="text-gray-600 dark:text-gray-300">
                          Select your test data files for comprehensive analysis
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">📋 Supported File Formats:</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        ThrustBench automatically detects and processes various data formats:
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• <strong>CSV files</strong> - Comma, semicolon, pipe, or space delimited</li>
                        <li>• <strong>TSV files</strong> - Tab-separated values</li>
                        <li>• <strong>JSON files</strong> - Structured time series data</li>
                        <li>• <strong>Auto-detection</strong> - Thrust, time, temperature, and pressure columns</li>
                        <li>• <strong>Multiple formats</strong> - Mix different file types in one analysis</li>
                      </ul>
                    </div>

                    <FileUploader 
                      onFilesSelected={handleFilesSelected}
                      maxFiles={10}
                    />

                    {selectedFiles.length > 0 && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">✅ Ready to Process</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected for analysis
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectedFiles.map((file, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {file.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button 
                          onClick={handleProcessFiles}
                          disabled={processing}
                          size="lg"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {processing ? (
                            <>
                              <Zap className="mr-2 h-4 w-4 animate-spin" />
                              Processing {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}...
                            </>
                          ) : (
                            <>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Analyze {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Metrics Extraction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Automatic calculation of key propulsion metrics including peak thrust, 
                        rise time, burn duration, and specific impulse.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-green-600" />
                        AI Classification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Machine learning analysis to classify engine type, performance characteristics,
                        and detect anomalies in your test data.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Export Reports
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Generate comprehensive PDF reports with visualizations, 
                        metrics, and analysis results for documentation and sharing.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Results */}
            {fileAnalyses.length > 0 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analysis Results</h2>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => {
                        setFileAnalyses([])
                        setSelectedFiles([])
                        setErrors([])
                      }}
                      variant="outline"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Upload More Files
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/demo" className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Try Demo Data
                      </Link>
                    </Button>
                  </div>
                </div>

                {fileAnalyses.map((analysis, index) => (
                  <div key={index} className="space-y-6">
                    <DataPreview 
                      data={analysis.parsedData}
                      fileName={analysis.parsedData.originalFile.name}
                    />
                    
                    {analysis.metrics && (
                      <MetricsDisplay metrics={analysis.metrics} />
                    )}
                    
                    <DataVisualization 
                      data={analysis.parsedData}
                      fileName={analysis.parsedData.originalFile.name}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <DriftVisualizer 
                        data={analysis.parsedData}
                        fileName={analysis.parsedData.originalFile.name}
                      />
                      
                      <AIClassification 
                        data={analysis.parsedData}
                        fileName={analysis.parsedData.originalFile.name}
                      />
                    </div>
                    
                    <PDFExport 
                      data={analysis.parsedData}
                      metrics={analysis.metrics}
                      fileName={analysis.parsedData.originalFile.name}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Error Display */}
            {errors.length > 0 && (
              <Card className="max-w-4xl mx-auto bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-300">Processing Errors & Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-red-600 dark:text-red-400 text-sm">{error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </ErrorBoundary>
    </>
  )
}