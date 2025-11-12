export interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
  badge?: string
  category: string
  rating: number
  reviews: number
}

export const allProducts: Product[] = [
  {
    id: "1",
    name: "Pure Desi Cow Ghee",
    slug: "pure-desi-cow-ghee",
    price: 850,
    comparePrice: 1000,
    image: "/golden-ghee-in-glass-jar.jpg",
    badge: "Bestseller",
    category: "Ghee",
    rating: 4.8,
    reviews: 124,
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
    reviews: 89,
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
    reviews: 56,
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
    reviews: 43,
  },
  {
    id: "5",
    name: "A2 Buffalo Ghee",
    slug: "a2-buffalo-ghee",
    price: 750,
    comparePrice: 900,
    image: "/golden-ghee-in-glass-jar.jpg",
    category: "Ghee",
    rating: 4.7,
    reviews: 78,
  },
  {
    id: "6",
    name: "Red Chilli Powder",
    slug: "red-chilli-powder",
    price: 120,
    image: "/turmeric-powder-in-bowl.jpg",
    badge: "Hot",
    category: "Spices",
    rating: 4.5,
    reviews: 92,
  },
  {
    id: "7",
    name: "Premium Cashews",
    slug: "premium-cashews",
    price: 580,
    image: "/kashmiri-almonds.jpg",
    category: "Dry Fruits",
    rating: 4.8,
    reviews: 67,
  },
  {
    id: "8",
    name: "Mustard Oil",
    slug: "mustard-oil",
    price: 280,
    image: "/coconut-oil-in-glass-bottle.jpg",
    category: "Oils",
    rating: 4.4,
    reviews: 34,
  },
]
