import { PropulsionMetrics } from './metric-extraction'

export interface ClassificationResult {
  prediction: 'nominal' | 'outlier'
  confidence: number
  reasoning: string[]
  features: Record<string, number>
}

export interface ClassifierOptions {
  enabled: boolean
  useRemoteModel: boolean
  modelPath?: string
}

// Feature extraction from metrics for ML model
export function extractFeatures(metrics: PropulsionMetrics): Record<string, number> {
  const features: Record<string, number> = {}
  
  // Primary metrics
  features.peakThrust = metrics.peakThrust ?? 0
  features.riseTime = metrics.riseTime ?? 0
  features.burnDuration = metrics.burnDuration ?? 0
  features.totalImpulse = metrics.areaUnderCurve ?? 0
  
  // Derived features
  if (metrics.peakThrust && metrics.burnDuration) {
    features.averageThrust = (metrics.areaUnderCurve ?? 0) / metrics.burnDuration
    features.thrustToWeight = metrics.peakThrust / 9.81 // Assuming 1kg for T/W calc
  } else {
    features.averageThrust = 0
    features.thrustToWeight = 0
  }
  
  // Performance ratios
  if (metrics.peakThrust && metrics.riseTime) {
    features.riseRate = metrics.peakThrust / metrics.riseTime // N/s
  } else {
    features.riseRate = 0
  }
  
  // Burn efficiency (impulse per thrust)
  if (metrics.peakThrust) {
    features.burnEfficiency = (metrics.areaUnderCurve ?? 0) / metrics.peakThrust
  } else {
    features.burnEfficiency = 0
  }
  
  // Time ratios
  if (metrics.burnDuration && metrics.peakThrustTime && metrics.burnStartTime) {
    const timeToPeak = metrics.peakThrustTime - metrics.burnStartTime
    features.timeToPeakRatio = timeToPeak / metrics.burnDuration
  } else {
    features.timeToPeakRatio = 0.5 // Default to middle
  }
  
  // Warning indicators (as numerical features)
  features.hasWarnings = metrics.warnings.length > 0 ? 1 : 0
  features.warningCount = metrics.warnings.length
  
  return features
}

// Mock classifier implementation
// In production, this would load an ONNX model and perform inference
export class BurnClassifier {
  private enabled: boolean
  private modelLoaded: boolean = false
  
  constructor(options: ClassifierOptions) {
    this.enabled = options.enabled
  }
  
  async loadModel(modelPath?: string): Promise<boolean> {
    // Mock model loading - in production this would use ONNX.js
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // For now, simulate successful model loading
      this.modelLoaded = true
      return true
    } catch (error) {
      console.error('Failed to load classification model:', error)
      this.modelLoaded = false
      return false
    }
  }
  
  async classify(metrics: PropulsionMetrics): Promise<ClassificationResult> {
    if (!this.enabled) {
      return {
        prediction: 'nominal',
        confidence: 0,
        reasoning: ['Classification disabled'],
        features: {}
      }
    }
    
    if (!this.modelLoaded) {
      // Try to load the model
      await this.loadModel()
      
      if (!this.modelLoaded) {
        return {
          prediction: 'nominal',
          confidence: 0,
          reasoning: ['Model not available'],
          features: {}
        }
      }
    }
    
    const features = extractFeatures(metrics)
    
    // Mock classification logic - in production, this would use the ONNX model
    const classification = this.mockClassify(features, metrics)
    
    return {
      ...classification,
      features
    }
  }
  
  private mockClassify(features: Record<string, number>, metrics: PropulsionMetrics): Omit<ClassificationResult, 'features'> {
    // Mock classification based on heuristic rules
    // This simulates what a trained model might output
    
    const reasoning: string[] = []
    let outlierScore = 0
    
    // Check for obvious anomalies
    if (features.peakThrust < 10) {
      outlierScore += 0.3
      reasoning.push('Very low peak thrust detected')
    }
    
    if (features.peakThrust > 500) {
      outlierScore += 0.4
      reasoning.push('Unusually high peak thrust')
    }
    
    if (features.riseTime < 0.1 || features.riseTime > 2.0) {
      outlierScore += 0.2
      reasoning.push('Rise time outside normal range')
    }
    
    if (features.burnDuration < 0.5 || features.burnDuration > 10.0) {
      outlierScore += 0.3
      reasoning.push('Burn duration outside expected range')
    }
    
    if (features.warningCount > 2) {
      outlierScore += 0.2
      reasoning.push('Multiple data quality warnings')
    }
    
    // Check for performance inconsistencies
    if (features.averageThrust > 0 && features.peakThrust > 0) {
      const thrustRatio = features.averageThrust / features.peakThrust
      if (thrustRatio < 0.3 || thrustRatio > 0.8) {
        outlierScore += 0.2
        reasoning.push('Unusual thrust profile shape')
      }
    }
    
    // Check rise rate
    if (features.riseRate < 20 || features.riseRate > 1000) {
      outlierScore += 0.2
      reasoning.push('Rise rate outside typical range')
    }
    
    // Time to peak ratio checks
    if (features.timeToPeakRatio < 0.2 || features.timeToPeakRatio > 0.8) {
      outlierScore += 0.1
      reasoning.push('Peak occurs at unusual time in burn')
    }
    
    // Burn efficiency checks
    if (features.burnEfficiency < 0.5 || features.burnEfficiency > 5.0) {
      outlierScore += 0.2
      reasoning.push('Burn efficiency outside normal range')
    }
    
    // Determine final classification
    const confidence = Math.min(outlierScore, 0.95) // Cap at 95%
    const isOutlier = outlierScore > 0.5
    
    if (!isOutlier && reasoning.length === 0) {
      reasoning.push('All metrics within expected ranges')
    }
    
    return {
      prediction: isOutlier ? 'outlier' : 'nominal',
      confidence: isOutlier ? confidence : 1 - confidence,
      reasoning
    }
  }
  
  isEnabled(): boolean {
    return this.enabled
  }
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
  
  isModelLoaded(): boolean {
    return this.modelLoaded
  }
}

// Global classifier instance
let classifierInstance: BurnClassifier | null = null

export function getClassifier(options?: ClassifierOptions): BurnClassifier {
  if (!classifierInstance) {
    classifierInstance = new BurnClassifier(options || { enabled: false, useRemoteModel: false })
  }
  return classifierInstance
}

// Utility function to interpret classification results
export function getClassificationDisplay(result: ClassificationResult) {
  const isOutlier = result.prediction === 'outlier'
  
  return {
    label: isOutlier ? 'Outlier' : 'Nominal',
    color: isOutlier ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200',
    icon: isOutlier ? '⚠️' : '✅',
    confidenceText: `${(result.confidence * 100).toFixed(1)}% confidence`,
    summary: result.reasoning.join('; '),
    interpretation: isOutlier 
      ? 'This test run shows characteristics that deviate from typical patterns'
      : 'This test run appears normal based on the trained model'
  }
}