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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Eye, Search, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'
import CredentialsModal from '../panels/CredentialsModal'

/**
 * FIXED:
 * 1. Approve button now calls /api/admin/registration-inquiries/[id]/approve (new endpoint)
 *    Previously called endpoint that didn't exist → 404
 * 2. Reject button now calls /api/admin/registration-inquiries/[id]/reject (new endpoint)
 *    Previously called endpoint that didn't exist → 404
 * 3. Shows credentials modal after successful account creation
 */
export default function RegistrationsView() {
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewTarget, setViewTarget] = useState<any | null>(null)
  const [rejectTarget, setRejectTarget] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<any | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/registration-inquiries')
      if (res.ok) {
        const data = await res.json()
        setRegistrations(data.inquiries || [])
      }
    } catch (err) {
      console.error('Fetch registrations error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRegistrations() }, [fetchRegistrations])

  const filtered = registrations.filter(r =>
    !debouncedSearch ||
    r.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    r.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    r.businessName?.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  // FIXED: Calls the new /approve endpoint
  const handleApprove = async (inquiry: any) => {
    setProcessingId(inquiry.id)
    try {
      const res = await fetch(`/api/admin/registration-inquiries/${inquiry.id}/approve`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setRegistrations(prev => prev.map(r =>
          r.id === inquiry.id ? { ...r, status: 'COMPLETED' } : r
        ))
        // Show credentials modal instead of toast
        if (data.credentials?.email) {
          setCredentials({
            email: data.credentials.email,
            password: data.credentials.password || '(sent via email)',
            name: inquiry.name,
            type: inquiry.type?.toLowerCase(),
          })
        }
        toast({ title: 'Account created!', description: `Credentials sent to ${inquiry.email}` })
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to approve', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
  }

  // FIXED: Calls the new /reject endpoint
  const handleReject = async () => {
    if (!rejectTarget) return
    setProcessingId(rejectTarget.id)
    try {
      const res = await fetch(`/api/admin/registration-inquiries/${rejectTarget.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (res.ok) {
        setRegistrations(prev => prev.map(r =>
          r.id === rejectTarget.id ? { ...r, status: 'REJECTED' } : r
        ))
        toast({ title: 'Rejected', description: 'Registration request rejected.' })
        setRejectTarget(null)
        setRejectReason('')
      } else {
        const err = await res.json()
        toast({ title: 'Error', description: err.error || 'Failed to reject', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    UNDER_REVIEW: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  const pendingCount = registrations.filter(r => r.status === 'PENDING').length

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Registration Requests</h2>
          <p className="text-sm text-gray-500">
            {registrations.length} total · {pendingCount} pending review
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search by name, email, or business..."
          value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#080322]">
              <TableRow>
                <TableHead className="text-white">Type</TableHead>
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Business / Profession</TableHead>
                <TableHead className="text-white">Contact</TableHead>
                <TableHead className="text-white text-center">Status</TableHead>
                <TableHead className="text-white">Submitted</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    No registration requests
                  </TableCell>
                </TableRow>
              ) : filtered.map(reg => (
                <TableRow key={reg.id} className={`hover:bg-gray-50 ${reg.status === 'PENDING' ? 'bg-amber-50/30' : ''}`}>
                  <TableCell>
                    <Badge variant="outline" className={reg.type === 'BUSINESS' ? 'border-blue-300 text-blue-700' : 'border-purple-300 text-purple-700'}>
                      {reg.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm text-gray-900">{reg.name}</p>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {reg.businessName || reg.profession || '—'}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">{reg.email}</p>
                    {reg.phone && <p className="text-xs text-gray-400">{reg.phone}</p>}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[reg.status] || 'bg-gray-100 text-gray-600'}`}>
                      {reg.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {format(new Date(reg.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                        onClick={() => setViewTarget(reg)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {reg.status === 'PENDING' && (
                        <>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(reg)}
                            disabled={processingId === reg.id}
                            title="Approve & Create Account">
                            {processingId === reg.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <CheckCircle className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => { setRejectTarget(reg); setRejectReason('') }}
                            disabled={processingId === reg.id}
                            title="Reject">
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Detail Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={() => setViewTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewTarget?.name} — Registration Details</DialogTitle>
            <DialogDescription>{viewTarget?.type} registration request</DialogDescription>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-gray-500 text-xs">Email</p><p className="font-medium">{viewTarget.email}</p></div>
                <div><p className="text-gray-500 text-xs">Phone</p><p className="font-medium">{viewTarget.phone || '—'}</p></div>
                {viewTarget.businessName && <div><p className="text-gray-500 text-xs">Business</p><p className="font-medium">{viewTarget.businessName}</p></div>}
                {viewTarget.profession && <div><p className="text-gray-500 text-xs">Profession</p><p className="font-medium">{viewTarget.profession}</p></div>}
                {viewTarget.location && <div className="col-span-2"><p className="text-gray-500 text-xs">Location</p><p className="font-medium">{viewTarget.location}</p></div>}
              </div>
              {viewTarget.businessDescription && (
                <div><p className="text-gray-500 text-xs mb-1">Description</p>
                  <p className="bg-gray-50 rounded-lg p-3 text-gray-700">{viewTarget.businessDescription}</p>
                </div>
              )}
              {viewTarget.aboutMe && (
                <div><p className="text-gray-500 text-xs mb-1">About</p>
                  <p className="bg-gray-50 rounded-lg p-3 text-gray-700">{viewTarget.aboutMe}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            {viewTarget?.status === 'PENDING' && (
              <>
                <Button onClick={() => { handleApprove(viewTarget); setViewTarget(null) }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  disabled={processingId === viewTarget?.id}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button variant="outline" onClick={() => { setRejectTarget(viewTarget); setViewTarget(null) }}
                  className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setViewTarget(null)} className="flex-1 rounded-xl">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Rejecting {rejectTarget?.name}'s registration request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason (optional)</Label>
            <Textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setRejectTarget(null)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl"
              disabled={processingId === rejectTarget?.id}>
              {processingId === rejectTarget?.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal after approval */}
      <CredentialsModal
        isOpen={!!credentials}
        onClose={() => setCredentials(null)}
        credentials={credentials}
      />
    </div>
  )
}
