import { Suspense } from "react"

import ShopClient from "./shop-client"
import { productService } from "@/lib/services/productService"



type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ShopPage({ searchParams }: Props) {
  let categories: any[] = []
  let productsData: any = { products: [], total: 0, page: 1, pages: 1 }

  try {
    // 1. Parse Sort Param
    const sortVal = searchParams.sort as string || "featured"
    let sortParam = "featured"
    if (sortVal === "price-low") sortParam = "price_asc"
    else if (sortVal === "price-high") sortParam = "price_desc"
    else if (sortVal === "rating") sortParam = "popular"
    else if (sortVal === "newest") sortParam = "newest"

    // 2. Prepare Query Params
    const queryParams: any = {
        page: Number(searchParams.page) || 1,
        limit: 20,
        sort: sortParam,
        search: searchParams.q as string,
        min_price: searchParams.min_price ? Number(searchParams.min_price) : undefined,
        max_price: searchParams.max_price ? Number(searchParams.max_price) : undefined,
        category: searchParams.category as string
    }

    // 3. Fetch Data in Parallel
    const [cats, prods] = await Promise.all([
       productService.getAllCategories(),
       productService.getAllProducts(queryParams)
    ])
    categories = cats
    productsData = prods

    // 4. Map Products (Match Client Transformation)
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
    console.error("Failed to fetch data for shop page", error)
  }

  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Shop - Swadeshika",
            description: "Browse our collection of authentic Indian products including Ghee, Spices, and more.",
            url: `${process.env.NEXT_PUBLIC_APP_URL || "https://swadeshika.in"}/shop`,
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: process.env.NEXT_PUBLIC_APP_URL || "https://swadeshika.in"
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Shop",
                  item: `${process.env.NEXT_PUBLIC_APP_URL || "https://swadeshika.in"}/shop`
                }
              ]
            }
          })
        }}
      />
      <ShopClient 
        initialCategories={categories}
        initialProducts={productsData.products}
        initialTotal={productsData.total}
        initialPages={productsData.pages}
      />
    </Suspense>

  )
}
