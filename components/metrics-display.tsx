'use client'

import { PropulsionMetrics } from '@/lib/metric-extraction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Zap, Timer, Calculator, AlertTriangle, TrendingUp } from 'lucide-react'

interface MetricsDisplayProps {
  metrics: PropulsionMetrics
  fileName: string
}

export function MetricsDisplay({ metrics, fileName }: MetricsDisplayProps) {
  const formatValue = (value: number | null, unit: string, precision: number = 2): string => {
    if (value === null || isNaN(value)) {
      return '—'
    }
    return `${value.toFixed(precision)} ${unit}`
  }

  const formatTime = (time: number | null): string => {
    if (time === null || isNaN(time)) {
      return '—'
    }
    return `${time.toFixed(3)} s`
  }

  const getMetricStatus = (value: number | null): 'success' | 'warning' | 'error' => {
    if (value === null || isNaN(value)) {
      return 'error'
    }
    return 'success'
  }

  const metricCards = [
    {
      title: 'Peak Thrust',
      value: formatValue(metrics.peakThrust, 'N', 1),
      time: formatTime(metrics.peakThrustTime),
      icon: <Zap className="h-5 w-5" />,
      status: getMetricStatus(metrics.peakThrust),
      description: 'Maximum thrust value during burn'
    },
    {
      title: 'Rise Time',
      value: formatTime(metrics.riseTime),
      time: null,
      icon: <TrendingUp className="h-5 w-5" />,
      status: getMetricStatus(metrics.riseTime),
      description: 'Time from 10% to 90% of peak thrust'
    },
    {
      title: 'Burn Duration',
      value: formatTime(metrics.burnDuration),
      time: null,
      icon: <Timer className="h-5 w-5" />,
      status: getMetricStatus(metrics.burnDuration),
      description: 'Total thrust above threshold duration'
    },
    {
      title: 'Total Impulse',
      value: formatValue(metrics.areaUnderCurve, 'N·s', 1),
      time: null,
      icon: <Calculator className="h-5 w-5" />,
      status: getMetricStatus(metrics.areaUnderCurve),
      description: 'Area under thrust-time curve'
    }
  ]

  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Propulsion Metrics: {fileName}</span>
          <Badge variant="outline" className="text-sm">
            Analysis Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warnings */}
        {metrics.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Analysis Warnings
            </h4>
            {metrics.warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                {warning}
              </div>
            ))}
          </div>
        )}

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((metric, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="text-sm font-medium">{metric.title}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-lg font-bold">{metric.value}</div>
                {metric.time && (
                  <div className="text-xs opacity-75">at {metric.time}</div>
                )}
                <div className="text-xs opacity-75">{metric.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Burn Phase Details */}
        {metrics.burnStartTime !== null && metrics.burnEndTime !== null && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Burn Phase Timeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-300">Burn Start:</span>
                <div className="font-mono font-medium">{formatTime(metrics.burnStartTime)}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">Peak Thrust:</span>
                <div className="font-mono font-medium">{formatTime(metrics.peakThrustTime)}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">Burn End:</span>
                <div className="font-mono font-medium">{formatTime(metrics.burnEndTime)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <h4 className="text-sm font-medium mb-3 text-blue-800">Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Specific Impulse:</span>
              <div className="font-mono font-medium text-blue-900">
                {metrics.areaUnderCurve && metrics.peakThrust 
                  ? `${(metrics.areaUnderCurve / (metrics.peakThrust * (metrics.burnDuration || 1))).toFixed(2)} s`
                  : '—'
                }
              </div>
            </div>
            <div>
              <span className="text-blue-700">Thrust-to-Weight:</span>
              <div className="font-mono font-medium text-blue-900">
                {metrics.peakThrust 
                  ? `${(metrics.peakThrust / 9.81).toFixed(1)} kg` 
                  : '—'
                }
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-600 mt-2">
            * Calculated assuming standard gravity. Actual T/W depends on motor mass.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}