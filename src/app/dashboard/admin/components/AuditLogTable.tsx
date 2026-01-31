'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  Upload,
  FileSpreadsheet,
  Copy,
  RefreshCw
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  userEmail: string | null
  userName: string | null
  oldData: Record<string, any> | null
  newData: Record<string, any> | null
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, any> | null
  createdAt: string
}

interface AuditLogTableProps {
  logs: AuditLogEntry[]
  loading?: boolean
  onViewDetails?: (log: AuditLogEntry) => void
}

const actionIcons: Record<string, React.ReactNode> = {
  CREATE: <Plus className="w-4 h-4 text-green-500" />,
  UPDATE: <Edit className="w-4 h-4 text-blue-500" />,
  DELETE: <Trash2 className="w-4 h-4 text-red-500" />,
  VIEW: <Eye className="w-4 h-4 text-gray-500" />,
  LOGIN: <LogIn className="w-4 h-4 text-green-500" />,
  LOGOUT: <LogOut className="w-4 h-4 text-gray-500" />,
  EXPORT: <Download className="w-4 h-4 text-purple-500" />,
  IMPORT: <Upload className="w-4 h-4 text-indigo-500" />,
  BULK_DELETE: <Trash2 className="w-4 h-4 text-red-500" />,
  DUPLICATE: <Copy className="w-4 h-4 text-orange-500" />,
  STATUS_CHANGE: <RefreshCw className="w-4 h-4 text-yellow-500" />,
  PASSWORD_CHANGE: <FileSpreadsheet className="w-4 h-4 text-cyan-500" />,
}

const actionLabels: Record<string, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  VIEW: 'Viewed',
  LOGIN: 'Logged In',
  LOGOUT: 'Logged Out',
  EXPORT: 'Exported',
  IMPORT: 'Imported',
  BULK_DELETE: 'Bulk Deleted',
  DUPLICATE: 'Duplicated',
  STATUS_CHANGE: 'Status Changed',
  PASSWORD_CHANGE: 'Password Changed',
}

export default function AuditLogTable({ 
  logs, 
  loading = false,
  onViewDetails 
}: AuditLogTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof AuditLogEntry>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: keyof AuditLogEntry) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = !actionFilter || log.action === actionFilter
    
    let matchesDate = true
    if (dateFilter) {
      const logDate = new Date(log.createdAt)
      const today = new Date()
      
      switch (dateFilter) {
        case 'today':
          matchesDate = logDate.toDateString() === today.toDateString()
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = logDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = logDate >= monthAgo
          break
      }
    }
    
    return matchesSearch && matchesAction && matchesDate
  })

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const aVal = a[sortColumn]
    const bVal = b[sortColumn]
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    
    if (aVal instanceof Date && bVal instanceof Date) {
      return sortDirection === 'asc'
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime()
    }
    
    return 0
  })

  const SortIcon = ({ column }: { column: keyof AuditLogEntry }) => (
    <span className="ml-1">
      {sortColumn === column ? (
        sortDirection === 'asc' ? (
          <ChevronUp className="w-3 h-3 inline" />
        ) : (
          <ChevronDown className="w-3 h-3 inline" />
        )
      ) : (
        <span className="w-3 h-3 inline opacity-30">⇅</span>
      )}
    </span>
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header Filters */}
      <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">All Actions</option>
              {Object.entries(actionLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('action')}
              >
                Action <SortIcon column="action" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('entityType')}
              >
                Entity <SortIcon column="entityType" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                Timestamp <SortIcon column="createdAt" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No audit logs found matching your criteria.
                </td>
              </tr>
            ) : (
              sortedLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr 
                    className={`hover:bg-gray-50 ${expandedRow === log.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {actionIcons[log.action] || <Eye className="w-4 h-4 text-gray-500" />}
                        <span className="text-sm font-medium text-gray-900">
                          {actionLabels[log.action] || log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.entityType}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{log.entityId}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.userName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{log.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(log.createdAt), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(log.createdAt), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-mono">
                        {log.ipAddress || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {expandedRow === log.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === log.id && (
                    <tr className="bg-blue-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(log.oldData || log.newData) && (
                            <div className="bg-white rounded p-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Changes</h4>
                              {log.oldData && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-red-600">Old Data:</p>
                                  <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.oldData, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.newData && (
                                <div>
                                  <p className="text-xs font-medium text-green-600">New Data:</p>
                                  <pre className="text-xs bg-green-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.newData, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                          {log.metadata && (
                            <div className="bg-white rounded p-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Metadata</h4>
                              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div className="bg-white rounded p-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Technical Info</h4>
                            <div className="text-xs space-y-1">
                              <p><span className="font-medium">User Agent:</span> {log.userAgent || 'N/A'}</p>
                              <p><span className="font-medium">Entity ID:</span> {log.entityId}</p>
                              <p><span className="font-medium">Log ID:</span> {log.id}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      <div className="px-4 py-3 border-t flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
