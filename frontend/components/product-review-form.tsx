"use client"

import type React from "react"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/**
 * Product Review Form Component
 *
 * Allows customers to submit reviews for products with ratings and comments.
 * Uses brown-green-orange color scheme for consistency.
 *
 * Features:
 * - Interactive star rating selector
 * - Form validation
 * - Success/error notifications
 * - Poppins font throughout
 *
 * Props:
 * - productId: ID of the product being reviewed
 * - onReviewSubmit: Callback function when review is submitted
 */

interface ProductReviewFormProps {
  productId: number
  onReviewSubmit?: () => void
}

export function ProductReviewForm({ productId, onReviewSubmit }: ProductReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handle form submission
   * Validates inputs and simulates review submission
   * In production, this would send data to an API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }

    if (!title.trim()) {
      toast.error("Please enter a review title")
      return
    }

    if (!comment.trim()) {
      toast.error("Please enter your review")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Success notification
    toast.success("Thank you for your review! It will be published after verification.")

    // Reset form
    setRating(0)
    setName("")
    setTitle("")
    setComment("")
    setIsSubmitting(false)

    // Call callback if provided
    if (onReviewSubmit) {
      onReviewSubmit()
    }
  }

  return (
    <Card className="border-2 border-[#E8DCC8] shadow-lg">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selector */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-base font-semibold text-[#6B4423]">
              Your Rating *
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= (hoveredRating || rating) ? "fill-[#FF7E00] text-[#FF7E00]" : "text-gray-300",
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-[#6B4423]">
                  {rating === 5 && "Excellent!"}
                  {rating === 4 && "Very Good"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Fair"}
                  {rating === 1 && "Poor"}
                </span>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold text-[#6B4423]">
              Your Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="border-2 border-[#E8DCC8] focus:border-[#2D5F3F] h-12 text-base placeholder:text-xs md:placeholder:text-base"
              required
            />
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold text-[#6B4423]">
              Review Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="border-2 border-[#E8DCC8] focus:border-[#2D5F3F] h-12 text-base placeholder:text-xxs md:placeholder:text-base"
              required
            />
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-semibold text-[#6B4423]">
              Your Review *
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="border-2 border-[#E8DCC8] focus:border-[#2D5F3F] min-h-32 text-base resize-none placeholder:text-xs md:placeholder:text-base"
              required
            />
            <p className="text-sm text-[#8B6F47]">Minimum 50 characters ({comment.length}/50)</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || comment.length < 50}
            className="w-full h-12 text-base font-semibold bg-[#2D5F3F] hover:bg-[#234A32] text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>

          <p className="text-sm text-[#8B6F47] text-center">
            * Required fields. Your review will be published after verification.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
