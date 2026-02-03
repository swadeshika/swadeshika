import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ProductDetailClientOptimized } from "@/components/product-detail-client-optimized"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { productService } from "@/lib/services/productService"
import { Suspense } from "react"

/**
 * Product Detail Page - Individual Product View with Slug-based Routing
 *
 * Route: /products/[slug] (e.g., /products/pure-desi-cow-ghee)
 */

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await productService.getProduct(params.slug)

    return {
      title: product.meta_title || `${product.name} - Swadeshika`,
      description: product.meta_description || product.short_description || product.description?.substring(0, 160),
      keywords: (product as any).tags?.join(", "), // Assuming backend returns tags
      openGraph: {
        title: product.name,
        description: product.short_description || product.description?.substring(0, 160),
        images: [
          {
            url: (product as any).images?.[0]?.image_url || "/placeholder.jpg",
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
        description: product.short_description,
        images: [(product as any).images?.[0]?.image_url || "/placeholder.jpg"],
      },
      alternates: {
        canonical: `/products/${product.slug}`,
      },
    }
  } catch (error) {
    return {
      title: "Product Not Found - Swadeshika",
      description: "The requested product could not be found.",
    }
  }
}

/**
 * Generate static params for all products
 */
export async function generateStaticParams() {
  try {
    const response = await productService.getAllProducts({ limit: 100 })
    return response.products.map((product) => ({
      slug: product.slug,
    }))
  } catch (error) {
    console.warn("Failed to generate static params from API", error)
    return []
  }
}

// Force revalidation every 10 seconds to ensure fresh review counts
export const revalidate = 10

/**
 * Product Detail Page Component
 */
export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product
  let related: any[] = []
  let reviews: any[] = []
  let applicableCoupons: any[] = []
  
  try {
    const apiProduct = await productService.getProduct(params.slug)
    
    // Map API response to Frontend Product Interface
    product = {
      ...apiProduct,
      description: apiProduct.description || "",
      shortDescription: apiProduct.short_description || "",
      metaTitle: apiProduct.meta_title,
      metaDescription: apiProduct.meta_description,
      comparePrice: apiProduct.compare_price,
      inStock: apiProduct.in_stock,
      stockQuantity: apiProduct.stock_quantity,
      reviewCount: apiProduct.review_count,
      weight: apiProduct.weight,
      length: apiProduct.length,
      width: apiProduct.width,
      height: apiProduct.height,
      weightUnit: apiProduct.weight_unit || 'kg',
      category: (apiProduct as any).category_name || apiProduct.category_id?.toString() || 'Uncategorized',
      categorySlug: (apiProduct as any).category_slug || (apiProduct as any).category_name?.toLowerCase().replace(/\s+/g, '-') || '#',
      features: apiProduct.features || [],
      specifications: apiProduct.specifications || {},
      tags: apiProduct.tags || [],
      images: (apiProduct as any).images?.map((img: any) => img.image_url) || [],
      variants: (apiProduct as any).variants?.map((v: any) => ({
        ...v,
        quantity: v.stock_quantity,
        comparePrice: v.compare_price,
        attributes: typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes,
        isActive: true
      })),
      rating: Number(apiProduct.average_rating) || 0
    }
    
    // Fetch related products
    // Priority: Manual Related Products > Same Category
    let relatedData;
    
    if (apiProduct.related_products && apiProduct.related_products.length > 0) {
       // Fetch specific related products
       relatedData = await productService.getAllProducts({
         ids: apiProduct.related_products,
         limit: 4 // Limit to 4 just in case
       });
       // Filter out self just in case (though unlikely to be in list unless user added self)
       related = relatedData.products
    } else if (apiProduct.category_id) {
       // Fallback to Category based
       relatedData = await productService.getAllProducts({ 
         category_id: apiProduct.category_id, 
         limit: 4 
       });
       related = relatedData.products
        .filter(p => !apiProduct || p.id !== apiProduct.id)
    }

    if (relatedData) {
        related = related
            .slice(0, 4)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              comparePrice: p.compare_price,
              image: p.primary_image || p.image || '/placeholder.jpg',
              badge: p.is_featured ? 'Featured' : undefined,
              category: p.category_name || 'Uncategorized',
              rating: p.average_rating || 0,
              reviews: p.review_count || 0,
              inStock: p.in_stock === undefined ? true : !!p.in_stock,
              stockQuantity: p.stock_quantity || 0,
            }))
    }
    
    // Fetch available coupons
    try {
      const { couponService } = await import("@/lib/couponService");
      const allCoupons = await couponService.getAvailableCoupons();
      
      // Filter coupons relevant to this product
      applicableCoupons = allCoupons.filter((coupon: any) => {
        // 1. Coupon specific to this product
        if (coupon.product_ids && coupon.product_ids.length > 0) {
          return coupon.product_ids.includes(apiProduct.id);
        }
        
        // 2. Coupon specific to this category
        if (coupon.category_ids && coupon.category_ids.length > 0) {
          return coupon.category_ids.includes(apiProduct.category_id);
        }
        
        // 3. Global coupons (no specific restrictions)
        // If NO product_ids AND NO category_ids are set, it's a global coupon
        const hasProductRestriction = coupon.product_ids && coupon.product_ids.length > 0;
        const hasCategoryRestriction = coupon.category_ids && coupon.category_ids.length > 0;
        
        return !hasProductRestriction && !hasCategoryRestriction;
      });
    } catch (e) {
      console.warn("Failed to fetch coupons for product page", e);
    }
    
  } catch (error) {
    notFound()
  }

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
            relatedProducts={related} 
            reviews={reviews}
            availableCoupons={applicableCoupons}
          />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}