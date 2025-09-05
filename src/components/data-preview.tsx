'use client'

import { ParsedData, detectCommonColumns } from '@/lib/file-processors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock, Hash, Type, Calendar } from 'lucide-react'

interface DataPreviewProps {
  data: ParsedData
  maxRows?: number
}

export function DataPreview({ data, maxRows = 10 }: DataPreviewProps) {
  const { headers, rows, inferredTypes, warnings, originalFile } = data
  
  const commonColumns = detectCommonColumns(headers)
  const previewRows = rows.slice(0, maxRows)
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number': return <Hash className="h-3 w-3" />
      case 'timestamp': return <Calendar className="h-3 w-3" />
      case 'boolean': return <CheckCircle className="h-3 w-3" />
      default: return <Type className="h-3 w-3" />
    }
  }
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'number': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'timestamp': return 'bg-green-100 text-green-800 border-green-200'
      case 'boolean': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* File Info and Warnings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Preview: {originalFile.name}</span>
            <Badge variant="outline">
              {rows.length} rows × {headers.length} columns
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Detected Common Columns */}
          {Object.keys(commonColumns).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-green-700">✓ Detected Propulsion Metrics:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(commonColumns).map(([metric, column]) => (
                  <Badge key={metric} className="bg-green-100 text-green-800 border-green-200">
                    {metric}: {column}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Column Types */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Column Types:</h4>
            <div className="flex flex-wrap gap-2">
              {headers.map(header => (
                <Badge 
                  key={header} 
                  variant="outline" 
                  className={`${getTypeColor(inferredTypes[header])} flex items-center gap-1`}
                >
                  {getTypeIcon(inferredTypes[header])}
                  {header}: {inferredTypes[header]}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sample Data</span>
            {rows.length > maxRows && (
              <span className="text-sm text-gray-500">
                Showing first {maxRows} of {rows.length} rows
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map(header => (
                    <TableHead key={header} className="font-medium min-w-[120px]">
                      <div className="flex flex-col gap-1">
                        <span>{header}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getTypeColor(inferredTypes[header])} self-start`}
                        >
                          {inferredTypes[header]}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, index) => (
                  <TableRow key={index}>
                    {headers.map(header => (
                      <TableCell key={header} className="font-mono text-sm">
                        {formatCellValue(row[header], inferredTypes[header])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatCellValue(value: any, type: string): string {
  if (value === null || value === undefined) {
    return '—'
  }

  switch (type) {
    case 'number':
      if (typeof value === 'number') {
        return value.toLocaleString(undefined, { maximumFractionDigits: 3 })
      }
      return String(value)
    
    case 'timestamp':
      if (typeof value === 'string') {
        try {
          const date = new Date(value)
          return date.toLocaleString()
        } catch {
          return String(value)
        }
      }
      return String(value)
    
    case 'boolean':
      return value ? '✓' : '✗'
    
    default:
      return String(value)
  }
}