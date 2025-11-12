"use client"

import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const reviews = [
  {
    id: 1,
    author: "Priya Sharma",
    rating: 5,
    date: "2 weeks ago",
    verified: true,
    title: "Excellent quality ghee!",
    comment:
      "This is the best ghee I've ever purchased online. The aroma and taste are authentic, just like homemade. Highly recommended!",
  },
  {
    id: 2,
    author: "Rajesh Kumar",
    rating: 4,
    date: "1 month ago",
    verified: true,
    title: "Good product",
    comment: "Quality is good and packaging was excellent. Slightly expensive but worth it for the quality.",
  },
  {
    id: 3,
    author: "Anita Desai",
    rating: 5,
    date: "1 month ago",
    verified: true,
    title: "Pure and authentic",
    comment: "Finally found pure desi ghee online. The bilona method really makes a difference in taste and quality.",
  },
]

const ratingDistribution = [
  { stars: 5, count: 89, percentage: 72 },
  { stars: 4, count: 24, percentage: 19 },
  { stars: 3, count: 8, percentage: 6 },
  { stars: 2, count: 2, percentage: 2 },
  { stars: 1, count: 1, percentage: 1 },
]

export function ProductReviews() {
  return (
    <div className="space-y-8">
      <h2 className="font-serif text-3xl font-bold">Customer Reviews</h2>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Rating Summary */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">4.8</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < 5 ? "fill-primary text-primary" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Based on 124 reviews</p>
            </div>

            <Separator />

            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm w-8">{item.stars}★</span>
                  <Progress value={item.percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                </div>
              ))}
            </div>

            <Button className="w-full">Write a Review</Button>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{review.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                              />
                            ))}
                          </div>
                          {review.verified && (
                            <span className="text-xs text-green-600 font-medium">Verified Purchase</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{review.title}</h4>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" className="w-full bg-transparent">
            Load More Reviews
          </Button>
        </div>
      </div>
    </div>
  )
}
