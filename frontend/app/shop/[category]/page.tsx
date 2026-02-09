
import { Metadata } from "next"
import CategoryClient from "./category-client"
import { productService } from "@/lib/services/productService"



type Props = {
  params: { category: string }
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categorySlug = decodeURIComponent(params.category)

  // Fetch categories to get title and description dynamically
  const categories = await productService.getAllCategories() || []
  const categoryData = categories.find((c: any) => c.slug === categorySlug)

  const title = categoryData?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ')
  const description = categoryData?.description || `Shop authentic ${categorySlug.replace(/-/g, ' ')} from Swadeshika`

  return {
    title: `${title} - Swadeshika`,
    description: description,
    openGraph: {
      title: `${title} - Swadeshika`,
      description: description,
    },
    alternates: {
      canonical: `/shop/${categorySlug}`,
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props & { searchParams: { [key: string]: string | string[] | undefined } }) {
  const categorySlug = decodeURIComponent(params.category)

  let categories: any[] = []
  let productsData: any = { products: [], total: 0, page: 1, pages: 1 }
  let currentCategory: any = null

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
      category: categorySlug // Use route param as slug
    }

    const [cats, prods] = await Promise.all([
      productService.getAllCategories(),
      productService.getAllProducts(queryParams)
    ])
    categories = cats || []
    productsData = prods

    // Find current category details
    currentCategory = categories.find((c: any) => c.slug === categorySlug)

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

  const title = currentCategory?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ')
  const description = currentCategory?.description || `Browse our collection of ${categorySlug.replace(/-/g, ' ')}`

  return (
    <CategoryClient
      category={categorySlug}
      title={title}
      description={description}
      initialCategories={categories}
      initialProducts={productsData.products}
      initialTotal={productsData.total}
      initialPages={productsData.pages}
    />
  )
}
