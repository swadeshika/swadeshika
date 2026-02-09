import { Suspense } from "react"

import ShopClient from "./shop-client"
import { productService } from "@/lib/services/productService"



export default async function ShopPage() {
  let categories: any[] = []

  try {
    categories = await productService.getAllCategories()
  } catch (error) {
    console.error("Failed to fetch categories for shop page", error)
  }

  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopClient initialCategories={categories} />
    </Suspense>
  )
}
