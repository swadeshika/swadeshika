/**
 * RelatedProducts
 *
 * Purpose:
 * - Displays a simple related products grid for product detail pages.
 *
 * Key Features:
 * - Responsive 2/4-column layout with image, badge, category, rating, and pricing.
 * - Uses brand-aligned Card and Badge components.
 *
 * Implementation Notes:
 * - Currently uses a static list; replace with real recommendations from backend when available.
 * - Keep stable keys (product.id) to avoid React key warnings.
 */
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const relatedProducts = [
  {
    id: "5",
    name: "A2 Buffalo Ghee",
    slug: "a2-buffalo-ghee",
    price: 750,
    comparePrice: 900,
    image: "/golden-ghee-in-glass-jar.jpg",
    category: "Ghee",
    rating: 4.7,
  },
  {
    id: "2",
    name: "Organic Turmeric Powder",
    slug: "organic-turmeric-powder",
    price: 180,
    comparePrice: 220,
    image: "/turmeric-powder-in-bowl.jpg",
    badge: "Organic",
    category: "Spices",
    rating: 4.9,
  },
  {
    id: "4",
    name: "Cold Pressed Coconut Oil",
    slug: "cold-pressed-coconut-oil",
    price: 320,
    image: "/coconut-oil-in-glass-bottle.jpg",
    badge: "New",
    category: "Oils",
    rating: 4.6,
  },
  {
    id: "3",
    name: "Premium Kashmiri Almonds",
    slug: "premium-kashmiri-almonds",
    price: 650,
    image: "/kashmiri-almonds.jpg",
    badge: "Premium",
    category: "Dry Fruits",
    rating: 4.7,
  },
]

export function RelatedProducts() {
  return (
    <div className="space-y-8">
      <h2 className="font-serif text-3xl font-bold">You May Also Like</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/products/${product.slug}`}>
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && <Badge className="absolute top-3 left-3">{product.badge}</Badge>}
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                <h3 className="font-semibold mb-2 text-balance line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-primary">★</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">₹{product.price}</span>
                  {product.comparePrice && (
                    <span className="text-sm text-muted-foreground line-through">₹{product.comparePrice}</span>
                  )}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
