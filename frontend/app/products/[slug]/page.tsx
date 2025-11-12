import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ProductDetailClientOptimized } from "@/components/product-detail-client-optimized"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { products, getProductReviews, relatedProducts, getProductBySlug } from "@/lib/products-data"
import { Suspense } from "react"

/**
 * Product Detail Page - Individual Product View with Slug-based Routing
 *
 * Dynamic route page that displays detailed information about a single product
 * using SEO-friendly URLs (e.g., /products/pure-desi-cow-ghee).
 *
 * Features:
 * - SEO-friendly URLs with product names
 * - Product image gallery with lazy loading
 * - Detailed product information and pricing
 * - Add to cart functionality with variants
 * - Customer reviews section with lazy loading
 * - Related products recommendations
 * - Enhanced SEO metadata generation
 * - Mobile-optimized with touch gestures
 *
 * Route: /products/[slug] (e.g., /products/pure-desi-cow-ghee)
 *
 * Technical Notes:
 * - Uses Next.js generateMetadata for dynamic SEO
 * - Returns 404 if product not found
 * - Lazy loading for better performance
 * - Optimized for search engines and social sharing
 */

/**
 * Generate dynamic metadata for SEO
 * Creates page title and description based on product data
 * Improves search engine visibility and social media sharing
 */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = getProductBySlug(params.slug)

  if (!product) {
    return {
      title: "Product Not Found - Swadeshika",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: product.metaTitle || `${product.name} - Swadeshika`,
    description: product.metaDescription || product.shortDescription,
    keywords: product.tags?.join(", "),
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: "website",
      url: `/products/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription,
      images: [product.images[0]],
    },
    alternates: {
      canonical: `/products/${product.slug}`,
    },
  }
}

/**
 * Generate static params for all products
 * Pre-generates static pages for better performance
 */
export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

/**
 * Product Detail Page Component
 * Fetches product data by slug and renders the detail view
 * Returns 404 page if product doesn't exist
 */
export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)

  // Return 404 if product not found
  // Next.js will render the not-found.tsx page
  if (!product) {
    notFound()
  }

  const reviews = getProductReviews(product.id)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={
          <div className="bg-background font-sans">
            <div className="border-b bg-[#F5F1E8]">
              <div className="container mx-auto px-4 py-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
            <section className="py-12 lg:py-16">
              <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
                    <div className="grid grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        }>
          <ProductDetailClientOptimized 
            product={product} 
            relatedProducts={relatedProducts} 
            reviews={reviews} 
          />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}