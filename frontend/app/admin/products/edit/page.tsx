import { AdminLayout } from "@/components/admin-layout"
import { AdminProductForm } from "@/components/admin-product-form"

type Demo = {
  name: string
  slug: string
  price: number
  comparePrice: number
  category: string
  images: string[]
  description: string
  variants: { name: string; price: number }[]
  features: string[]
}

const demoData: Record<string, Demo> = {
  "pure-desi-cow-ghee": {
    name: "Pure Desi Cow Ghee",
    slug: "pure-desi-cow-ghee",
    price: 850,
    comparePrice: 1000,
    category: "Ghee",
    images: ["/golden-ghee-in-glass-jar.jpg", "/traditional-ghee.jpg", "/golden-ghee-in-glass-jar.jpg"],
    description:
      "Made from the milk of grass-fed cows using traditional bilona method. Rich in vitamins A, D, E, and K. Perfect for cooking, baking, and Ayurvedic remedies. Our ghee is prepared in small batches to ensure the highest quality and authentic taste.",
    variants: [
      { name: "500g", price: 450 },
      { name: "1kg", price: 850 },
      { name: "2kg", price: 1600 },
    ],
    features: [
      "100% Pure Desi Cow Ghee",
      "Traditional Bilona Method",
      "Rich in Vitamins A, D, E, K",
      "No Preservatives or Additives",
      "Grass-Fed Cow Milk",
      "Small Batch Production",
    ],
  },
}

export default function AdminEditProductPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Expected pattern: /admin/products/edit?={slug}
  const firstParamKey = Object.keys(searchParams || {})[0]
  const raw = firstParamKey ? searchParams[firstParamKey] : undefined
  const slug = Array.isArray(raw) ? raw[0] : raw

  const demo = (slug && demoData[slug]) || demoData["pure-desi-cow-ghee"]

  const initial = {
    name: demo.name,
    slug: demo.slug,
    description: `<p>${demo.description}</p>`,
    shortDescription: "Authentic, aromatic, traditionally prepared ghee.",
    price: String(demo.price),
    comparePrice: String(demo.comparePrice),
    category: demo.category.toLowerCase(),
    status: "active",
    sku: "GHEE-001",
    stock: "120",
    tags: "ghee, desi, pure",
    metaTitle: demo.name,
    metaDescription: demo.description.slice(0, 155),
    publish: true,
    related: "2,3",
  }

  const initialVariants = demo.variants.map((v) => ({
    name: v.name,
    price: String(v.price), // Selling
    salePrice: String(demo.comparePrice), // MRP for variant
    sku: `GHEE-${v.name.replace(/\W+/g, "").toUpperCase()}`,
    stock: "50",
  }))

  const initialFeatures = demo.features
  const initialSpecs: { key: string; value: string }[] = []

  return (
    <AdminLayout>
      <AdminProductForm
        mode="edit"
        initial={initial}
        initialVariants={initialVariants}
        initialFeatures={initialFeatures}
        initialSpecs={initialSpecs}
        initialPrimaryImageUrl={demo.images[0]}
        initialGalleryUrls={demo.images}
      />
    </AdminLayout>
  )
}
