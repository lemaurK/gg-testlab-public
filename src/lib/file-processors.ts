import * as Papa from 'papaparse'
import { z } from 'zod'

export interface ParsedData {
  headers: string[]
  rows: Record<string, unknown>[]
  originalFile: File
  inferredTypes: Record<string, 'number' | 'string' | 'timestamp' | 'boolean'>
  warnings: string[]
}

export interface ProcessingResult {
  success: boolean
  data?: ParsedData
  error?: string
}

// Zod schema for validating JSON data structure
const TimeSeriesDataSchema = z.array(
  z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
)

const SingleRecordSchema = z.record(
  z.string(), 
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any())])
)

export function inferColumnType(values: (string | number | boolean | null | unknown)[]): {
  type: 'number' | 'string' | 'timestamp' | 'boolean'
  confidence: number
} {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '')
  
  if (nonNullValues.length === 0) {
    return { type: 'string', confidence: 0 }
  }

  // Check for boolean
  const booleanCount = nonNullValues.filter(v => 
    typeof v === 'boolean' || 
    (typeof v === 'string' && ['true', 'false', '1', '0', 'yes', 'no'].includes(v.toLowerCase()))
  ).length
  
  if (booleanCount / nonNullValues.length > 0.8) {
    return { type: 'boolean', confidence: booleanCount / nonNullValues.length }
  }

  // Check for numbers
  const numericCount = nonNullValues.filter(v => {
    if (typeof v === 'number') return true
    if (typeof v === 'string') {
      const num = parseFloat(v)
      return !isNaN(num) && isFinite(num)
    }
    return false
  }).length

  // Check for timestamps
  const timestampPatterns = [
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, // SQL datetime
    /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
    /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // M/D/YY or MM/DD/YYYY
    /^\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD
    /^\d+$/ // Unix timestamp
  ]

  const timestampCount = nonNullValues.filter(v => {
    if (typeof v === 'string') {
      return timestampPatterns.some(pattern => pattern.test(v)) || !isNaN(Date.parse(v))
    }
    if (typeof v === 'number') {
      // Unix timestamp check (reasonable range)
      return v > 946684800 && v < 2147483647 // 2000-01-01 to 2038-01-19
    }
    return false
  }).length

  // Determine type based on highest confidence
  const numberConfidence = numericCount / nonNullValues.length
  const timestampConfidence = timestampCount / nonNullValues.length

  if (timestampConfidence > 0.7) {
    return { type: 'timestamp', confidence: timestampConfidence }
  }
  
  if (numberConfidence > 0.8) {
    return { type: 'number', confidence: numberConfidence }
  }

  return { type: 'string', confidence: 1 - Math.max(numberConfidence, timestampConfidence) }
}

export function normalizeTimestamp(value: unknown): string | null {
  if (!value) return null

  try {
    let date: Date

    if (typeof value === 'number') {
      // Assume Unix timestamp
      date = new Date(value * 1000)
    } else if (typeof value === 'string') {
      // Try parsing as date string
      date = new Date(value)
      
      if (isNaN(date.getTime())) {
        return null
      }
    } else {
      return null
    }

    return date.toISOString()
  } catch {
    return null
  }
}

export function detectCommonColumns(headers: string[]): {
  thrust?: string
  time?: string
  temperature?: string
  pressure?: string
} {
  const lowerHeaders = headers.map(h => h.toLowerCase())
  
  const patterns = {
    thrust: ['thrust', 'force', 'f', 'thrust_n', 'thrust_lbs', 'newtons'],
    time: ['time', 't', 'timestamp', 'datetime', 'time_s', 'seconds', 'ms', 'milliseconds'],
    temperature: ['temp', 'temperature', 'temp_c', 'temp_f', 'celsius', 'fahrenheit'],
    pressure: ['pressure', 'press', 'psi', 'bar', 'pa', 'pressure_psi', 'pressure_bar']
  }

  const detected: Record<string, string> = {}

  for (const [metric, keywords] of Object.entries(patterns)) {
    for (let i = 0; i < lowerHeaders.length; i++) {
      const header = lowerHeaders[i]
      if (keywords.some(keyword => header.includes(keyword))) {
        detected[metric] = headers[i]
        break
      }
    }
  }

  return detected
}

