'use client'

import { useState, useEffect } from 'react'
import { PropulsionMetrics } from '@/lib/metric-extraction'
import { 
  ClassificationResult, 
  getClassifier, 
  getClassificationDisplay,
  ClassifierOptions 
} from '@/lib/burn-classifier'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Info,
  Zap,
  BarChart3,
  TrendingUp
} from 'lucide-react'

interface AIClassificationProps {
  metrics: PropulsionMetrics
  fileName: string
}

export function AIClassification({ metrics, fileName }: AIClassificationProps) {
  const [classificationEnabled, setClassificationEnabled] = useState(false)
  const [isClassifying, setIsClassifying] = useState(false)
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  const classifier = getClassifier({ enabled: classificationEnabled, useRemoteModel: false })

  useEffect(() => {
    if (classificationEnabled && !modelLoaded) {
      loadModel()
    }
  }, [classificationEnabled, modelLoaded])

  useEffect(() => {
    if (classificationEnabled && modelLoaded && metrics) {
      performClassification()
    }
  }, [classificationEnabled, modelLoaded, metrics])

  const loadModel = async () => {
    setIsClassifying(true)
    try {
      const loaded = await classifier.loadModel()
      setModelLoaded(loaded)
      
      if (!loaded) {
        console.warn('Failed to load AI classification model')
      }
    } catch (error) {
      console.error('Error loading model:', error)
      setModelLoaded(false)
    }
    setIsClassifying(false)
  }

  const performClassification = async () => {
    if (!metrics || !classificationEnabled || !modelLoaded) return
    
    setIsClassifying(true)
    try {
      const result = await classifier.classify(metrics)
      setClassificationResult(result)
    } catch (error) {
      console.error('Classification error:', error)
      setClassificationResult(null)
    }
    setIsClassifying(false)
  }

  const handleToggle = (enabled: boolean) => {
    setClassificationEnabled(enabled)
    classifier.setEnabled(enabled)
    
    if (!enabled) {
      setClassificationResult(null)
      setModelLoaded(false)
    }
  }

  const display = classificationResult ? getClassificationDisplay(classificationResult) : null

  const getFeatureIcon = (featureName: string) => {
    if (featureName.includes('thrust') || featureName.includes('Thrust')) {
      return <Zap className="h-3 w-3" />
    } else if (featureName.includes('time') || featureName.includes('Time')) {
      return <TrendingUp className="h-3 w-3" />
    } else {
      return <BarChart3 className="h-3 w-3" />
    }
  }

  const formatFeatureValue = (name: string, value: number): string => {
    if (name.includes('Time') || name.includes('Duration')) {
      return `${value.toFixed(3)}s`
    } else if (name.includes('Thrust') || name.includes('Force')) {
      return `${value.toFixed(1)}N`
    } else if (name.includes('Ratio') || name.includes('Efficiency')) {
      return value.toFixed(3)
    } else if (name.includes('Count')) {
      return Math.round(value).toString()
    } else {
      return value.toFixed(2)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Burn Classification
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Enable AI</span>
              <Switch
                checked={classificationEnabled}
                onCheckedChange={handleToggle}
                disabled={isClassifying}
              />
            </div>
            {classificationEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!classificationEnabled ? (
          <div className="text-center py-8">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">AI Classification Disabled</p>
            <p className="text-sm text-gray-400">
              Enable AI analysis to detect anomalous burn patterns
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Loading State */}
            {isClassifying && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>{modelLoaded ? 'Analyzing burn pattern...' : 'Loading AI model...'}</span>
                </div>
              </div>
            )}

            {/* Model Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${modelLoaded ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm">
                  Model Status: {modelLoaded ? 'Ready' : 'Not Loaded'}
                </span>
              </div>
              
              {modelLoaded && classificationResult && (
                <Badge variant="outline" className="text-xs">
                  Mock Model v1.0
                </Badge>
              )}
            </div>

            {/* Classification Result */}
            {display && classificationResult && !isClassifying && (
              <div className="space-y-4">
                {/* Main Classification */}
                <div className={`p-4 rounded-lg border ${display.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{display.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{display.label}</h3>
                        <p className="text-sm opacity-80">{display.confidenceText}</p>
                      </div>
                    </div>
                    
                    <Progress 
                      value={classificationResult.confidence * 100} 
                      className="w-24"
                    />
                  </div>
                  
                  <p className="text-sm mb-3">{display.interpretation}</p>
                  
                  {/* Reasoning */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Analysis Reasoning
                    </h4>
                    <ul className="text-sm space-y-1">
                      {classificationResult.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Feature Details */}
                {showDetails && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Feature Analysis
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(classificationResult.features).map(([name, value]) => (
                        <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            {getFeatureIcon(name)}
                            <span className="font-medium">{name}</span>
                          </div>
                          <span className="font-mono">
                            {formatFeatureValue(name, value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model Info */}
                <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="flex items-center gap-2 mb-1">
                    <Info className="h-3 w-3" />
                    <strong>Note:</strong> This is a demonstration using a mock classifier.
                  </p>
                  <p>
                    In production, this would use a trained ONNX.js model for accurate 
                    anomaly detection based on historical burn data.
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {classificationEnabled && !isClassifying && !classificationResult && modelLoaded && (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <p className="text-gray-600 mb-2">Classification Failed</p>
                <p className="text-sm text-gray-500">
                  Unable to analyze this burn pattern
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={performClassification}
                  className="mt-3"
                >
                  Retry Analysis
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}