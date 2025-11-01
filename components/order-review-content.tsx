"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"
import { Input } from "@/components/ui/input"

interface OrderReviewContentProps {
  orderId: string
}

const mockOrderItems = [
  { id: "1", name: "Premium A2 Desi Cow Ghee", variant: "1 Liter", image: "/traditional-ghee.jpg" },
  { id: "2", name: "Organic Turmeric Powder", variant: "500g", image: "/turmeric-powder-in-bowl.jpg" },
]

export default function OrderReviewContent({ orderId }: OrderReviewContentProps) {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Record<string, { title: string; rating: number; comment: string }>>(
    Object.fromEntries(mockOrderItems.map((i) => [i.id, { title: "", rating: 0, comment: "" }]))
  )
  const [submitting, setSubmitting] = useState(false)
  const [hovered, setHovered] = useState<Record<string, number>>({})

  const setRating = (id: string, rating: number) =>
    setReviews((prev) => ({ ...prev, [id]: { ...prev[id], rating } }))
  const setTitle = (id: string, title: string) =>
    setReviews((prev) => ({ ...prev, [id]: { ...prev[id], title } }))
  const setComment = (id: string, comment: string) =>
    setReviews((prev) => ({ ...prev, [id]: { ...prev[id], comment } }))

  const handleSubmit = async () => {
    // Basic validation
    for (const item of mockOrderItems) {
      const r = reviews[item.id]
      if (!r || !r.title.trim()) {
        toast({ title: "Title required", description: `Please add a review title for ${item.name}.`, variant: "destructive" })
        return
      }
      if (r.rating === 0) {
        toast({ title: "Rating required", description: `Please select a rating for ${item.name}.`, variant: "destructive" })
        return
      }
      if (r.comment.trim().length < 20) {
        toast({ title: "Review too short", description: `Please write at least 20 characters for ${item.name}.`, variant: "destructive" })
        return
      }
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitting(false)
    toast({ title: "Reviews submitted", description: "Thanks for sharing your feedback!" })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#6B4423]">Write Reviews</h1>
        <p className="text-[#8B6F47]">Order #{orderId}</p>
      </div>

      <div className="space-y-6">
        {mockOrderItems.map((item) => (
          <Card key={item.id} className="border-2 border-[#E8DCC8] py-6">
            <CardHeader>
              <CardTitle className="text-[#6B4423]">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#6B4423]">Your Rating</Label>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map((s) => {
                        const currentRating = reviews[item.id]?.rating || 0
                        const hoverRating = hovered[item.id] || 0
                        const isHovering = hoverRating > 0
                        const activeUpTo = isHovering ? hoverRating : currentRating
                        const colorClass = isHovering ? "fill-[#FF7E00] text-[#FF7E00]" : "fill-[#FF7E00] text-[#FF7E00]"
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(item.id, s)}
                            onMouseEnter={() => setHovered((h) => ({ ...h, [item.id]: s }))}
                            onMouseLeave={() => setHovered((h) => ({ ...h, [item.id]: 0 }))}
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
                    <Label htmlFor={`title-${item.id}`} className="text-[#6B4423]">Review Title</Label>
                    <Input
                      id={`title-${item.id}`}
                      placeholder="Summarize your experience (e.g., Excellent quality ghee)"
                      value={reviews[item.id]?.title || ""}
                      onChange={(e) => setTitle(item.id, e.target.value)}
                      className="border-2 border-[#E8DCC8] focus:border-[#2D5F3F] h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`comment-${item.id}`} className="text-[#6B4423]">Your Review</Label>
                    <Textarea
                      id={`comment-${item.id}`}
                      placeholder="Share your experience with this product..."
                      value={reviews[item.id]?.comment || ""}
                      onChange={(e) => setComment(item.id, e.target.value)}
                      className="border-2 border-[#E8DCC8] focus:border-[#2D5F3F] min-h-28"
                    />
                    <p className="text-xs text-[#8B6F47]">Minimum 20 characters ({reviews[item.id]?.comment.length || 0}/20)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit} disabled={submitting} className="bg-[#2D5F3F] hover:bg-[#234A32] text-white">
          {submitting ? "Submitting..." : "Submit Reviews"}
        </Button>
      </div>
    </div>
  )
}