function detectDelimiter(sample: string): string {
  const lines = sample.split('\n').filter(line => line.trim()).slice(0, 10) // Check first 10 non-empty lines
  if (lines.length === 0) return ','
  
  const delimiters = [',', ';', '\t', '|', ' ']
  const scores: Record<string, number> = {}
  
  for (const delimiter of delimiters) {
    let totalScore = 0
    const counts: number[] = []
    
    for (const line of lines) {
      if (delimiter === ' ') {
        // For spaces, count sequences of 2+ spaces as delimiters
        const matches = line.match(/\s{2,}/g) || []
        counts.push(matches.length)
      } else {
        const regex = delimiter === '\t' ? /\t/g : new RegExp(delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        const matches = line.match(regex) || []
        counts.push(matches.length)
      }
    }
    
    if (counts.length === 0) continue
    
    const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length
    const maxCount = Math.max(...counts)
    const minCount = Math.min(...counts)
    
    // Calculate consistency (how similar the counts are across lines)
    const variance = counts.reduce((acc, count) => acc + Math.pow(count - avgCount, 2), 0) / counts.length
    const consistency = maxCount > 0 ? 1 - (variance / (maxCount * maxCount)) : 0
    
    // Boost score for delimiters that appear frequently and consistently
    // Penalize delimiters with very low counts (likely not the right delimiter)
    if (avgCount >= 1) {
      scores[delimiter] = avgCount * consistency * (avgCount >= 2 ? 1.2 : 1)
    } else {
      scores[delimiter] = 0
    }
  }
  
  // Find the delimiter with the highest score
  const sortedDelimiters = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([,a], [,b]) => b - a)
  
  return sortedDelimiters.length > 0 ? sortedDelimiters[0][0] : ','
}

function preprocessCsvContent(content: string): { content: string; warnings: string[] } {
  const lines = content.split('\n')
  const warnings: string[] = []
  const processedLines: string[] = []
  
  // Skip comment lines and metadata
  let headerFound = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines
    if (!line) continue
    
    // Skip comment lines (starting with #, //, or similar)
    if (line.startsWith('#') || line.startsWith('//') || line.startsWith('*')) {
      warnings.push(`Skipped comment line: ${line.substring(0, 50)}...`)
      continue
    }
    
    // Check if this looks like a header (contains non-numeric values)
    if (!headerFound) {
      const delimiter = detectDelimiter(line)
      const values = line.split(delimiter)
      const numericValues = values.filter(v => !isNaN(parseFloat(v.trim()))).length
      
      if (numericValues < values.length * 0.7) {
        headerFound = true
      }
    }
    
    processedLines.push(line)
  }
  
  return {
    content: processedLines.join('\n'),
    warnings
  }
}

