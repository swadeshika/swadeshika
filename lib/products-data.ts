/**
 * Products Data Constants
 *
 * Centralized product data for the e-commerce site.
 * Contains real product information with relevant images and details.
 *
 * Structure:
 * - Product catalog with full details
 * - Related products for cross-selling
 * - Product reviews and ratings
 *
 * Usage:
 * Import this file wherever product data is needed
 * In production, this would be replaced with database queries
 */

export interface ProductVariant {
  id: string
  name: string
  price: number
  comparePrice?: number
  sku: string
  weight?: number
  weightUnit: string
  quantity: number
  attributes: Record<string, string>
  isActive: boolean
}

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string[]
  badge?: string
  category: string
  description: string
  shortDescription: string
  features: string[]
  specifications: Record<string, string>
  inStock: boolean
  rating: number
  reviewCount: number
  variants?: ProductVariant[]
  sku: string
  weight?: number
  weightUnit: string
  tags: string[]
  metaTitle?: string
  metaDescription?: string
}

export interface Review {
  id: number
  productId: number
  userName: string
  userImage?: string
  rating: number
  title: string
  comment: string
  date: string
  verified: boolean
  helpful: number
}

export interface RelatedProduct {
  id: number
  name: string
  price: number
  comparePrice?: number
  image: string
  badge?: string
  category: string
}

