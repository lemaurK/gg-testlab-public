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
  Bar,
  BarChart,
  Cell
} from 'recharts'
import { ParsedData, detectCommonColumns } from '@/lib/file-processors'
import { PropulsionMetrics } from '@/lib/metric-extraction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  BarChart3
} from 'lucide-react'

interface DriftVisualizerProps {
  fileAnalyses: Array<{
    parsedData: ParsedData
    metrics: PropulsionMetrics | null
  }>
}

interface AlignedData {
  time: number
  [key: string]: number | null
}

interface MetricComparison {
  metric: string
  unit: string
  values: Array<{
    fileName: string
    value: number | null
    index: number
  }>
  drift: Array<{
    fileName: string
    percentChange: number
    absoluteChange: number
    status: 'increase' | 'decrease' | 'stable'
  }>
}

const COMPARISON_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#87d068', '#ffb347', '#ff6b9d', '#95de64'
]

export function DriftVisualizer({ fileAnalyses }: DriftVisualizerProps) {
  const [selectedRuns, setSelectedRuns] = useState<number[]>(
    fileAnalyses.map((_, index) => index)
  )
  const [alignmentMode, setAlignmentMode] = useState<'start' | 'peak' | 'none'>('start')
  const [viewMode, setViewMode] = useState<'overlay' | 'metrics'>('overlay')

  const alignedData = useMemo(() => {
    if (selectedRuns.length === 0) return []

    const selectedAnalyses = selectedRuns.map(index => fileAnalyses[index])
    const timeSeriesData: AlignedData[] = []
    const maxLength = Math.max(...selectedAnalyses.map(analysis => analysis.parsedData.rows.length))
    
    // Create time-aligned data structure
    const commonTimePoints = new Set<number>()
    
    // Collect all unique time points across runs
    selectedAnalyses.forEach(analysis => {
      const commonColumns = detectCommonColumns(analysis.parsedData.headers)
      const timeCol = commonColumns.time || analysis.parsedData.headers.find(h => 
        analysis.parsedData.inferredTypes[h] === 'timestamp' || h.toLowerCase().includes('time')
      )
      
      if (timeCol) {
        analysis.parsedData.rows.forEach(row => {
          const timeValue = parseFloat(row[timeCol]) || 0
          commonTimePoints.add(timeValue)
        })
      }
    })

    const sortedTimes = Array.from(commonTimePoints).sort((a, b) => a - b)
    
    // Apply alignment offset
    const alignmentOffsets: number[] = selectedAnalyses.map(analysis => {
      if (alignmentMode === 'none') return 0
      
      const metrics = analysis.metrics
      if (!metrics) return 0
      
      if (alignmentMode === 'start' && metrics.burnStartTime !== null) {
        return -metrics.burnStartTime
      } else if (alignmentMode === 'peak' && metrics.peakThrustTime !== null) {
        return -metrics.peakThrustTime
      }
      
      return 0
    })

    // Create aligned dataset
    sortedTimes.forEach(time => {
      const dataPoint: AlignedData = { time }
      
      selectedAnalyses.forEach((analysis, runIndex) => {
        const offset = alignmentOffsets[runIndex]
        const adjustedTime = time - offset
        
        const commonColumns = detectCommonColumns(analysis.parsedData.headers)
        const timeCol = commonColumns.time || analysis.parsedData.headers.find(h => 
          analysis.parsedData.inferredTypes[h] === 'timestamp' || h.toLowerCase().includes('time')
        )
        const thrustCol = commonColumns.thrust || analysis.parsedData.headers.find(h => 
          analysis.parsedData.inferredTypes[h] === 'number' && h.toLowerCase().includes('thrust')
        )
        
        if (timeCol && thrustCol) {
          // Find closest data point for this adjusted time
          const closestRow = analysis.parsedData.rows.reduce((closest, row) => {
            const rowTime = parseFloat(row[timeCol]) || 0
            const closestTime = parseFloat(closest[timeCol]) || 0
            
            return Math.abs(rowTime - adjustedTime) < Math.abs(closestTime - adjustedTime) ? row : closest
          })
          
          const runKey = `Run ${runIndex + 1}: ${analysis.parsedData.originalFile.name.split('.')[0]}`
          dataPoint[runKey] = parseFloat(closestRow[thrustCol]) || null
        }
      })
      
      timeSeriesData.push(dataPoint)
    })

    return timeSeriesData
  }, [selectedRuns, alignmentMode, fileAnalyses])

  const metricComparisons = useMemo(() => {
    if (selectedRuns.length === 0) return []

    const selectedAnalyses = selectedRuns.map(index => fileAnalyses[index])
    const comparisons: MetricComparison[] = []
    
    const metricKeys = [
      { key: 'peakThrust', unit: 'N', name: 'Peak Thrust' },
      { key: 'riseTime', unit: 's', name: 'Rise Time' },
      { key: 'burnDuration', unit: 's', name: 'Burn Duration' },
      { key: 'areaUnderCurve', unit: 'N·s', name: 'Total Impulse' }
    ]

    metricKeys.forEach(({ key, unit, name }) => {
      const values = selectedAnalyses.map((analysis, index) => ({
        fileName: analysis.parsedData.originalFile.name,
        value: analysis.metrics ? (analysis.metrics as any)[key] : null,
        index
      }))

      // Calculate drift relative to first run
      const baseValue = values[0]?.value
      const drift = values.map(v => {
        if (!baseValue || !v.value) {
          return {
            fileName: v.fileName,
            percentChange: 0,
            absoluteChange: 0,
            status: 'stable' as const
          }
        }

        const absoluteChange = v.value - baseValue
        const percentChange = (absoluteChange / baseValue) * 100
        
        let status: 'increase' | 'decrease' | 'stable' = 'stable'
        if (Math.abs(percentChange) > 5) { // 5% threshold
          status = percentChange > 0 ? 'increase' : 'decrease'
        }

        return {
          fileName: v.fileName,
          percentChange,
          absoluteChange,
          status
        }
      })

      comparisons.push({
        metric: name,
        unit,
        values,
        drift
      })
    })

    return comparisons
  }, [selectedRuns, fileAnalyses])

  const toggleRunSelection = (runIndex: number) => {
    setSelectedRuns(prev => 
      prev.includes(runIndex) 
        ? prev.filter(i => i !== runIndex)
        : [...prev, runIndex]
    )
  }

  const formatTooltipValue = (value: number, name: string): [string, string] => {
    if (value === null || isNaN(value)) return ['—', name]
    return [`${value.toFixed(2)} N`, name]
  }

  const formatTooltipLabel = (label: number): string => {
    return `Time: ${label.toFixed(3)}s${alignmentMode !== 'none' ? ' (aligned)' : ''}`
  }

  const getDriftIcon = (status: 'increase' | 'decrease' | 'stable') => {
    switch (status) {
      case 'increase': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decrease': return <TrendingDown className="h-4 w-4 text-blue-500" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getDriftColor = (status: 'increase' | 'decrease' | 'stable') => {
    switch (status) {
      case 'increase': return 'text-red-600 bg-red-50 border-red-200'
      case 'decrease': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'stable': return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (fileAnalyses.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Run Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">
            Upload at least 2 files to compare test runs and analyze drift
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
            <GitCompare className="h-5 w-5" />
            Run Comparison & Drift Analysis
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'overlay' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overlay')}
            >
              Time Overlay
            </Button>
            <Button
              variant={viewMode === 'metrics' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('metrics')}
            >
              Metric Drift
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Run Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Select Runs to Compare:</h4>
          <div className="flex flex-wrap gap-3">
            {fileAnalyses.map((analysis, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox 
                  id={`run-${index}`}
                  checked={selectedRuns.includes(index)}
                  onCheckedChange={() => toggleRunSelection(index)}
                />
                <label 
                  htmlFor={`run-${index}`}
                  className="text-sm flex items-center gap-2 cursor-pointer"
                >
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: COMPARISON_COLORS[index % COMPARISON_COLORS.length] }}
                  />
                  {analysis.parsedData.originalFile.name}
                  {analysis.metrics && (
                    <Badge variant="secondary" className="text-xs">
                      {analysis.metrics.peakThrust?.toFixed(1)}N
                    </Badge>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Alignment Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Time Alignment:</h4>
          <div className="flex gap-2">
            {(['none', 'start', 'peak'] as const).map(mode => (
              <Button
                key={mode}
                variant={alignmentMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAlignmentMode(mode)}
              >
                {mode === 'none' ? 'None' : mode === 'start' ? 'Burn Start' : 'Peak Thrust'}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Alignment helps compare runs with different start times or durations
          </p>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'overlay' ? (
          /* Time Overlay Chart */
          <div className="w-full" style={{ height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={alignedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="time"
                  type="number"
                  scale="linear"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => `${value.toFixed(2)}s`}
                  label={{ 
                    value: alignmentMode !== 'none' ? 'Aligned Time (s)' : 'Time (s)', 
                    position: 'insideBottom', 
                    offset: -10 
                  }}
                />
                <YAxis 
                  label={{ value: 'Thrust (N)', angle: -90, position: 'insideLeft' }}
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
                
                {/* Data Lines for each selected run */}
                {Object.keys(alignedData[0] || {})
                  .filter(key => key !== 'time')
                  .map((runKey, index) => (
                    <Line
                      key={runKey}
                      type="monotone"
                      dataKey={runKey}
                      stroke={COMPARISON_COLORS[index % COMPARISON_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                      name={runKey}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Metric Drift Analysis */
          <div className="space-y-6">
            {metricComparisons.map((comparison, compIndex) => (
              <div key={compIndex}>
                <h4 className="text-lg font-medium mb-4">{comparison.metric}</h4>
                
                {/* Metric Values Bar Chart */}
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparison.values} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="fileName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis 
                        label={{ 
                          value: `${comparison.metric} (${comparison.unit})`, 
                          angle: -90, 
                          position: 'insideLeft' 
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${(value as number)?.toFixed(3)} ${comparison.unit}`, comparison.metric]}
                      />
                      <Bar dataKey="value">
                        {comparison.values.map((entry, index) => (
                          <Cell 
                            key={index} 
                            fill={COMPARISON_COLORS[entry.index % COMPARISON_COLORS.length]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Drift Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {comparison.drift.map((drift, driftIndex) => (
                    <div 
                      key={driftIndex}
                      className={`p-3 rounded-lg border ${getDriftColor(drift.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate">
                          {drift.fileName.split('.')[0]}
                        </span>
                        {getDriftIcon(drift.status)}
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="font-medium">Change:</span> {drift.percentChange.toFixed(1)}%
                        </div>
                        <div>
                          <span className="font-medium">Δ:</span> {drift.absoluteChange >= 0 ? '+' : ''}{drift.absoluteChange.toFixed(3)} {comparison.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Statistics */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Comparison Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Runs Compared:</span>
              <div className="font-mono font-medium">{selectedRuns.length}</div>
            </div>
            <div>
              <span className="text-gray-600">Alignment:</span>
              <div className="font-mono font-medium capitalize">{alignmentMode}</div>
            </div>
            <div>
              <span className="text-gray-600">Data Points:</span>
              <div className="font-mono font-medium">{alignedData.length}</div>
            </div>
            <div>
              <span className="text-gray-600">Significant Drifts:</span>
              <div className="font-mono font-medium">
                {metricComparisons.reduce((count, comp) => 
                  count + comp.drift.filter(d => d.status !== 'stable').length, 0
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}