'use client'

import React, { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { parseCSV, validateCSVData, generateCSVTemplate } from '@/lib/utils/csvParser'

interface ImportResult {
  success: boolean
  summary?: {
    total: number
    created: number
    failed: number
    skipped: number
  }
  createdBusinesses?: Array<{ id: string; name: string; email: string; password: string }>
  errors?: Array<{ row: number; message: string }>
}

interface ImportCSVModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

export default function ImportCSVModal({ isOpen, onClose, onImportComplete }: ImportCSVModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState('')
  const [preview, setPreview] = useState<Array<Record<string, string>> | null>(null)
  const [previewErrors, setPreviewErrors] = useState<Array<{ row: number; message: string }>>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }, [])

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    
    const text = await selectedFile.text()
    const parseResult = parseCSV(text)
    
    if (parseResult.data.length > 0) {
      setPreview(parseResult.data.slice(0, 5)) // Show first 5 rows
      
      // Validate data
      const errors = validateCSVData(parseResult.data)
      setPreviewErrors(errors.slice(0, 5)) // Show first 5 errors
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      processFile(droppedFile)
    }
  }, [])

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'business_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!file) return
    
    setImporting(true)
    setResult(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (categoryId) {
        formData.append('categoryId', categoryId)
      }

      const response = await fetch('/api/admin/businesses/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult({ success: true, ...data })
      onImportComplete()
    } catch (error: any) {
      setResult({ success: false, errors: [{ row: 0, message: error.message }] })
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setPreviewErrors([])
    setResult(null)
    setImporting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Import Businesses from CSV</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {!result ? (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Download the template CSV file to ensure correct format</li>
                  <li>• The CSV must include columns: name, email, admin_name, phone</li>
                  <li>• Optional columns: description, website, address, category</li>
                  <li>• Existing emails will be skipped automatically</li>
                </ul>
                <button
                  onClick={handleDownloadTemplate}
                  className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Download className="w-3 h-3" />
                  Download Template
                </button>
              </div>

              {/* File Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">CSV files only (max 10MB)</p>
                </label>
              </div>

              {/* Category Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb Category-1">
                  (Optional)
                </label>
                <input
                  type="text"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  placeholder="Enter category ID or leave empty"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Preview */}
              {preview && preview.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (First 5 rows)</h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(preview[0]).map((key) => (
                            <th key={key} className="px-3 py-2 text-left font-medium text-gray-600">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {preview.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="px-3 py-2 text-gray-700 truncate max-w-[150px]">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Preview Errors */}
              {previewErrors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Validation Errors
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {previewErrors.map((error, idx) => (
                      <p key={idx} className="text-xs text-red-600">
                        Row {error.row}: {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : result.success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Successful!</h3>
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">{result.summary?.total}</p>
                  <p className="text-xs text-gray-500">Total Rows</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{result.summary?.created}</p>
                  <p className="text-xs text-green-600">Created</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-yellow-600">{result.summary?.skipped}</p>
                  <p className="text-xs text-yellow-600">Skipped</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-red-600">{result.summary?.failed}</p>
                  <p className="text-xs text-red-600">Failed</p>
                </div>
              </div>

              {result.createdBusinesses && result.createdBusinesses.length > 0 && (
                <div className="mt-4 text-left max-w-md mx-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Created Businesses:</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto text-xs">
                    {result.createdBusinesses.map((biz, idx) => (
                      <div key={idx} className="mb-1">
                        <span className="font-medium">{biz.name}</span>
                        <span className="text-gray-500"> - {biz.email}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Passwords are shown above. Please save them securely!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Failed</h3>
              <p className="text-sm text-gray-600">{result.errors?.[0]?.message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-2">
          {!result ? (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing || previewErrors.length > 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