// Main product catalog
export const products: Product[] = [
  {
    id: 6,
    name: "A2 Gir Cow Ghee",
    slug: "a2-gir-cow-ghee",
    price: 1200,
    comparePrice: 1400,
    images: [
      "/gir-cow-ghee-jar.jpg",
      "/gir-cow-grazing.jpg",
      "/premium-ghee-pour.jpg",
      "/gir-cow-ghee-spoon.jpg",
    ],
    badge: "Premium",
    category: "Ghee",
    description:
      "Experience the unmatched purity of our A2 Gir Cow Ghee, sourced exclusively from free-grazing indigenous Gir cows. Made using the traditional bilona method, this golden elixir is rich in natural A2 beta-casein protein and essential nutrients. Our Gir cows graze freely on organic pastures, ensuring the highest quality milk that's transformed into this premium ghee. Perfect for both culinary delights and traditional wellness practices.",
    shortDescription: "Premium A2 ghee from free-grazing Gir cows",
    features: [
      "100% A2 milk from pure Gir cows",
      "Free-grazing cows on organic pastures",
      "Traditional hand-churned bilona method",
      "Rich in A2 beta-casein protein",
      "Higher CLA and Omega-3 content",
      "No additives or preservatives",
      "Sourced from indigenous Gir breed",
      "Perfect for Ayurvedic practices",
    ],
    specifications: {
      Weight: "500g",
      "Shelf Life": "12 months",
      Storage: "Store in a cool, dry place",
      Origin: "Gujarat, India",
      Certification: "FSSAI Certified, Organic India",
      "Smoke Point": "250°C",
      "Fat Content": "99.9%",
      "Cow Breed": "Pure Gir",
      "Production Method": "Traditional Bilona",
    },
    inStock: true,
    rating: 4.9,
    reviewCount: 156,
    sku: "GHEE-002",
    weight: 0.5,
    weightUnit: "kg",
    tags: ["ghee", "a2-milk", "gir-cow", "premium", "organic", "traditional", "ayurvedic"],
    metaTitle: "A2 Gir Cow Ghee - Premium Quality from Free-Grazing Cows | Swadeshika",
    metaDescription: "Buy premium A2 ghee from free-grazing Gir cows. Pure, traditional, and packed with nutrients. Perfect for cooking and Ayurvedic uses.",
    variants: [
      {
        id: "gir-ghee-500g",
        name: "500g",
        price: 650,
        comparePrice: 750,
        sku: "GHEE-002-500G",
        weight: 0.5,
        weightUnit: "kg",
        quantity: 30,
        attributes: { size: "500g", weight: "0.5kg" },
        isActive: true,
      },
      {
        id: "gir-ghee-1kg",
        name: "1kg",
        price: 1200,
        comparePrice: 1400,
        sku: "GHEE-002-1KG",
        weight: 1.0,
        weightUnit: "kg",
        quantity: 20,
        attributes: { size: "1kg", weight: "1kg" },
        isActive: true,
      },
      {
        id: "gir-ghee-2kg",
        name: "2kg",
        price: 2200,
        comparePrice: 2600,
        sku: "GHEE-002-2KG",
        weight: 2.0,
        weightUnit: "kg",
        quantity: 15,
        attributes: { size: "2kg", weight: "2kg" },
        isActive: true,
      }
    ],
  },
  {
    id: 1,
    name: "Pure Desi Cow Ghee",
    slug: "pure-desi-cow-ghee",
    price: 850,
    comparePrice: 1000,
    images: [
      "/golden-ghee-in-glass-jar.jpg",
      "/ghee-in-traditional-pot.jpg",
      "/ghee-being-poured.jpg",
      "/ghee-with-spoon.jpg",
    ],
    badge: "Bestseller",
    category: "Ghee",
    description:
      "Experience the rich, authentic taste of our Pure Desi Cow Ghee, made using traditional bilona method. Sourced from grass-fed cows and prepared with utmost care, this golden elixir is packed with nutrients and flavor. Perfect for cooking, baking, or simply adding a dollop to your dal or roti. Our ghee is prepared in small batches to ensure the highest quality and authentic taste that has been passed down through generations.",
    shortDescription: "Traditional bilona method ghee from grass-fed cows",
    features: [
      "Made from A2 milk of desi cows",
      "Traditional bilona churning method",
      "No preservatives or additives",
      "Rich in vitamins A, D, E, and K",
      "High smoke point ideal for cooking",
      "Lactose-free and casein-free",
      "Small batch production for quality",
      "Ayurvedic benefits for health",
    ],
    specifications: {
      Weight: "500g",
      "Shelf Life": "12 months",
      Storage: "Store in a cool, dry place",
      Origin: "Rajasthan, India",
      Certification: "FSSAI Certified",
      "Smoke Point": "250°C",
      "Fat Content": "99.9%",
    },
    inStock: true,
    rating: 4.8,
    reviewCount: 234,
    sku: "GHEE-001",
    weight: 0.5,
    weightUnit: "kg",
    tags: ["ghee", "organic", "traditional", "bilona", "ayurvedic"],
    metaTitle: "Pure Desi Cow Ghee - Traditional Bilona Method | Swadeshika",
    metaDescription: "Buy pure desi cow ghee made using traditional bilona method. 100% natural, rich in nutrients, perfect for cooking and health.",
    variants: [
      {
        id: "ghee-500g",
        name: "500g",
        price: 450,
        comparePrice: 550,
        sku: "GHEE-001-500G",
        weight: 0.5,
        weightUnit: "kg",
        quantity: 50,
        attributes: { size: "500g", weight: "0.5kg" },
        isActive: true,
      },
      {
        id: "ghee-1kg",
        name: "1kg",
        price: 850,
        comparePrice: 1000,
        sku: "GHEE-001-1KG",
        weight: 1.0,
        weightUnit: "kg",
        quantity: 30,
        attributes: { size: "1kg", weight: "1kg" },
        isActive: true,
      },
      {
        id: "ghee-2kg",
        name: "2kg",
        price: 1600,
        comparePrice: 1900,
        sku: "GHEE-001-2KG",
        weight: 2.0,
        weightUnit: "kg",
        quantity: 20,
        attributes: { size: "2kg", weight: "2kg" },
        isActive: true,
      },
    ],
  },
  {
    id: 2,
    name: "Organic Turmeric Powder",
    slug: "organic-turmeric-powder",
    price: 180,
    comparePrice: 220,
    images: [
      "/turmeric-powder-in-bowl.jpg",
      "/turmeric-roots.jpg",
      "/turmeric-powder-close-up.jpg",
      "/turmeric-in-spoon.jpg",
    ],
    badge: "Organic",
    category: "Spices",
    description:
      "Our premium Organic Turmeric Powder is sourced from the finest turmeric roots grown in the fertile lands of India. Known for its vibrant color and potent health benefits, this golden spice is a must-have in every kitchen. Rich in curcumin, it's perfect for adding flavor and wellness to your daily meals.",
    shortDescription: "High curcumin organic turmeric powder",
    features: [
      "100% organic and chemical-free",
      "High curcumin content",
      "Anti-inflammatory properties",
      "Boosts immunity naturally",
      "Vibrant golden color",
      "Freshly ground for maximum potency",
    ],
    specifications: {
      Weight: "200g",
      "Shelf Life": "18 months",
      Storage: "Store in an airtight container",
      Origin: "Tamil Nadu, India",
      Certification: "Organic Certified",
    },
    inStock: true,
    rating: 4.9,
    reviewCount: 189,
    sku: "SPICE-001",
    weight: 0.2,
    weightUnit: "kg",
    tags: ["spices", "organic", "turmeric", "health", "curcumin"],
    metaTitle: "Organic Turmeric Powder - High Curcumin | Swadeshika",
    metaDescription: "Buy premium organic turmeric powder with high curcumin content. 100% natural, anti-inflammatory, perfect for health and cooking.",
    variants: [
      {
        id: "turmeric-100g",
        name: "100g",
        price: 90,
        comparePrice: 110,
        sku: "SPICE-001-100G",
        weight: 0.1,
        weightUnit: "kg",
        quantity: 100,
        attributes: { size: "100g", weight: "0.1kg" },
        isActive: true,
      },
      {
        id: "turmeric-250g",
        name: "250g",
        price: 180,
        comparePrice: 220,
        sku: "SPICE-001-250G",
        weight: 0.25,
        weightUnit: "kg",
        quantity: 80,
        attributes: { size: "250g", weight: "0.25kg" },
        isActive: true,
      },
      {
        id: "turmeric-500g",
        name: "500g",
        price: 350,
        comparePrice: 420,
        sku: "SPICE-001-500G",
        weight: 0.5,
        weightUnit: "kg",
        quantity: 60,
        attributes: { size: "500g", weight: "0.5kg" },
        isActive: true,
      },
    ],
  },
  {
    id: 3,
    name: "Premium Kashmiri Almonds",
    slug: "premium-kashmiri-almonds",
    price: 650,
    images: ["/kashmiri-almonds.jpg", "/almonds-in-bowl.jpg", "/almonds-close-up.jpg", "/almonds-scattered.jpg"],
    badge: "Premium",
    category: "Dry Fruits",
    description:
      "Indulge in the finest Premium Kashmiri Almonds, handpicked from the valleys of Kashmir. These almonds are known for their superior taste, crunchy texture, and exceptional nutritional value. Rich in protein, healthy fats, and antioxidants, they make a perfect snack or addition to your desserts.",
    shortDescription: "Handpicked Kashmiri almonds",
    features: [
      "Handpicked from Kashmir",
      "Rich in protein and fiber",
      "High in vitamin E and magnesium",
      "Supports heart health",
      "Natural and unprocessed",
      "Perfect for snacking and cooking",
    ],
    specifications: {
      Weight: "250g",
      "Shelf Life": "6 months",
      Storage: "Store in a cool, dry place",
      Origin: "Kashmir, India",
      Certification: "Quality Tested",
    },
    inStock: true,
    rating: 4.7,
    reviewCount: 156,
    sku: "DRY-001",
    weight: 0.25,
    weightUnit: "kg",
    tags: ["dry-fruits", "almonds", "premium", "kashmiri", "healthy"],
    metaTitle: "Premium Kashmiri Almonds - Handpicked | Swadeshika",
    metaDescription: "Buy premium Kashmiri almonds handpicked from Kashmir. Rich in protein, vitamin E, perfect for snacking and health.",
    variants: [
      {
        id: "almonds-250g",
        name: "250g",
        price: 350,
        sku: "DRY-001-250G",
        weight: 0.25,
        weightUnit: "kg",
        quantity: 50,
        attributes: { size: "250g", weight: "0.25kg" },
        isActive: true,
      },
      {
        id: "almonds-500g",
        name: "500g",
        price: 650,
        sku: "DRY-001-500G",
        weight: 0.5,
        weightUnit: "kg",
        quantity: 40,
        attributes: { size: "500g", weight: "0.5kg" },
        isActive: true,
      },
      {
        id: "almonds-1kg",
        name: "1kg",
        price: 1200,
        sku: "DRY-001-1KG",
        weight: 1.0,
        weightUnit: "kg",
        quantity: 30,
        attributes: { size: "1kg", weight: "1kg" },
        isActive: true,
      },
    ],
  },
  {
    id: 4,
    name: "Cold Pressed Coconut Oil",
    slug: "cold-pressed-coconut-oil",
    price: 320,
    images: [
      "/coconut-oil-in-glass-bottle.jpg",
      "/coconut-oil-being-poured.jpg",
      "/coconuts.jpg",
      "/coconut-oil-in-jar.jpg",
    ],
    badge: "New",
    category: "Oils",
    description:
      "Our Cold Pressed Coconut Oil is extracted using traditional methods to preserve all the natural goodness of fresh coconuts. This versatile oil is perfect for cooking, hair care, and skin care. With its mild aroma and numerous health benefits, it's a kitchen essential you can't do without.",
    shortDescription: "Cold pressed coconut oil for cooking and beauty",
    features: [
      "100% pure and natural",
      "Cold pressed to retain nutrients",
      "Rich in MCT fatty acids",
      "Multipurpose - cooking and beauty",
      "No chemicals or additives",
      "Boosts metabolism and immunity",
    ],
    specifications: {
      Volume: "500ml",
      "Shelf Life": "24 months",
      Storage: "Store at room temperature",
      Origin: "Kerala, India",
      Certification: "FSSAI Certified",
    },
    inStock: true,
    rating: 4.6,
    reviewCount: 98,
    sku: "OIL-001",
    weight: 0.5,
    weightUnit: "kg",
    tags: ["oils", "coconut", "cold-pressed", "natural", "beauty"],
    metaTitle: "Cold Pressed Coconut Oil - Natural & Pure | Swadeshika",
    metaDescription: "Buy cold pressed coconut oil for cooking and beauty. 100% natural, rich in MCT, perfect for health and skincare.",
    variants: [
      {
        id: "coconut-250ml",
        name: "250ml",
        price: 180,
        sku: "OIL-001-250ML",
        weight: 0.25,
        weightUnit: "kg",
        quantity: 60,
        attributes: { size: "250ml", volume: "250ml" },
        isActive: true,
      },
      {
        id: "coconut-500ml",
        name: "500ml",
        price: 320,
        sku: "OIL-001-500ML",
        weight: 0.5,
        weightUnit: "kg",
        quantity: 40,
        attributes: { size: "500ml", volume: "500ml" },
        isActive: true,
      },
      {
        id: "coconut-1l",
        name: "1L",
        price: 600,
        sku: "OIL-001-1L",
        weight: 1.0,
        weightUnit: "kg",
        quantity: 25,
        attributes: { size: "1L", volume: "1L" },
        isActive: true,
      },
    ],
  },
]

