"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Star, Loader2, CheckCircle } from "lucide-react"
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

  const [existingReviews, setExistingReviews] = useState<Record<string, any>>({})

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

        // Fetch existing reviews to prevent duplicates
        try {
             const userReviews = await reviewService.getMyReviews();
             const relevantReviews = userReviews.filter((r: any) => String(r.order_id) === String(orderId));
             const reviewMap: Record<string, any> = {};
             relevantReviews.forEach((r: any) => {
                 reviewMap[String(r.product_id)] = r;
                 // Also map by item ID if possible, but product_id is safer link
             });
             setExistingReviews(reviewMap);
        } catch (err) {
            console.error("Failed to fetch existing reviews", err);
        }

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

  const [submittingItems, setSubmittingItems] = useState<Record<string, boolean>>({})

  const handleSingleSubmit = async (item: OrderItem) => {
    const itemId = item.id || item.product_id || item.productId
    const itemIdStr = String(itemId)
    const productId = item.product_id || item.productId || item.id
    const productIdStr = String(productId)
    
    if (!itemId || !productId) return

    const r = reviews[itemIdStr]
    
    // Validation for single item
    if (!r || !r.title.trim()) {
      toast({ title: "Title required", description: "Please add a review title.", variant: "destructive" })
      return
    }
    if (r.rating === 0) {
      toast({ title: "Rating required", description: "Please select a rating.", variant: "destructive" })
      return
    }
    if (r.comment.trim().length < 20) {
      toast({ title: "Review too short", description: "Please write at least 20 characters.", variant: "destructive" })
      return
    }

    setSubmittingItems(prev => ({ ...prev, [itemIdStr]: true }))
    
    try {
      const reviewData = {
        product_id: productId,
        order_id: orderId,
        rating: r.rating,
        title: r.title,
        comment: r.comment
      }
      
      const response = await reviewService.createReview(reviewData)
      
      toast({ title: "Review submitted", description: "Thanks for sharing your feedback!" })
      
      // Update local state to show read-only view immediately
      setExistingReviews(prev => ({
        ...prev,
        [productIdStr]: {
            ...reviewData,
            created_at: new Date().toISOString()
        }
      }))
      
    } catch (error: any) {
      console.error("Failed to submit review:", error)
      toast({ 
        title: "Submission failed", 
        description: error.response?.data?.message || "There was an error submitting your review.", 
        variant: "destructive" 
      })
    } finally {
      setSubmittingItems(prev => ({ ...prev, [itemIdStr]: false }))
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
          // Key for existing reviews is product_id, which we map from item
          const productIdStr = String(item.product_id || item.productId || item.id)
          const existingReview = existingReviews[productIdStr];
          const isSubmitting = submittingItems[itemIdStr] || false

          return (
          <Card key={`${itemIdStr}-${index}`} className="border-2 border-[#E8DCC8] py-6">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">{item.productName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <img src={item.image_url || item.image || "/placeholder.svg"} alt={item.productName} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1 space-y-4">
                 
                 {existingReview ? (
                    // Read-only view for existing review
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-green-800">Review Submitted</h4>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                                {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`h-4 w-4 ${s <= existingReview.rating ? "fill-[#FF7E00] text-[#FF7E00]" : "text-gray-300"}`} />
                                ))}
                            </div>
                            <h5 className="font-medium text-[#6B4423]">{existingReview.title}</h5>
                            <p className="text-[#8B6F47] mt-1 text-sm">{existingReview.comment}</p>
                            <p className="text-xs text-muted-foreground mt-2">Submitted on {new Date(existingReview.created_at || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>
                 ) : (
                    // Edit Form
                    <>
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

                  <div className="flex justify-end pt-2">
                    <Button 
                        onClick={() => handleSingleSubmit(item)} 
                        disabled={isSubmitting} 
                        className="bg-[#2D5F3F] hover:bg-[#234A32] text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : "Submit Review"}
                    </Button>
                  </div>
                  </>
                 )}

                </div>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
      )}


    </div>
  )
}
