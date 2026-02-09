
import { Metadata } from "next"
import CategoryClient from "./category-client"
import { productService } from "@/lib/services/productService"

const categoryInfo: Record<string, { title: string; description: string }> = {
  ghee: {
    title: "Pure Ghee",
    description: "Traditional bilona ghee made from grass-fed cow milk",
  },
  spices: {
    title: "Premium Spices",
    description: "Authentic Indian spices for your kitchen",
  },
  "dry-fruits": {
    title: "Dry Fruits & Nuts",
    description: "Fresh and nutritious dry fruits",
  },
  oils: {
    title: "Cold Pressed Oils",
    description: "Traditional oils for healthy cooking",
  },
}

type Props = {
  params: { category: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = params.category
  const info = categoryInfo[category] || {
    title: `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}`,
    description: `Shop authentic ${category.replace(/-/g, ' ')} from Swadeshika`
  }

  return {
    title: `${info.title} - Swadeshika`,
    description: info.description,
    openGraph: {
      title: `${info.title} - Swadeshika`,
      description: info.description,
    },
    alternates: {
      canonical: `/shop/${category}`,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const category = params.category
  const info = categoryInfo[category] || {
    title: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
    description: `Browse our collection of ${category.replace(/-/g, ' ')}`
  }

  // Server-Side Fetch
  let categories: any[] = []
  try {
    categories = await productService.getAllCategories()
  } catch (error) {
    console.error("Failed to fetch categories for category page", error)
  }

  return (
    <CategoryClient
      category={category}
      title={info.title}
      description={info.description}
      initialCategories={categories}
    />
  )
}
