'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, Trash2, Mail, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'

/**
 * FIXED:
 * 1. confirmDeleteInquiry() now makes actual API call (DELETE /api/inquiries/[id])
 *    Previously it only removed from React state — inquiries reappeared on refresh
 * 2. handleViewInquiry() now opens a real detail dialog
 * 3. handleReplyInquiry() opens mailto link properly
 * 4. Pagination is implemented
 */
export default function InquiriesView() {
  const { toast } = useToast()
  const [inquiries, setInquiries] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [viewTarget, setViewTarget] = useState<any | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      })
      const res = await fetch(`/api/inquiries?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInquiries(data.inquiries || [])
        setPagination(data.pagination || null)
      }
    } catch (err) {
      console.error('Fetch inquiries error:', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  // Client-side search filter (search is just for display filtering of fetched results)
  const filtered = inquiries.filter(i =>
    !debouncedSearch ||
    i.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    i.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    i.message.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  // FIXED: Actually calls the DELETE API instead of just removing from state
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/inquiries/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        setInquiries(prev => prev.filter(i => i.id !== deleteTarget.id))
        toast({ title: 'Deleted', description: 'Inquiry deleted successfully' })
      } else {
        const err = await res.json()
        toast({ title: 'Error', description: err.error || 'Failed to delete', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
        toast({ title: 'Updated', description: `Marked as ${status.toLowerCase()}` })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
  }

  const statusColor: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    READ: 'bg-gray-100 text-gray-700',
    REPLIED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-slate-100 text-slate-500',
  }

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Contact Inquiries</h2>
        <p className="text-sm text-gray-500">{pagination ? `${pagination.totalItems} total` : '—'}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search by name, email, or message..."
          value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#080322]">
              <TableRow>
                <TableHead className="text-white">From</TableHead>
                <TableHead className="text-white">Business</TableHead>
                <TableHead className="text-white">Message</TableHead>
                <TableHead className="text-white text-center">Status</TableHead>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                    No inquiries found
                  </TableCell>
                </TableRow>
              ) : filtered.map(inquiry => (
                <TableRow key={inquiry.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{inquiry.name}</p>
                      <p className="text-xs text-gray-400">{inquiry.email}</p>
                      {inquiry.phone && <p className="text-xs text-gray-400">{inquiry.phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {inquiry.business?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{inquiry.message}</p>
                    {inquiry.product && (
                      <p className="text-xs text-blue-600 mt-0.5">Re: {inquiry.product.name}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <select
                      value={inquiry.status}
                      onChange={e => handleStatusUpdate(inquiry.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${statusColor[inquiry.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="READ">READ</option>
                      <option value="REPLIED">REPLIED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {format(new Date(inquiry.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                        onClick={() => setViewTarget(inquiry)} title="View details">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild title="Reply via email">
                        <a href={`mailto:${inquiry.email}?subject=Re: Your inquiry`}>
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500"
                        onClick={() => setDeleteTarget(inquiry)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg">Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg">Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* FIXED: Real delete API call */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Delete inquiry from <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Detail Dialog */}
      <AlertDialog open={!!viewTarget} onOpenChange={() => setViewTarget(null)}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Inquiry from {viewTarget?.name}</AlertDialogTitle>
          </AlertDialogHeader>
          {viewTarget && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-gray-500 text-xs">Email</p><p className="font-medium">{viewTarget.email}</p></div>
                <div><p className="text-gray-500 text-xs">Phone</p><p className="font-medium">{viewTarget.phone || '—'}</p></div>
                <div><p className="text-gray-500 text-xs">Business</p><p className="font-medium">{viewTarget.business?.name || '—'}</p></div>
                <div><p className="text-gray-500 text-xs">Product</p><p className="font-medium">{viewTarget.product?.name || '—'}</p></div>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Message</p>
                <p className="bg-gray-50 rounded-lg p-3 text-gray-700 leading-relaxed">{viewTarget.message}</p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href={`mailto:${viewTarget?.email}?subject=Re: Your inquiry`}
                className="inline-flex items-center justify-center rounded-md bg-slate-800 text-white hover:bg-slate-700 px-4 py-2 text-sm font-medium">
                <Mail className="h-4 w-4 mr-2" /> Reply via Email
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