export async function processCsvTsv(file: File): Promise<ProcessingResult> {
  return new Promise(async (resolve) => {
    try {
      const rawContent = await file.text()
      const { content: preprocessedContent, warnings: preprocessWarnings } = preprocessCsvContent(rawContent)
      
      const isTabDelimited = file.name.toLowerCase().endsWith('.tsv')
      const detectedDelimiter = isTabDelimited ? '\t' : detectDelimiter(preprocessedContent)
      
      Papa.parse<Record<string, unknown>>(preprocessedContent, {
        header: true,
        delimiter: detectedDelimiter,
        skipEmptyLines: 'greedy',
        quoteChar: '"',
        escapeChar: '"',
        transformHeader: (header) => header.trim(),
      complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
        if (results.errors.length > 0) {
          resolve({
            success: false,
            error: `Parsing errors: ${results.errors.map(e => e.message).join(', ')}`
          })
          return
        }

        const headers = Object.keys(results.data[0] || {})
        const rows = results.data as Record<string, unknown>[]
        const warnings: string[] = [...preprocessWarnings]

        // Clean and normalize data
        const cleanedRows = rows.filter(row => {
          // Remove completely empty rows
          const values = Object.values(row)
          return values.some(v => v !== null && v !== undefined && v !== '')
        })
        
        // Handle ragged rows by filling missing values
        cleanedRows.forEach(row => {
          headers.forEach(header => {
            if (!(header in row) || row[header] === undefined) {
              row[header] = null
            }
          })
        })
        
        // Infer column types
        const inferredTypes: Record<string, 'number' | 'string' | 'timestamp' | 'boolean'> = {}
        
        headers.forEach(header => {
          const columnValues = cleanedRows.map(row => row[header])
          const { type, confidence } = inferColumnType(columnValues)
          inferredTypes[header] = type
          
          if (confidence < 0.5) {
            warnings.push(`Low confidence (${(confidence * 100).toFixed(1)}%) for type inference of column '${header}'`)
          }
        })

        // Normalize timestamps
        headers.forEach(header => {
          if (inferredTypes[header] === 'timestamp') {
            cleanedRows.forEach(row => {
              const normalized = normalizeTimestamp(row[header])
              if (normalized) {
                row[header] = normalized
              }
            })
          }
        })
        
        // Add processing metadata
        if (detectedDelimiter !== ',') {
          warnings.push(`Detected ${detectedDelimiter === ';' ? 'semicolon' : detectedDelimiter === '\t' ? 'tab' : detectedDelimiter === '|' ? 'pipe' : 'custom'} delimiter`)
        }
        
        if (cleanedRows.length !== rows.length) {
          warnings.push(`Removed ${rows.length - cleanedRows.length} empty rows`)
        }

        resolve({
          success: true,
          data: {
            headers,
            rows: cleanedRows,
            originalFile: file,
            inferredTypes,
            warnings
          }
        })
      },
      error: (error: Error | Papa.ParseError, _file?: Papa.LocalFile | string) => {
        resolve({
          success: false,
          error: `Failed to parse CSV/TSV: ${error.message}. Try checking for mixed delimiters, quoted strings, or malformed rows.`
        })
      }
    })
    } catch (error) {
      resolve({
        success: false,
        error: `File processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  })
}

export async function processJson(file: File): Promise<ProcessingResult> {
  try {
    const content = await file.text()
    const jsonData = JSON.parse(content)
    const warnings: string[] = []

    // Validate structure
    let normalizedData: Record<string, any>[]
    
    if (Array.isArray(jsonData)) {
      // Array of objects (time series)
      const validation = TimeSeriesDataSchema.safeParse(jsonData)
      if (!validation.success) {
        return {
          success: false,
          error: `Invalid JSON structure: ${validation.error.message}`
        }
      }
      normalizedData = jsonData
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      // Single object - convert to array
      const validation = SingleRecordSchema.safeParse(jsonData)
      if (!validation.success) {
        return {
          success: false,
          error: `Invalid JSON structure: ${validation.error.message}`
        }
      }
      normalizedData = [jsonData]
      warnings.push('Single JSON object converted to array format')
    } else {
      return {
        success: false,
        error: 'JSON must be an object or array of objects'
      }
    }

    const headers = Object.keys(normalizedData[0] || {})
    
    // Infer column types
    const inferredTypes: Record<string, 'number' | 'string' | 'timestamp' | 'boolean'> = {}
    
    headers.forEach(header => {
      const columnValues = normalizedData.map(row => row[header])
      const { type, confidence } = inferColumnType(columnValues)
      inferredTypes[header] = type
      
      if (confidence < 0.5) {
        warnings.push(`Low confidence (${(confidence * 100).toFixed(1)}%) for type inference of column '${header}'`)
      }
    })

    // Normalize timestamps
    headers.forEach(header => {
      if (inferredTypes[header] === 'timestamp') {
        normalizedData.forEach(row => {
          const normalized = normalizeTimestamp(row[header])
          if (normalized) {
            row[header] = normalized
          }
        })
      }
    })

    return {
      success: true,
      data: {
        headers,
        rows: normalizedData,
        originalFile: file,
        inferredTypes,
        warnings
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export async function processFile(file: File): Promise<ProcessingResult> {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case '.csv':
    case '.tsv':
      return processCsvTsv(file)
    case '.json':
      return processJson(file)
    default:
      return {
        success: false,
        error: `Unsupported file format: ${extension}`
      }
  }
}
