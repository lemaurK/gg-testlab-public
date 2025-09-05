'use client'

import { useState, useMemo } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts'
import { ParsedData, detectCommonColumns } from '@/lib/file-processors'
import { PropulsionMetrics } from '@/lib/metric-extraction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  LineChart as LineChartIcon, 
  Settings, 
  Download, 
  ZoomIn,
  Eye,
  EyeOff 
} from 'lucide-react'

interface DataVisualizationProps {
  fileAnalyses: Array<{
    parsedData: ParsedData
    metrics: PropulsionMetrics | null
  }>
}

interface PlotColumn {
  key: string
  name: string
  type: string
  visible: boolean
  color: string
}

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#87d068', '#ffb347', '#ff6b9d', '#95de64'
]

export function DataVisualization({ fileAnalyses }: DataVisualizationProps) {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [showMetricOverlay, setShowMetricOverlay] = useState(true)
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null)

  const currentAnalysis = fileAnalyses[selectedFileIndex]
  
  const { plotData, availableColumns, timeColumn } = useMemo(() => {
    if (!currentAnalysis) {
      return { plotData: [], availableColumns: [], timeColumn: null }
    }

    const { parsedData } = currentAnalysis
    const commonColumns = detectCommonColumns(parsedData.headers)
    
    // Find time column (prefer detected time column, fallback to first numeric/timestamp column)
    let timeCol = commonColumns.time
    if (!timeCol) {
      timeCol = parsedData.headers.find(header => 
        parsedData.inferredTypes[header] === 'timestamp' ||
        (parsedData.inferredTypes[header] === 'number' && header.toLowerCase().includes('time'))
      ) || parsedData.headers[0]
    }

    // Create available columns for plotting
    const columns: PlotColumn[] = parsedData.headers
      .filter(header => header !== timeCol && parsedData.inferredTypes[header] === 'number')
      .map((header, index) => ({
        key: header,
        name: header,
        type: parsedData.inferredTypes[header],
        visible: true,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))

    // Transform data for Recharts
    const chartData = parsedData.rows.map(row => {
      const point: any = {}
      
      // Convert time to numeric for proper plotting
      if (timeCol) {
        const timeValue = row[timeCol]
        if (parsedData.inferredTypes[timeCol] === 'timestamp') {
          point.time = new Date(timeValue as string | number | Date).getTime() / 1000 // Convert to seconds
        } else {
          point.time = parseFloat(timeValue as string) || 0
        }
      }
      
      // Add all numeric columns
      columns.forEach(col => {
        const value = parseFloat(row[col.key] as string)
        point[col.key] = isNaN(value) ? null : value
      })
      
      return point
    }).sort((a, b) => a.time - b.time) // Sort by time

    return { 
      plotData: chartData, 
      availableColumns: columns, 
      timeColumn: timeCol 
    }
  }, [currentAnalysis])

  const [visibleColumns, setVisibleColumns] = useState<PlotColumn[]>(availableColumns)

  // Update visible columns when file changes
  useMemo(() => {
    setVisibleColumns(availableColumns)
  }, [availableColumns])

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => 
      prev.map(col => 
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const formatXAxisTick = (value: number): string => {
    return value.toFixed(2) + 's'
  }

  const formatTooltipValue = (value: number, name: string): [string, string] => {
    if (value === null || isNaN(value)) return ['—', name]
    
    const column = visibleColumns.find(col => col.key === name)
    if (!column) return [value.toFixed(3), name]
    
    // Format based on column name hints
    if (name.toLowerCase().includes('temp')) {
      return [`${value.toFixed(1)}°C`, name]
    } else if (name.toLowerCase().includes('pressure')) {
      return [`${value.toFixed(1)} psi`, name]
    } else if (name.toLowerCase().includes('thrust') || name.toLowerCase().includes('force')) {
      return [`${value.toFixed(1)} N`, name]
    }
    
    return [value.toFixed(3), name]
  }

  const formatTooltipLabel = (label: number): string => {
    return `Time: ${label.toFixed(3)}s`
  }

  const getMetricLines = () => {
    const metrics = currentAnalysis?.metrics
    if (!metrics || !showMetricOverlay) return []

    const lines = []
    
    // Peak thrust time
    if (metrics.peakThrustTime !== null) {
      lines.push(
        <ReferenceLine 
          key="peak" 
          x={metrics.peakThrustTime} 
          stroke="#ff4444" 
          strokeDasharray="5 5"
          label={{ value: "Peak", position: "insideTopRight" }}
        />
      )
    }
    
    // Burn start/end times
    if (metrics.burnStartTime !== null) {
      lines.push(
        <ReferenceLine 
          key="start" 
          x={metrics.burnStartTime} 
          stroke="#44ff44" 
          strokeDasharray="3 3"
          label={{ value: "Start", position: "insideTopLeft" }}
        />
      )
    }
    
    if (metrics.burnEndTime !== null) {
      lines.push(
        <ReferenceLine 
          key="end" 
          x={metrics.burnEndTime} 
          stroke="#44ff44" 
          strokeDasharray="3 3"
          label={{ value: "End", position: "insideTopLeft" }}
        />
      )
    }

    return lines
  }

  if (fileAnalyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Data Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Upload and process files to view visualizations</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Time-Series Visualization
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetricOverlay(!showMetricOverlay)}
              className="flex items-center gap-1"
            >
              {showMetricOverlay ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Metrics Overlay
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Selection */}
        {fileAnalyses.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {fileAnalyses.map((analysis, index) => (
              <Button
                key={index}
                variant={selectedFileIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFileIndex(index)}
              >
                {analysis.parsedData.originalFile.name}
              </Button>
            ))}
          </div>
        )}

        {/* Column Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Visible Columns:</h4>
          <div className="flex flex-wrap gap-3">
            {visibleColumns.map(column => (
              <div key={column.key} className="flex items-center gap-2">
                <Checkbox 
                  id={column.key}
                  checked={column.visible}
                  onCheckedChange={() => toggleColumnVisibility(column.key)}
                />
                <label 
                  htmlFor={column.key}
                  className="text-sm flex items-center gap-2 cursor-pointer"
                >
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: column.color }}
                  />
                  {column.name}
                  <Badge variant="secondary" className="text-xs">
                    {column.type}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chart */}
        <div className="w-full" style={{ height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={plotData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="time"
                type="number"
                scale="linear"
                domain={zoomDomain || ['dataMin', 'dataMax']}
                tickFormatter={formatXAxisTick}
                label={{ value: 'Time (s)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={formatTooltipLabel}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              
              {/* Data Lines */}
              {visibleColumns
                .filter(col => col.visible)
                .map(column => (
                  <Line
                    key={column.key}
                    type="monotone"
                    dataKey={column.key}
                    stroke={column.color}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    name={column.name}
                  />
                ))}
              
              {/* Metric Reference Lines */}
              {getMetricLines()}
              
              {/* Brush for zooming */}
              <Brush 
                dataKey="time" 
                height={30}
                stroke="#8884d8"
                tickFormatter={formatXAxisTick}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Data Points</div>
            <div className="text-gray-600">{plotData.length}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Time Range</div>
            <div className="text-gray-600">
              {plotData.length > 0 
                ? `${plotData[0].time?.toFixed(2)}s - ${plotData[plotData.length - 1].time?.toFixed(2)}s`
                : '—'
              }
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Active Series</div>
            <div className="text-gray-600">
              {visibleColumns.filter(col => col.visible).length} / {visibleColumns.length}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">File Size</div>
            <div className="text-gray-600">
              {(currentAnalysis?.parsedData.originalFile.size / 1024).toFixed(1)} KB
            </div>
          </div>
        </div>

        {/* Legend for Metric Lines */}
        {showMetricOverlay && currentAnalysis?.metrics && (
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            {currentAnalysis.metrics.peakThrustTime !== null && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-red-500 border-dashed border-t"></div>
                Peak Thrust Time
              </div>
            )}
            {currentAnalysis.metrics.burnStartTime !== null && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-green-500 border-dashed border-t"></div>
                Burn Start/End
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}