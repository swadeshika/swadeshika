"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, XCircle, Trash2, Search, Star } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Review {
  id: number
  product_id: number
  product_name: string
  user_id: string | null
  user_name: string
  user_email: string
  rating: number
  title: string
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/reviews?status=${statusFilter === 'all' ? '' : statusFilter}`)
      const data = await response.json()
      setReviews(data.data || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to load reviews", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [statusFilter])

  const handleStatusUpdate = async (reviewId: number, newStatus: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/v1/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      toast({ title: "Success", description: `Review ${newStatus}` })
      fetchReviews()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update review", variant: "destructive" })
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return
    
    try {
      await fetch(`/api/v1/reviews/${reviewId}`, {
        method: 'DELETE'
      })
      toast({ title: "Success", description: "Review deleted" })
      fetchReviews()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete review", variant: "destructive" })
    }
  }

  const filteredReviews = reviews.filter(review =>
    review.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#6B4423]">Reviews</h1>
        <p className="text-[#8B6F47]">Moderate customer reviews</p>
      </div>

      <Card className="rounded-2xl border-2 border-[#E8DCC8] py-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-[#6B4423]">All Reviews</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6F47]" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-2 border-[#E8DCC8]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 border-2 border-[#E8DCC8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border-2 border-[#E8DCC8] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#6B4423]">Product</TableHead>
                  <TableHead className="text-[#6B4423]">Customer</TableHead>
                  <TableHead className="text-[#6B4423]">Rating</TableHead>
                  <TableHead className="text-[#6B4423]">Review</TableHead>
                  <TableHead className="text-[#6B4423]">Status</TableHead>
                  <TableHead className="text-[#6B4423]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#8B6F47]">
                      Loading reviews...
                    </TableCell>
                  </TableRow>
                ) : filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#8B6F47]">
                      No reviews found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium text-[#6B4423]">
                        {review.product_name}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-[#6B4423]">{review.user_name}</div>
                          <div className="text-sm text-[#8B6F47]">{review.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-[#6B4423]">{review.rating}/5</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {review.title && (
                           <div className="font-medium text-[#6B4423] mb-1">{review.title}</div>
                          )}
                          <p className="text-sm text-[#8B6F47] line-clamp-2">{review.comment}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            review.status === "approved"
                              ? "bg-green-100 text-green-700 border-0"
                              : review.status === "rejected"
                              ? "bg-red-100 text-red-700 border-0"
                              : "bg-yellow-100 text-yellow-700 border-0"
                          }
                        >
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {review.status !== 'approved' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(review.id, 'approved')}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {review.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(review.id, 'rejected')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(review.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  )
}
