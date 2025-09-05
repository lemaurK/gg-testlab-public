// Removed unused mathjs import that was causing browser crashes

export interface TimeSeriesPoint {
  time: number
  value: number
}

export interface PropulsionMetrics {
  riseTime: number | null
  peakThrust: number | null
  peakThrustTime: number | null
  burnDuration: number | null
  areaUnderCurve: number | null
  burnStartTime: number | null
  burnEndTime: number | null
  warnings: string[]
}

export interface MetricCalculationOptions {
  thrustThreshold?: number // Minimum thrust to consider "burn start/end"
  riseTimeStart?: number // Percentage of peak thrust to start rise time calculation (default: 10%)
  riseTimeEnd?: number // Percentage of peak thrust to end rise time calculation (default: 90%)
  minBurnDuration?: number // Minimum burn duration to be considered valid (seconds)
}

export class MetricExtractor {
  private options: Required<MetricCalculationOptions>

  constructor(options: MetricCalculationOptions = {}) {
    this.options = {
      thrustThreshold: options.thrustThreshold ?? 1.0, // 1N threshold
      riseTimeStart: options.riseTimeStart ?? 0.1, // 10%
      riseTimeEnd: options.riseTimeEnd ?? 0.9, // 90%
      minBurnDuration: options.minBurnDuration ?? 0.1 // 0.1 seconds
    }
  }

  private interpolateTime(data: TimeSeriesPoint[], targetValue: number): number | null {
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i]
      const next = data[i + 1]
      
