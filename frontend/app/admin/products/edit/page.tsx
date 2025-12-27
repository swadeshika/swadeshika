import { AdminLayout } from "@/components/admin-layout"
import { AdminProductForm } from "@/components/admin-product-form"
import { productService } from "@/lib/services/productService"
import { notFound } from "next/navigation"

export default async function AdminEditProductPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const idStr = searchParams.id as string
  if (!idStr) {
      notFound()
  }

  const id = parseInt(idStr)
  let product
  try {
      product = await productService.getProduct(id)
  } catch (error) {
      notFound()
  }

  const initial = {
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    shortDescription: product.short_description || "",
    price: String(product.price),
    comparePrice: String(product.compare_price || ""),
    category: product.category_id ? String(product.category_id) : "",
    status: product.in_stock ? "active" : "draft", // Simplify mapping
    sku: product.sku,
    stock: String(product.stock_quantity),
    tags: product.tags?.join(", ") || "",
    metaTitle: product.meta_title || "",
    metaDescription: product.meta_description || "",
    publish: true, 
    related: "", // related logic not fully implemented yet
    weight: product.weight ? String(product.weight) : "",
    weightUnit: product.weight_unit || ""
    // dims...
  }

  const initialVariants = (product as any).variants?.map((v: any) => ({
    id: v.id,
    name: v.name, // Size/Name
    price: String(v.price), // Selling
    salePrice: String(v.compare_price || ""), // MRP
    sku: v.sku,
    stock: String(v.stock_quantity),
  })) || []

  // Feature mapping needs adjustment if features are strings
  const initialFeatures = product.features || []
  
  // Specs mapping
  const initialSpecs = product.specifications 
    ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) }))
    : []

  /**
   * CRITICAL FIX: Image Loading on Edit Page
   * =========================================
   * 
   * PROBLEM:
   * - Primary image was being included in gallery images
   * - This caused duplicate images to show
   * - User added 2 images but 3 were showing
   * - No proper separation between primary and gallery
   * 
   * SOLUTION:
   * - Find the primary image (is_primary = true)
   * - Filter it out from gallery images
   * - Only non-primary images go to gallery
   * 
   * WHY THIS MATTERS:
   * - Correct image count
   * - Proper preview display
   * - No duplicate images
   */
  const productImages = (product as any).images || [];
  const primaryImage = productImages.find((img: any) => img.is_primary);
  const galleryImages = productImages.filter((img: any) => !img.is_primary);

  return (
    <AdminLayout>
      <AdminProductForm
        mode="edit"
        productId={id}
        initial={initial}
        initialVariants={initialVariants}
        initialFeatures={initialFeatures}
        initialSpecs={initialSpecs}
        initialPrimaryImageUrl={primaryImage?.image_url || product.primary_image || null}
        initialGalleryUrls={galleryImages.map((img: any) => img.image_url)}
      />
    </AdminLayout>
  )
}