// Product reviews data
export const productReviews: Review[] = [
  {
    id: 30,
    productId: 6,
    userName: "Dr. Ayush Patel",
    rating: 5,
    title: "Authentic A2 Gir Cow Ghee - Exceptional Quality!",
    comment:
      "As an Ayurvedic practitioner, I've been searching for genuine A2 Gir cow ghee for my patients. This is absolutely authentic - the golden color, the granular texture, and the rich aroma are exactly what you expect from premium Gir cow ghee. My patients have reported excellent results.",
    date: "2024-01-02",
    verified: true,
    helpful: 45
  },
  {
    id: 31,
    productId: 6,
    userName: "Meena Sharma",
    rating: 5,
    title: "The Real Deal - Worth Every Penny",
    comment:
      "You can truly taste the difference in this A2 Gir cow ghee. The aroma takes me back to my grandmother's kitchen. Yes, it's pricier than regular ghee, but the quality justifies the cost. Perfect for both cooking and traditional remedies.",
    date: "2024-01-15",
    verified: true,
    helpful: 38
  },
  {
    id: 32,
    productId: 6,
    userName: "Rajesh Mehta",
    rating: 4,
    title: "Premium Quality but Expensive",
    comment:
      "Excellent quality ghee with authentic taste and aroma. You can tell it's from pure Gir cows. The granular texture and rich golden color are perfect. Only giving 4 stars because of the high price point, but understand it's due to the premium sourcing.",
    date: "2024-01-20",
    verified: true,
    helpful: 28
  },
  {
    id: 1,
    productId: 1,
    userName: "Priya Sharma",
    rating: 5,
    title: "Best ghee I've ever tasted!",
    comment:
      "This ghee is absolutely amazing! The aroma and taste are so authentic. You can tell it's made with care using traditional methods. I use it for cooking and it adds such a rich flavor to everything. Highly recommend!",
    date: "2024-01-15",
    verified: true,
    helpful: 24,
  },
  {
    id: 2,
    productId: 1,
    userName: "Rajesh Kumar",
    rating: 5,
    title: "Pure and authentic",
    comment:
      "Finally found ghee that tastes like the one my grandmother used to make. The quality is exceptional and you can see the golden color. Worth every penny!",
    date: "2024-01-10",
    verified: true,
    helpful: 18,
  },
  {
    id: 3,
    productId: 1,
    userName: "Anita Desai",
    rating: 4,
    title: "Great quality, slightly pricey",
    comment:
      "The ghee is of excellent quality and tastes great. My only concern is the price, but I guess you pay for quality. Will definitely buy again.",
    date: "2024-01-05",
    verified: true,
    helpful: 12,
  },
  {
    id: 4,
    productId: 2,
    userName: "Meera Patel",
    rating: 5,
    title: "Vibrant color and amazing quality",
    comment:
      "This turmeric powder is so fresh and vibrant! The color is beautiful and it has a strong, authentic aroma. I use it in my daily cooking and for golden milk. Excellent product!",
    date: "2024-01-12",
    verified: true,
    helpful: 15,
  },
  {
    id: 5,
    productId: 2,
    userName: "Vikram Singh",
    rating: 5,
    title: "Pure and organic",
    comment:
      "You can tell this is pure organic turmeric. No artificial color or additives. Great for health and cooking both. Highly satisfied!",
    date: "2024-01-08",
    verified: true,
    helpful: 10,
  },
]

