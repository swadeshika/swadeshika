"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Star, Loader2 } from "lucide-react"
import { ordersService, OrderItem } from "@/lib/services/ordersService"
import { reviewService } from "@/lib/services/reviewService"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

interface OrderReviewContentProps {
  orderId: string
}

export default function OrderReviewContent({ orderId }: OrderReviewContentProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Record<string, { title: string; rating: number; comment: string }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [hovered, setHovered] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const order = await ordersService.getOrderById(orderId)
        setItems(order.items || [])
        // Initialize reviews state
        const initialReviews = Object.fromEntries(
          (order.items || []).map((item) => [item.id || item.product_id || item.productId, { title: "", rating: 0, comment: "" }])
        )
        setReviews(initialReviews)
      } catch (error) {
        console.error("Failed to fetch order for review:", error)
        toast({ title: "Error", description: "Failed to load order items.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  const setRating = (id: string, rating: number) =>
    setReviews((prev) => ({ ...prev, [id]: { ...prev[id], rating } }))
  const setTitle = (id: string, title: string) =>
    setReviews((prev) => ({ ...prev, [id]: { ...prev[id], title } }))
  const setComment = (id: string, comment: string) =>
    setReviews((prev) => ({ ...prev, [id]: { ...prev[id], comment } }))

  const handleSubmit = async () => {
    // Basic validation
    for (const item of items) {
      const itemId = item.id || item.product_id || item.productId
      if (!itemId) continue;
      const r = reviews[itemId as string]
      if (!r || !r.title.trim()) {
        toast({ title: "Title required", description: `Please add a review title for ${item.productName}.`, variant: "destructive" })
        return
      }
      if (r.rating === 0) {
        toast({ title: "Rating required", description: `Please select a rating for ${item.productName}.`, variant: "destructive" })
        return
      }
      if (r.comment.trim().length < 20) {
        toast({ title: "Review too short", description: `Please write at least 20 characters for ${item.productName}.`, variant: "destructive" })
        return
      }
    }
    setSubmitting(true)
    try {
      // Submit each review
      for (const item of items) {
        const itemId = item.id || item.product_id || item.productId
        if (!itemId) continue;
        const r = reviews[itemId as string]
        const productId = item.product_id || item.productId || item.id;
        console.log('[Review Debug] Item:', { item, productId, itemId });
        if (!productId) continue;
        await reviewService.createReview({
          product_id: productId as string | number, // Support both naming conventions
          order_id: orderId,
          rating: r.rating,
          title: r.title,
          comment: r.comment
        })
      }
      toast({ title: "Reviews submitted", description: "Thanks for sharing your feedback!" })
      router.push('/account/orders')
    } catch (error: any) {
      console.error("Failed to submit reviews:", error)
      toast({ 
        title: "Submission failed", 
        description: error.response?.data?.message || "There was an error submitting your reviews.", 
        variant: "destructive" 
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#6B4423]">Write Reviews</h1>
        <p className="text-[#8B6F47]">Order #{orderId}</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
      <div className="space-y-6">
        {items.map((item, index) => {
          const itemId = item.id || item.product_id || item.productId
          const itemIdStr = String(itemId)
          return (
          <Card key={`${itemIdStr}-${index}`} className="border-2 border-[#E8DCC8] py-6">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">{item.productName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <img src={item.image_url || item.image || "/placeholder.svg"} alt={item.productName} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#6B4423]">Your Rating</Label>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map((s) => {
                        const currentRating = reviews[itemIdStr]?.rating || 0
                        const hoverRating = hovered[itemIdStr] || 0
                        const isHovering = hoverRating > 0
                        const activeUpTo = isHovering ? hoverRating : currentRating
                        const colorClass = isHovering ? "fill-[#FF7E00] text-[#FF7E00]" : "fill-[#FF7E00] text-[#FF7E00]"
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(itemIdStr, s)}
                            onMouseEnter={() => setHovered((h) => ({ ...h, [itemIdStr]: s }))}
                            onMouseLeave={() => setHovered((h) => ({ ...h, [itemIdStr]: 0 }))}
                            className="transition-transform hover:scale-110"
                          >
                            <Star className={`h-7 w-7 ${s <= activeUpTo ? colorClass : "text-gray-300"}`} />
                          </button>
                        )
                      })}
                    </div>
                  </div>
 
                  {/* Review Title */}
                  <div className="space-y-2">
                    <Label htmlFor={`title-${itemIdStr}`} className="text-[#6B4423]">Review Title</Label>
                    <Input
                      id={`title-${itemIdStr}`}
                      placeholder="Summarize your experience (e.g., Excellent quality ghee)"
                      value={reviews[itemIdStr]?.title || ""}
                      onChange={(e) => setTitle(itemIdStr, e.target.value)}
                      className="border-2 border-[#E8DCC8] focus:border-[#2D5F3F] h-12"
                    />
                  </div>
 
                  <div className="space-y-2">
                    <Label htmlFor={`comment-${itemIdStr}`} className="text-[#6B4423]">Your Review</Label>
                    <Textarea
                      id={`comment-${itemIdStr}`}
                      placeholder="Share your experience with this product..."
                      value={reviews[itemIdStr]?.comment || ""}
                      onChange={(e) => setComment(itemIdStr, e.target.value)}
                      className="border-2 border-[#E8DCC8] focus:border-[#2D5F3F] min-h-28"
                    />
                    <p className="text-xs text-[#8B6F47]">Minimum 20 characters ({reviews[itemIdStr]?.comment?.length || 0}/20)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
      )}

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit} disabled={submitting} className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
          {submitting ? "Submitting..." : "Submit Reviews"}
        </Button>
      </div>
    </div>
  )
}
