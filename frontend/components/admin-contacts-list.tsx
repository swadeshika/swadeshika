"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Phone, Calendar, MessageSquare, Trash2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { contactService, ContactSubmission } from "@/lib/services/contactService"
import { api } from "@/lib/api"

/**
 * AdminContactsList Component
 * 
 * Displays a paginated/scrollable list of contact form submissions.
 * Features:
 * - Fetches data using contactService
 * - Search functionality by name, email, subject, or order number
 * - Status badges for quick visual filtering
 * - Navigation to detail view
 */
export function AdminContactsList() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const { toast } = useToast()

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await contactService.getAll()
      if (response.data.success) {
        setSubmissions(response.data.data.submissions)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contact submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await api.put(`/contact/${id}`, { status })
      if (response.data.success) {
        setSubmissions(submissions.map(sub => sub.id === id ? { ...sub, status: status as any } : sub))
        toast({ title: "Status updated" })
        if (selectedSubmission) setSelectedSubmission({ ...selectedSubmission, status: status as any })
      }
    } catch (error) {
      toast({ title: "Error updating status", variant: "destructive" })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this submission?")) return
    try {
      const response = await api.delete(`/contact/${id}`)
      if (response.data.success) {
        setSubmissions(submissions.filter(sub => sub.id !== id))
        toast({ title: "Submission deleted" })
        setIsViewOpen(false)
      }
    } catch (error) {
      toast({ title: "Error deleting submission", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const filteredSubmissions = submissions.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.order_number && sub.order_number.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge className="bg-blue-500">New</Badge>
      case 'read': return <Badge variant="outline" className="text-gray-500">Read</Badge>
      case 'replied': return <Badge className="bg-green-500">Replied</Badge>
      case 'archived': return <Badge variant="secondary">Archived</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
        <div className="mb-4 sm:mb-0">
          <h1 className="font-serif text-3xl font-bold mb-2 text-[#6B4423]">Contact Submissions</h1>
          <p className="text-[#8B6F47]">View and manage customer inquiries.</p>
        </div>
      </div>

      <Card className="rounded-2xl border-2 border-[#E8DCC8]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
              <Input
                placeholder="Search inquiries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-2 border-[#E8DCC8] focus-visible:ring-0 focus-visible:border-[#2D5F3F]"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-[#8B6F47]">Loading submissions...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-[#8B6F47]">No inquiries found.</div>
          ) : (
            <div className="rounded-2xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#6B4423]">Date</TableHead>
                    <TableHead className="text-[#6B4423]">Customer</TableHead>
                    <TableHead className="text-[#6B4423]">Subject</TableHead>
                    <TableHead className="text-[#6B4423]">Message</TableHead>
                    <TableHead className="text-[#6B4423]">Status</TableHead>
                    <TableHead className="text-right text-[#6B4423]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium text-[#6B4423]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#8B6F47]" />
                          {format(new Date(sub.created_at), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-[#6B4423]">{sub.name}</span>
                          <span className="text-xs text-[#8B6F47] flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {sub.email}
                          </span>
                          {sub.phone && (
                            <span className="text-xs text-[#8B6F47] flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {sub.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[#6B4423] font-medium">{sub.subject}</span>
                          {sub.order_number && (
                            <Badge variant="outline" className="w-fit mt-1 text-xs border-[#E8DCC8] text-[#8B6F47]">
                              Order: {sub.order_number}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-[#6B4423]" title={sub.message}>
                        {sub.message}
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#2D5F3F] hover:text-[#1E4A2F] hover:bg-[#E8F5E9]"
                          onClick={() => {
                            setSelectedSubmission(sub)
                            setIsViewOpen(true)
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl bg-[#F9F7F2] border-[#E8DCC8]">
          <DialogHeader>
            <DialogTitle className="text-[#6B4423] font-serif text-2xl">Submission Details</DialogTitle>
            <DialogDescription>
              Received on {selectedSubmission && format(new Date(selectedSubmission.created_at), 'PPP p')}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#8B6F47]">Customer Name</div>
                  <div className="text-[#6B4423] font-medium">{selectedSubmission.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#8B6F47]">Email Address</div>
                  <div className="text-[#6B4423]">{selectedSubmission.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#8B6F47]">Phone Number</div>
                  <div className="text-[#6B4423]">{selectedSubmission.phone || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#8B6F47]">Order Number</div>
                  <div className="text-[#6B4423]">{selectedSubmission.order_number || 'N/A'}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-[#8B6F47]">Subject</div>
                <div className="p-2 rounded bg-white border border-[#E8DCC8] text-[#6B4423]">
                  {selectedSubmission.subject}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-[#8B6F47]">Message</div>
                <div className="p-4 rounded-lg bg-white border border-[#E8DCC8] text-[#6B4423] whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E8DCC8]">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-[#8B6F47]">Status:</div>
                  <Select
                    value={selectedSubmission.status}
                    onValueChange={(val) => handleUpdateStatus(selectedSubmission.id, val)}
                  >
                    <SelectTrigger className="w-[180px] border-[#E8DCC8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Submission
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
