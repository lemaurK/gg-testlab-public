'use client'

import { useState } from 'react'
import { PropulsionMetrics } from '@/lib/metric-extraction'
import { ClassificationResult } from '@/lib/burn-classifier'
import { ParsedData } from '@/lib/file-processors'
import { 
  PDFReportGenerator, 
  ReportData, 
  ReportOptions, 
  downloadPDF 
} from '@/lib/pdf-generator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  FileDown, 
  FileText, 
  Settings, 
  Loader2, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react'

interface FileAnalysisForExport {
  parsedData: ParsedData
  metrics: PropulsionMetrics | null
  classification?: ClassificationResult | null
}

interface PDFExportProps {
  fileAnalyses: FileAnalysisForExport[]
  selectedFileIndex?: number
}

export function PDFExport({ fileAnalyses, selectedFileIndex = 0 }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [exportOptions, setExportOptions] = useState<ReportOptions>({
    includeMetrics: true,
    includeClassification: true,
    includeDataPreview: true,
    includeCharts: false,
    chartElements: []
  })
  const [lastExport, setLastExport] = useState<{ fileName: string; timestamp: Date } | null>(null)

  const currentAnalysis = fileAnalyses[selectedFileIndex]

  const updateOption = (key: keyof ReportOptions, value: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleExport = async () => {
    if (!currentAnalysis) return

    setIsGenerating(true)
    try {
      const generator = new PDFReportGenerator()
      await generator.initialize()

      const reportData: ReportData = {
        fileName: currentAnalysis.parsedData.originalFile.name,
        parsedData: currentAnalysis.parsedData,
        metrics: currentAnalysis.metrics,
        classification: currentAnalysis.classification,
        timestamp: new Date()
      }

      // Capture chart elements if needed
      if (exportOptions.includeCharts) {
        const chartElements: HTMLElement[] = []
        
        // Find chart containers in the DOM
        const visualizationElements = document.querySelectorAll('[data-chart-export="true"]')
        visualizationElements.forEach(element => {
          if (element instanceof HTMLElement) {
            chartElements.push(element)
          }
        })
        
        exportOptions.chartElements = chartElements
      }

      const pdfBytes = await generator.generateReport(reportData, exportOptions)
      
      const fileName = `${currentAnalysis.parsedData.originalFile.name.split('.')[0]}_analysis_report.pdf`
      downloadPDF(pdfBytes, fileName)
      
      setLastExport({ fileName, timestamp: new Date() })
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF report. Please try again.')
    }
    setIsGenerating(false)
  }

  if (fileAnalyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            PDF Report Export
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No analysis data available for export
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            PDF Report Export
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOptions(!showOptions)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {lastExport && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Last: {lastExport.timestamp.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selection */}
        {fileAnalyses.length > 1 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Export File:</h4>
            <div className="flex flex-wrap gap-2">
              {fileAnalyses.map((analysis, index) => (
                <Button
                  key={index}
                  variant={selectedFileIndex === index ? "default" : "outline"}
                  size="sm"
                  disabled={isGenerating}
                >
                  {analysis.parsedData.originalFile.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Export Options */}
        {showOptions && (
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="text-sm font-medium">Report Sections:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metrics"
                  checked={exportOptions.includeMetrics}
                  onCheckedChange={(checked) => updateOption('includeMetrics', checked as boolean)}
                />
                <label htmlFor="metrics" className="text-sm cursor-pointer">
                  Performance Metrics
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="classification"
                  checked={exportOptions.includeClassification}
                  onCheckedChange={(checked) => updateOption('includeClassification', checked as boolean)}
                />
                <label htmlFor="classification" className="text-sm cursor-pointer">
                  AI Classification
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preview"
                  checked={exportOptions.includeDataPreview}
                  onCheckedChange={(checked) => updateOption('includeDataPreview', checked as boolean)}
                />
                <label htmlFor="preview" className="text-sm cursor-pointer">
                  Data Summary
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={exportOptions.includeCharts}
                  onCheckedChange={(checked) => updateOption('includeCharts', checked as boolean)}
                />
                <label htmlFor="charts" className="text-sm cursor-pointer">
                  Visualizations
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Beta
                  </Badge>
                </label>
              </div>
            </div>

            <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                <strong>Chart Export:</strong> Visualization export is experimental and may not work perfectly in all browsers.
              </p>
            </div>
          </div>
        )}

        {/* Current File Info */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium">Current Selection:</h4>
              <p className="text-sm text-gray-600 mt-1">
                {currentAnalysis?.parsedData.originalFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(currentAnalysis?.parsedData.originalFile.size / 1024).toFixed(1)} KB • {' '}
                {currentAnalysis?.parsedData.rows.length} rows • {' '}
                {currentAnalysis?.parsedData.headers.length} columns
              </p>
            </div>
            
            <div className="flex flex-col gap-1">
              {currentAnalysis?.metrics && (
                <Badge variant="outline" className="text-xs">
                  Metrics ✓
                </Badge>
              )}
              {currentAnalysis?.classification && (
                <Badge variant="outline" className="text-xs">
                  AI ✓
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleExport}
            disabled={isGenerating || !currentAnalysis}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-5 w-5" />
                Export PDF Report
              </>
            )}
          </Button>
        </div>

        {/* Export Preview */}
        {currentAnalysis && (
          <div className="text-xs text-gray-500 text-center">
            Report will include: Title page
            {exportOptions.includeMetrics && ', Performance metrics'}
            {exportOptions.includeClassification && ', AI analysis'}
            {exportOptions.includeDataPreview && ', Data summary'}
            {exportOptions.includeCharts && ', Visualizations'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}