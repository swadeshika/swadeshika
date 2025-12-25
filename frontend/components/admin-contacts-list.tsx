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
import { Search, Mail, Phone, Calendar } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { contactService, ContactSubmission } from "@/lib/services/contactService"

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
                        <Link href={`/admin/contacts/${sub.id}`}>
                          <Button variant="ghost" size="sm" className="text-[#2D5F3F] hover:text-[#1E4A2F] hover:bg-[#E8F5E9]">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
