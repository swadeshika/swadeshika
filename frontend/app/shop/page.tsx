"use client"

import { Suspense } from "react"
import ShopClient from "./shop-client"

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
       <ShopClient />
    </Suspense>
  )
}
