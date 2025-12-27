"use client"

import { useState, useEffect } from "react"
import { newsletterService, Subscriber } from "@/lib/services/newsletterService"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Mail, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<string>("all")
  const [totalSubscribers, setTotalSubscribers] = useState(0)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const isActive = filter === "all" ? undefined : filter === "active"
      const response = await newsletterService.getSubscribers(page, 20, isActive)
      if (response.data.success) {
        setSubscribers(response.data.data.subscribers)
        setTotalPages(response.data.data.pages)
        setTotalSubscribers(response.data.data.total)
      }
    } catch (error) {
      console.error("Failed to fetch subscribers", error)
      toast({ title: "Error", description: "Failed to fetch subscribers", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [page, filter])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await newsletterService.deleteSubscriber(deleteId)
      if (response.data.success) {
        toast({ title: "Success", description: "Subscriber deleted successfully" })
        fetchSubscribers()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete subscriber", variant: "destructive" })
    } finally {
      setDeleteId(null)
    }
  }

  const handleExport = () => {
    // Simple CSV export
    const headers = ["ID", "Email", "Status", "Subscribed At"]
    const csvContent = [
      headers.join(","),
      ...subscribers.map(s => [
        s.id,
        s.email,
        s.is_active ? "Active" : "Inactive",
        new Date(s.subscribed_at).toISOString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "newsletter_subscribers.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
          <div className="mb-4 sm:mb-0">
            <h1 className="font-serif text-3xl font-bold mb-2 text-[#6B4423]">Newsletter Subscribers</h1>
            <p className="text-[#8B6F47]">Manage your newsletter subscriptions and email list.</p>
          </div>
          <Button 
            onClick={handleExport} 
            className="gap-2 bg-[#2D5F3F] hover:bg-[#234A32] text-white"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card className="rounded-2xl border-2 border-[#E8DCC8]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <Mail className="h-5 w-5 text-[#8B6F47]" />
                 <h2 className="font-semibold text-[#6B4423]">Subscribers List ({totalSubscribers})</h2>
              </div>
              <div className="w-[180px]">
                <Select value={filter} onValueChange={(value) => { setFilter(value); setPage(1); }}>
                  <SelectTrigger className="border-2 border-[#E8DCC8] focus:ring-[#2D5F3F] text-[#6B4423]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscribers</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#8B6F47]" />
              </div>
            ) : (
              <>
                <div className="rounded-2xl border-2 border-[#E8DCC8] overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[#6B4423]">S.No</TableHead>
                        <TableHead className="text-[#6B4423]">Email</TableHead>
                        <TableHead className="text-[#6B4423]">Status</TableHead>
                        <TableHead className="text-[#6B4423]">Subscribed Date</TableHead>
                        <TableHead className="text-right text-[#6B4423]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-[#8B6F47]">
                            No subscribers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        subscribers.map((subscriber, index) => (
                          <TableRow key={subscriber.id}>
                            <TableCell className="text-[#6B4423] font-medium">
                              {(page - 1) * 20 + index + 1}
                            </TableCell>
                            <TableCell className="text-[#6B4423]">{subscriber.email}</TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  subscriber.is_active 
                                    ? "bg-[#2D5F3F]/10 text-[#2D5F3F] border-0 hover:bg-[#2D5F3F]/20" 
                                    : "bg-red-100 text-red-700 border-0 hover:bg-red-200"
                                }
                              >
                                {subscriber.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[#8B6F47]">
                              {format(new Date(subscriber.subscribed_at), "PPP")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteId(subscriber.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-[#E8DCC8] text-[#6B4423] hover:bg-[#F5F1E8]"
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-[#8B6F47]">
                      Page {page} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-[#E8DCC8] text-[#6B4423] hover:bg-[#F5F1E8]"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the subscriber from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
