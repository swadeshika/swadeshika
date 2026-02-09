
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

export default async function CategoryPage({ params, searchParams }: Props & { searchParams: { [key: string]: string | string[] | undefined } }) {
  const category = params.category
  const info = categoryInfo[category] || {
    title: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
    description: `Browse our collection of ${category.replace(/-/g, ' ')}`
  }

  let categories: any[] = []
  let productsData: any = { products: [], total: 0, page: 1, pages: 1 }

  try {
    // 1. Parse Sort Param
    const sortVal = searchParams?.sort as string || "featured"
    let sortParam = "featured"
    if (sortVal === "price-low") sortParam = "price_asc"
    else if (sortVal === "price-high") sortParam = "price_desc"
    else if (sortVal === "rating") sortParam = "popular"
    else if (sortVal === "newest") sortParam = "newest"

    const queryParams: any = {
        page: Number(searchParams?.page) || 1,
        limit: 20,
        sort: sortParam,
        search: searchParams?.q as string,
        min_price: searchParams?.min_price ? Number(searchParams.min_price) : undefined,
        max_price: searchParams?.max_price ? Number(searchParams.max_price) : undefined,
        category: category // Use route param
    }

    const [cats, prods] = await Promise.all([
       productService.getAllCategories(),
       productService.getAllProducts(queryParams)
    ])
    categories = cats
    productsData = prods

    if (productsData.products) {
        productsData.products = productsData.products.map((p: any) => ({
            ...p,
            image: p.primary_image || p.image || '/placeholder.jpg',
            category: p.category_name || 'Uncategorized',
            badge: p.is_featured ? 'Featured' : null,
            reviews: p.review_count || 0,
            comparePrice: p.compare_price,
            inStock: p.in_stock,
            stockQuantity: p.stock_quantity,
            hasVariants: p.variant_count > 0,
            variants: p.variants || [],
            rating: Number(p.average_rating) || 0
        }))
    }

  } catch (error) {
    console.error("Failed to fetch data for category page", error)
  }

  return (
    <CategoryClient
      category={category}
      title={info.title}
      description={info.description}
      initialCategories={categories}
      initialProducts={productsData.products}
      initialTotal={productsData.total}
      initialPages={productsData.pages}
    />
  )
}
