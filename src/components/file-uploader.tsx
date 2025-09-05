'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  acceptedFormats?: string[]
  maxFiles?: number
  maxSize?: number
}

export function FileUploader({ 
  onFilesSelected, 
  acceptedFormats = ['.csv', '.tsv', '.json'],
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024 // 50MB
}: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validateFile = useCallback((file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFormats.includes(extension)) {
      setErrors(prev => [...prev, `${file.name}: Unsupported file format. Only ${acceptedFormats.join(', ')} are allowed.`])
      return false
    }
    
    // File size limit
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024)
      setErrors(prev => [...prev, `${file.name}: File too large. Maximum size is ${maxSizeMB}MB.`])
      return false
    }
    
    return true
  }, [acceptedFormats, maxSize])

  const handleFileSelection = useCallback((newFiles: File[]) => {
    setErrors([])
    
    const validFiles = newFiles.filter(validateFile)
    const totalFiles = selectedFiles.length + validFiles.length
    
    if (totalFiles > maxFiles) {
      setErrors(prev => [...prev, `Cannot upload more than ${maxFiles} files at once.`])
      return
    }
    
    const updatedFiles = [...selectedFiles, ...validFiles]
    setSelectedFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }, [selectedFiles, validateFile, maxFiles, onFilesSelected])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFileSelection(files)
  }, [handleFileSelection])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFileSelection(files)
    }
  }, [handleFileSelection])

  const removeFile = useCallback((index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }, [selectedFiles, onFilesSelected])

  const clearAll = useCallback(() => {
    setSelectedFiles([])
    setErrors([])
    onFilesSelected([])
  }, [onFilesSelected])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Test Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: {acceptedFormats.join(', ')} (Max {maxFiles} files, {Math.round(maxSize / 1024 / 1024)}MB each)
          </p>
          <p className="text-xs text-blue-600 mt-1">
            💡 <strong>Recommended:</strong> &lt;10,000 rows, &lt;5MB file size for optimal performance
          </p>
        </div>

        {/* Hidden File Input */}
        <Input
          id="file-input"
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h3>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
