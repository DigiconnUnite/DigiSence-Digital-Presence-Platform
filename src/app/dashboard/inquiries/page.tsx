'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  MessageSquare,
  Mail,
  Phone,
  User,
  Calendar,
  Package,
  Eye,
  Reply,
  Check
} from 'lucide-react'

interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  product?: {
    id: string
    name: string
  }
}

const statusColors = {
  NEW: 'bg-red-100 text-red-800',
  READ: 'bg-blue-100 text-blue-800',
  REPLIED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  NEW: 'New',
  READ: 'Read',
  REPLIED: 'Replied',
  CLOSED: 'Closed',
}

export default function InquiriesManagementPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'BUSINESS_ADMIN')) {
      router.push('/dashboard')
      return
    }

    if (user?.role === 'BUSINESS_ADMIN') {
      fetchInquiries()
    }
  }, [user, loading, router])

  useEffect(() => {
    // Filter inquiries based on status
    if (statusFilter === 'all') {
      setFilteredInquiries(inquiries)
    } else {
      setFilteredInquiries(inquiries.filter(inquiry => inquiry.status === statusFilter))
    }
  }, [inquiries, statusFilter])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/business/inquiries')
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries)
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/business/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update the inquiry in the list
        setInquiries(prev => 
          prev.map(inquiry => 
            inquiry.id === inquiryId ? data.inquiry : inquiry
          )
        )
        alert('Inquiry status updated successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to update status: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to update inquiry status. Please try again.')
    }
  }

  const markAsRead = (inquiryId: string) => {
    updateInquiryStatus(inquiryId, 'READ')
  }

  const markAsReplied = (inquiryId: string) => {
    updateInquiryStatus(inquiryId, 'REPLIED')
  }

  const markAsClosed = (inquiryId: string) => {
    updateInquiryStatus(inquiryId, 'CLOSED')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== 'BUSINESS_ADMIN') {
    return null
  }

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'NEW').length,
    read: inquiries.filter(i => i.status === 'READ').length,
    replied: inquiries.filter(i => i.status === 'REPLIED').length,
    closed: inquiries.filter(i => i.status === 'CLOSED').length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Inquiries</h1>
          <p className="text-gray-600">Manage and respond to customer inquiries</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All inquiries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.read}</div>
            <p className="text-xs text-muted-foreground">Viewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <Reply className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
            <p className="text-xs text-muted-foreground">Response sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <Check className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Label htmlFor="statusFilter">Status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inquiries ({stats.total})</SelectItem>
                <SelectItem value="NEW">New ({stats.new})</SelectItem>
                <SelectItem value="READ">Read ({stats.read})</SelectItem>
                <SelectItem value="REPLIED">Replied ({stats.replied})</SelectItem>
                <SelectItem value="CLOSED">Closed ({stats.closed})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Inquiries {statusFilter !== 'all' && `- ${statusLabels[statusFilter as keyof typeof statusLabels]}`}
          </CardTitle>
          <CardDescription>
            {filteredInquiries.length === 0 
              ? 'No inquiries found' 
              : `Showing ${filteredInquiries.length} inquiry${filteredInquiries.length !== 1 ? 'ies' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No inquiries yet' : `No ${statusLabels[statusFilter as keyof typeof statusLabels]} inquiries`}
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'Customer inquiries will appear here when people contact you'
                  : `No inquiries with status "${statusLabels[statusFilter as keyof typeof statusLabels]}"`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <Card key={inquiry.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{inquiry.name}</h4>
                          <Badge className={statusColors[inquiry.status]}>
                            {statusLabels[inquiry.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">
                              {inquiry.email}
                            </a>
                          </div>
                          {inquiry.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:underline">
                                {inquiry.phone}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(inquiry.createdAt)}</span>
                          </div>
                        </div>
                        {inquiry.product && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Regarding: <strong>{inquiry.product.name}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex space-x-2">
                      {inquiry.status === 'NEW' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsRead(inquiry.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                      {(inquiry.status === 'NEW' || inquiry.status === 'READ') && (
                        <Button 
                          size="sm"
                          onClick={() => markAsReplied(inquiry.id)}
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          Mark as Replied
                        </Button>
                      )}
                      {(inquiry.status === 'NEW' || inquiry.status === 'READ' || inquiry.status === 'REPLIED') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsClosed(inquiry.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}