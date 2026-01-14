"use client"

import { Star, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { reviewService } from "@/lib/services/reviewService"
import { ProductReviewForm } from "@/components/product-review-form"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

interface ProductReviewsProps {
  productId: number
  initialRating?: number
  initialReviewCount?: number
  onCountChange?: (count: number) => void
}

export function ProductReviews({ 
  productId, 
  initialRating = 0, 
  initialReviewCount = 0,
  onCountChange 
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  
  const { isAuthenticated } = useAuthStore()

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewService.getProductReviews(productId)
      console.log('Fetched reviews for product', productId, ':', data)
      
      // The backend returns an array of reviews directly in data
      const reviewsList = Array.isArray(data) ? data : (data as any).reviews || []
      setReviews(reviewsList)
      
      // Calculate basic stats if not provided by backend
      if (!(data as any).stats) {
        const total = reviewsList.length
        const avg = total > 0 
          ? reviewsList.reduce((acc: number, r: any) => acc + r.rating, 0) / total 
          : 0
        setStats({
          averageRating: avg,
          totalReviews: total
        })
        if (onCountChange) onCountChange(total)
      } else {
        setStats((data as any).stats)
        if (onCountChange) onCountChange((data as any).stats.totalReviews)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchReviews()
    }
  }, [productId])

  if (loading) {
    return <div className="text-center py-12 animate-pulse text-[#8B6F47]">Loading reviews...</div>
  }

  const averageRating = stats?.averageRating || initialRating
  const totalReviews = stats?.totalReviews || initialReviewCount

  return (
    <div className="space-y-8">
      <Card className="border-2 border-[#E8DCC8] shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="space-y-6">
              <div className="text-center p-8 bg-[#F5F1E8] rounded-2xl border border-[#E8DCC8]/50">
                <div className="text-6xl font-bold mb-3 text-[#6B4423]">{Number(averageRating).toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-6 w-6",
                        i < Math.round(averageRating) ? "fill-[#FF7E00] text-[#FF7E00]" : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <p className="text-base text-[#8B6F47] font-medium">Based on {totalReviews} reviews</p>
              </div>
              
              {isAuthenticated ? (
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full h-14 text-lg font-bold bg-[#FF7E00] hover:bg-[#E67300] text-white rounded-xl shadow-lg shadow-[#FF7E00]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Edit3 className="mr-2 h-5 w-5" />
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </Button>
              ) : (
                <div className="text-center p-4 bg-[#2D5F3F]/5 rounded-xl border border-[#2D5F3F]/10">
                  <p className="text-sm text-[#2D5F3F] font-medium mb-3">Login to write a review</p>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full border-[#2D5F3F] text-[#2D5F3F] hover:bg-[#2D5F3F] hover:text-white">
                      Login Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between border-b border-[#E8DCC8] pb-4">
                <h3 className="font-sans text-2xl font-bold text-[#6B4423]">Customer Reviews</h3>
                <span className="text-sm font-medium text-[#8B6F47] bg-[#F5F1E8] px-3 py-1 rounded-full border border-[#E8DCC8]">
                  {reviews.length} total
                </span>
              </div>
              
              {/* Review Form */}
              {showReviewForm && (
                <div className="p-6 bg-gradient-to-r from-[#FF7E00]/5 to-[#2D5F3F]/5 rounded-2xl border-2 border-[#FF7E00]/20 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-[#FF7E00] rounded-lg">
                      <Edit3 className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#6B4423]">Your Feedback Matters</h4>
                  </div>
                  <ProductReviewForm
                    productId={productId}
                    onReviewSubmit={() => {
                      setShowReviewForm(false)
                      fetchReviews() // Refresh list
                    }}
                  />
                </div>
              )}

              {/* Existing Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div key={review.id} className="group border-b border-[#E8DCC8] pb-8 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          <div className="h-12 w-12 rounded-full bg-[#E8DCC8] flex items-center justify-center text-[#6B4423] font-bold text-lg border-2 border-white shadow-sm overflow-hidden">
                            {review.user_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-[#6B4423] mb-1">{review.user_name || 'Anonymous'}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-4 w-4",
                                      i < review.rating ? "fill-[#FF7E00] text-[#FF7E00]" : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                              {review.verified_purchase && (
                                <span className="text-[10px] uppercase tracking-wider text-white font-bold bg-[#2D5F3F] px-2 py-0.5 rounded-full">
                                  Verified
                                </span>
                              )}
                              <span className="text-xs text-[#8B6F47]">{new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-bold text-[#6B4423] text-lg mb-2">{review.title}</h4>
                      <p className="text-[#6B4423]/90 leading-relaxed text-base italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#F5F1E8]/30 rounded-2xl border-2 border-dashed border-[#E8DCC8]">
                  <p className="text-[#8B6F47] text-lg italic">No reviews yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