      if ((current.value <= targetValue && next.value >= targetValue) ||
          (current.value >= targetValue && next.value <= targetValue)) {
        // Linear interpolation
        const t = (targetValue - current.value) / (next.value - current.value)
        return current.time + t * (next.time - current.time)
      }
    }
    return null
  }

  private validateData(data: TimeSeriesPoint[]): string[] {
    const warnings: string[] = []
    
    if (data.length < 2) {
      warnings.push('Insufficient data points for metric calculation')
      return warnings
    }

    // Check for non-uniform sampling
    const intervals = []
    for (let i = 1; i < data.length; i++) {
      intervals.push(data[i].time - data[i - 1].time)
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length
    const maxDeviation = Math.max(...intervals.map(i => Math.abs(i - avgInterval)))
    
    if (maxDeviation > avgInterval * 0.5) {
      warnings.push('Non-uniform time sampling detected - results may be less accurate')
    }

    // Check for missing data (NaN or null values)
    const missingCount = data.filter(p => isNaN(p.value) || p.value === null).length
    if (missingCount > 0) {
      warnings.push(`${missingCount} missing or invalid data points detected`)
    }

    // Check for negative thrust values
    const negativeCount = data.filter(p => p.value < 0).length
    if (negativeCount > 0) {
      warnings.push(`${negativeCount} negative thrust values detected`)
    }

    return warnings
  }

  public calculateRiseTime(data: TimeSeriesPoint[]): {
    riseTime: number | null
    startTime: number | null
    endTime: number | null
    warnings: string[]
  } {
    const warnings = this.validateData(data)
    
    if (data.length < 2) {
      return { riseTime: null, startTime: null, endTime: null, warnings }
    }

    const peakThrust = Math.max(...data.map(p => p.value))
    if (peakThrust <= this.options.thrustThreshold) {
      warnings.push('Peak thrust below threshold - rise time calculation skipped')
      return { riseTime: null, startTime: null, endTime: null, warnings }
    }

    const startThreshold = peakThrust * this.options.riseTimeStart
    const endThreshold = peakThrust * this.options.riseTimeEnd

    const startTime = this.interpolateTime(data, startThreshold)
    const endTime = this.interpolateTime(data, endThreshold)

    if (startTime === null || endTime === null) {
      warnings.push('Could not find rise time boundaries')
      return { riseTime: null, startTime, endTime, warnings }
    }

    const riseTime = endTime - startTime
    
    if (riseTime <= 0) {
      warnings.push('Invalid rise time calculation (negative or zero duration)')
      return { riseTime: null, startTime, endTime, warnings }
    }

    return { riseTime, startTime, endTime, warnings }
  }

  public calculatePeakThrust(data: TimeSeriesPoint[]): {
    peakThrust: number | null
    peakThrustTime: number | null
    warnings: string[]
  } {
    const warnings = this.validateData(data)
    
    if (data.length === 0) {
      return { peakThrust: null, peakThrustTime: null, warnings }
    }

    // Find maximum thrust and its time
    let maxThrust = -Infinity
    let maxThrustTime = null
    
    for (const point of data) {
      if (!isNaN(point.value) && point.value > maxThrust) {
        maxThrust = point.value
        maxThrustTime = point.time
      }
    }

    if (maxThrust === -Infinity) {
      warnings.push('No valid thrust values found')
      return { peakThrust: null, peakThrustTime: null, warnings }
    }

    return { 
      peakThrust: maxThrust, 
      peakThrustTime: maxThrustTime!, 
      warnings 
    }
  }

  public calculateBurnDuration(data: TimeSeriesPoint[]): {
    burnDuration: number | null
    burnStartTime: number | null
    burnEndTime: number | null
    warnings: string[]
  } {
    const warnings = this.validateData(data)
    
    if (data.length < 2) {
      return { burnDuration: null, burnStartTime: null, burnEndTime: null, warnings }
    }

    // Find burn start (first time thrust exceeds threshold)
    let burnStartTime = null
    for (const point of data) {
      if (point.value >= this.options.thrustThreshold) {
        burnStartTime = point.time
        break
      }
    }

    // Find burn end (last time thrust exceeds threshold)
    let burnEndTime = null
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].value >= this.options.thrustThreshold) {
        burnEndTime = data[i].time
        break
      }
    }

    if (burnStartTime === null || burnEndTime === null) {
      warnings.push('Could not determine burn start/end times')
      return { burnDuration: null, burnStartTime, burnEndTime, warnings }
    }

    const burnDuration = burnEndTime - burnStartTime

    if (burnDuration < this.options.minBurnDuration) {
      warnings.push(`Burn duration (${burnDuration.toFixed(3)}s) below minimum threshold (${this.options.minBurnDuration}s)`)
    }

    return { burnDuration, burnStartTime, burnEndTime, warnings }
  }

  public calculateAreaUnderCurve(data: TimeSeriesPoint[]): {
    areaUnderCurve: number | null
    warnings: string[]
  } {
    const warnings = this.validateData(data)
    
    if (data.length < 2) {
      return { areaUnderCurve: null, warnings }
    }

    // Sort data by time to ensure proper integration
    const sortedData = [...data].sort((a, b) => a.time - b.time)
    
    // Use trapezoidal rule for numerical integration
    let area = 0
    for (let i = 0; i < sortedData.length - 1; i++) {
      const current = sortedData[i]
      const next = sortedData[i + 1]
      
      if (!isNaN(current.value) && !isNaN(next.value)) {
        const dt = next.time - current.time
        const avgThrust = (current.value + next.value) / 2
        area += avgThrust * dt
      }
    }

    // Ensure non-negative area (total impulse should be positive)
    if (area < 0) {
      warnings.push('Negative area under curve - check for data quality issues')
    }

    return { areaUnderCurve: area, warnings }
  }

  public extractAllMetrics(data: TimeSeriesPoint[]): PropulsionMetrics {
    const allWarnings: string[] = []

    const riseTimeResult = this.calculateRiseTime(data)
    allWarnings.push(...riseTimeResult.warnings)

    const peakThrustResult = this.calculatePeakThrust(data)
    allWarnings.push(...peakThrustResult.warnings)

    const burnDurationResult = this.calculateBurnDuration(data)
    allWarnings.push(...burnDurationResult.warnings)

    const areaResult = this.calculateAreaUnderCurve(data)
    allWarnings.push(...areaResult.warnings)

    return {
      riseTime: riseTimeResult.riseTime,
      peakThrust: peakThrustResult.peakThrust,
      peakThrustTime: peakThrustResult.peakThrustTime,
      burnDuration: burnDurationResult.burnDuration,
      burnStartTime: burnDurationResult.burnStartTime,
      burnEndTime: burnDurationResult.burnEndTime,
      areaUnderCurve: areaResult.areaUnderCurve,
      warnings: [...new Set(allWarnings)] // Remove duplicates
    }
  }
}

// Utility function to prepare time-series data from parsed file data
export function prepareTimeSeriesData(
  parsedData: Record<string, any>[],
  timeColumn: string,
  valueColumn: string
): TimeSeriesPoint[] {
  return parsedData
    .map(row => ({
      time: parseFloat(row[timeColumn]),
      value: parseFloat(row[valueColumn])
    }))
    .filter(point => !isNaN(point.time) && !isNaN(point.value))
    .sort((a, b) => a.time - b.time)
}

// Main extraction function for parsed file data
export function extractMetricsFromFile(
  parsedData: Record<string, any>[],
  timeColumn: string,
  thrustColumn: string,
  options?: MetricCalculationOptions
): PropulsionMetrics {
  const timeSeriesData = prepareTimeSeriesData(parsedData, timeColumn, thrustColumn)
  const extractor = new MetricExtractor(options)
  return extractor.extractAllMetrics(timeSeriesData)
}