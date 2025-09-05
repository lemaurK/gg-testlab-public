'use client'

import { useState, useEffect } from 'react'
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
import { Rocket, BarChart3, Play, ArrowLeft, Download, Zap, Eye, Flame, Gauge, Timer, TrendingUp, Upload } from 'lucide-react'
import { shouldShowPrivacyDisclaimer } from '@/lib/deployment-modes'
import { trackEvent } from '@/components/analytics'
import { demoDatasets, DemoDataset } from '@/lib/demo-datasets'
import { ErrorBoundary, ComponentErrorBoundary } from '@/components/error-boundary'

interface FileAnalysis {
  parsedData: ParsedData
  metrics: PropulsionMetrics | null
}

function getDatasetIcon(type: string) {
  switch (type) {
    case 'Bipropellant Liquid Engine': return <Flame className="h-5 w-5 text-orange-500" />
    case 'Composite Propellant Grain': return <Zap className="h-5 w-5 text-red-500" />
    case 'Pulsed Nitrogen RCS': return <Gauge className="h-5 w-5 text-blue-500" />
    case 'Hall Effect Thruster': return <TrendingUp className="h-5 w-5 text-purple-500" />
    case 'HTPB/N2O Hybrid': return <Timer className="h-5 w-5 text-green-500" />
    case 'Electrothermal Thruster': return <Zap className="h-5 w-5 text-yellow-500" />
    default: return <Rocket className="h-5 w-5 text-gray-500 dark:text-gray-400" />
  }
}

export default function ThrustBenchDemo() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileAnalyses, setFileAnalyses] = useState<FileAnalysis[]>([])
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showPrivacyDisclaimer, setShowPrivacyDisclaimer] = useState(shouldShowPrivacyDisclaimer())
  const [demoStarted, setDemoStarted] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState<DemoDataset>(demoDatasets[0])

  const handlePrivacyAccept = () => {
    setShowPrivacyDisclaimer(false)
    trackEvent('privacy_disclaimer_accepted', { mode: 'demo' })
  }

  const handlePrivacyDecline = () => {
    window.location.href = 'https://github.com/lemaurK/gg-testlab-local'
  }

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    if (files.length === 0) {
      setFileAnalyses([])
      setErrors([])
    }
  }

  const handleStartDemo = async (dataset: DemoDataset) => {
    setSelectedDataset(dataset)
    setDemoStarted(true)
    setProcessing(true)
    setErrors([])

    try {
      // Validate dataset has csvData function
      if (!dataset.csvData) {
        throw new Error(`Dataset ${dataset.id} is missing CSV data`)
      }

      // Generate CSV data (lazy loading - only when needed)
      const csvData = dataset.csvData()

      // Create a sample file from the selected dataset
      const fileName = `${dataset.id}-test.csv`
      const sampleFile = new File([csvData], fileName, { 
        type: 'text/csv' 
      })

      const result = await processFile(sampleFile)
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
            console.warn('Failed to extract metrics:', error)
          }
        }

        setFileAnalyses([{
          parsedData,
          metrics
        }])
        
        trackEvent('demo_started', { 
          dataset: dataset.id,
          dataset_type: dataset.type,
          columns: parsedData.headers.length,
          rows: parsedData.rows.length
        })
      } else {
        setErrors([result.error || 'Failed to process sample data'])
      }
    } catch (error) {
      console.error('Demo processing error:', error)
      setErrors([`Error processing dataset '${dataset.name}': ${error instanceof Error ? error.message : 'Unknown error'}`])
    }
    
    setProcessing(false)
  }

  const processFiles = async () => {
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
              console.warn(`Failed to extract metrics from ${file.name}:`, error)
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
    
    trackEvent('demo_files_processed', { 
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
            <Badge variant="outline" className="ml-2">Interactive Demo</Badge>
            <div className="flex items-center gap-2 ml-4">
              <ModeIndicator />
              <ThemeToggle />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            Experience ThrustBench with realistic propulsion test data from various engine types. Choose a dataset below to see detailed analysis capabilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/analyze" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analyze Your Data
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {!demoStarted && fileAnalyses.length === 0 && (
            <>
              {/* Dataset Selection */}
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Choose a Propulsion Test Dataset
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Select from realistic test data representing different propulsion technologies
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {demoDatasets.map((dataset) => (
                    <Card 
                      key={dataset.id} 
                      className="transition-all duration-200 hover:shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          {getDatasetIcon(dataset.type)}
                          <CardTitle className="text-lg">{dataset.name}</CardTitle>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{dataset.type}</p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {dataset.description}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            <Timer className="h-3 w-3 mx-auto mb-1" />
                            <div className="font-medium">{dataset.burnTime}</div>
                            <div className="text-gray-500 dark:text-gray-400">Duration</div>
                          </div>
                          <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            <TrendingUp className="h-3 w-3 mx-auto mb-1" />
                            <div className="font-medium">{dataset.maxThrust}</div>
                            <div className="text-gray-500 dark:text-gray-400">Max Thrust</div>
                          </div>
                          <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            <Gauge className="h-3 w-3 mx-auto mb-1" />
                            <div className="font-medium">{dataset.isp}</div>
                            <div className="text-gray-500 dark:text-gray-400">ISP</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 mb-4 flex flex-wrap gap-1">
                          {dataset.characteristics.slice(0, 2).map((char, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {char}
                            </Badge>
                          ))}
                          {dataset.characteristics.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{dataset.characteristics.length - 2} more
                            </Badge>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handleStartDemo(dataset)}
                          disabled={processing}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {processing && selectedDataset?.id === dataset.id ? (
                            <>
                              <Zap className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Analyze Dataset
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Upload className="h-6 w-6 text-green-600" />
                      <div>
                        <CardTitle className="text-xl">Upload Your Own Data</CardTitle>
                        <p className="text-gray-600 dark:text-gray-300">Or upload your own propulsion test files for analysis</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FileUploader 
                      onFilesSelected={handleFilesSelected}
                      maxFiles={10}
                      maxSize={50 * 1024 * 1024} // 50MB
                    />
                    
                    {selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <Button 
                          onClick={processFiles}
                          disabled={processing}
                          className="w-full"
                        >
                          {processing ? (
                            <>
                              <Zap className="mr-2 h-4 w-4 animate-spin" />
                              Processing Files...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Analyze Files ({selectedFiles.length})
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Results Display */}
          {fileAnalyses.length > 0 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analysis Results</h2>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => {
                      setFileAnalyses([])
                      setDemoStarted(false)
                      setSelectedFiles([])
                      setErrors([])
                    }}
                    variant="outline"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Try Another Dataset
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/analyze" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Your Own Data
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
            <Card className="max-w-2xl mx-auto bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-300">Processing Errors</CardTitle>
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