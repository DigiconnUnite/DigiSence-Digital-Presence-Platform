'use client'

import { useState, useCallback } from 'react'
import { useBusinesses, useToggleBusinessStatus, useDeleteBusiness, useCreateBusiness, useUpdateBusiness, useBulkDelete, useBulkUpdateStatus } from '@/lib/hooks/useBusinesses'
import { useAdminCategories } from '@/lib/hooks/useCategories'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Download, Search, Trash2, Eye, Edit, Power } from 'lucide-react'
import { format } from 'date-fns'
import { UnifiedModal } from '@/components/ui/UnifiedModal'
import CredentialsModal from '../panels/CredentialsModal'
import AddBusinessPanel from '../panels/AddBusinessPanel'

/**
 * Extracted from admin/page.tsx.
 * Only manages business-related state — does not re-render when professionals
 * or other admin views change state.
 *
 * Uses React Query exclusively (useBusinesses hook) — no duplicate manual fetch+setState.
 */
export default function BusinessesView() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string; name?: string } | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const query = { page, limit: 10, search: debouncedSearch, status, sortBy: 'createdAt', sortOrder: 'desc' as const }
  const { data, isLoading } = useBusinesses(query)
  const { data: categoriesData } = useAdminCategories()
  const toggleStatus = useToggleBusinessStatus()
  const deleteBusiness = useDeleteBusiness()
  const bulkDelete = useBulkDelete()
  const bulkUpdateStatus = useBulkUpdateStatus()

  const businesses = data?.businesses ?? []
  const pagination = data?.pagination

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === businesses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(businesses.map(b => b.id)))
    }
  }, [businesses, selectedIds.size])

  const handleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleExport = async () => {
    const res = await fetch('/api/admin/businesses/export?format=csv')
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `businesses-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Businesses</h2>
          <p className="text-sm text-gray-500">
            {pagination ? `${pagination.totalItems} total` : '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl">
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => setShowAddPanel(true)}
            className="rounded-xl bg-slate-800 text-white hover:bg-slate-700">
            <Plus className="h-4 w-4 mr-1" /> Add Business
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search businesses..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 rounded-xl"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
          <span className="text-sm font-medium text-blue-800">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => {
            bulkUpdateStatus.mutate({ ids: Array.from(selectedIds), isActive: true })
            setSelectedIds(new Set())
          }} className="rounded-lg text-xs">Activate</Button>
          <Button size="sm" variant="outline" onClick={() => {
            bulkUpdateStatus.mutate({ ids: Array.from(selectedIds), isActive: false })
            setSelectedIds(new Set())
          }} className="rounded-lg text-xs">Suspend</Button>
          <Button size="sm" variant="outline" onClick={() => setShowBulkDeleteDialog(true)}
            className="rounded-lg text-xs text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs">
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#080322]">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds.size === businesses.length && businesses.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-white/50"
                  />
                </TableHead>
                <TableHead className="text-white font-medium">Business</TableHead>
                <TableHead className="text-white font-medium">Admin Email</TableHead>
                <TableHead className="text-white font-medium">Category</TableHead>
                <TableHead className="text-white font-medium text-center">Status</TableHead>
                <TableHead className="text-white font-medium">Created</TableHead>
                <TableHead className="text-white font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    {search ? `No businesses matching "${search}"` : 'No businesses yet'}
                  </TableCell>
                </TableRow>
              ) : businesses.map((business) => (
                <TableRow key={business.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(business.id)}
                      onCheckedChange={() => handleSelect(business.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                        {business.logo
                          ? <img src={business.logo} alt={business.name} className="w-9 h-9 rounded-full object-cover" />
                          : business.name.charAt(0).toUpperCase()
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{business.name}</p>
                        <p className="text-xs text-gray-400">{business._count.products} products</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{business.admin.email}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {business.category?.name || 'Uncategorized'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={business.isActive ? 'default' : 'secondary'} className="text-xs">
                      {business.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {format(new Date(business.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
                        <a href={`/catalog/${business.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                        onClick={() => setEditingBusiness(business)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className={`h-8 w-8 rounded-lg ${business.isActive ? 'text-amber-500' : 'text-green-500'}`}
                        onClick={() => toggleStatus.mutate({ id: business.id, isActive: !business.isActive })}
                        disabled={toggleStatus.isPending}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500"
                        onClick={() => setDeleteTarget(business)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} businesses
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg">
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Business Panel */}
      <UnifiedModal
        isOpen={showAddPanel}
        onClose={() => setShowAddPanel(false)}
        title="Add New Business"
        description="Create a new business account and listing."
      >
        <AddBusinessPanel
          categories={categoriesData ?? []}
          onSuccess={(creds) => {
            setShowAddPanel(false)
            setCredentials({ ...creds, type: 'business' } as any)
          }}
          onCancel={() => setShowAddPanel(false)}
        />
      </UnifiedModal>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and its admin account,
              all products, and all inquiries. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteTarget) {
                  deleteBusiness.mutate(deleteTarget.id)
                  setDeleteTarget(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Businesses</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.size} businesses and all their data. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                bulkDelete.mutate(Array.from(selectedIds))
                setSelectedIds(new Set())
                setShowBulkDeleteDialog(false)
              }}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credentials Modal - FIXED: replaces toast notification */}
      <CredentialsModal
        isOpen={!!credentials}
        onClose={() => setCredentials(null)}
        credentials={credentials}
      />
    </div>
  )
}