// Related products for cross-selling
export const relatedProducts: RelatedProduct[] = [
  {
    id: 5,
    name: "Organic Honey",
    price: 450,
    image: "/organic-honey-in-jar.jpg",
    badge: "Organic",
    category: "Natural Sweeteners",
  },
  {
    id: 6,
    name: "Himalayan Pink Salt",
    price: 120,
    comparePrice: 150,
    image: "/pink-himalayan-salt.jpg",
    badge: "Premium",
    category: "Salts",
  },
  {
    id: 7,
    name: "Organic Jaggery",
    price: 180,
    image: "/jaggery-blocks.jpg",
    badge: "Organic",
    category: "Natural Sweeteners",
  },
  {
    id: 8,
    name: "Mustard Oil",
    price: 280,
    image: "/mustard-oil-bottle.jpg",
    badge: "Traditional",
    category: "Oils",
  },
]

/**
 * Generate URL-friendly slug from product name
 * Converts spaces to hyphens, removes special characters, and converts to lowercase
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

// Helper function to get product by ID
export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}

// Helper function to get product by slug
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

// Helper function to get reviews for a product
export function getProductReviews(productId: number): Review[] {
  return productReviews.filter((r) => r.productId === productId)
}

// Helper function to get related products (excluding current product)
export function getRelatedProducts(currentProductId: number, limit = 4): RelatedProduct[] {
  return relatedProducts.filter((p) => p.id !== currentProductId).slice(0, limit)
}
