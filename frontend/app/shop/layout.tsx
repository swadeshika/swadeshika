
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop All Products - Swadeshika",
  description: "Browse our complete collection of authentic Indian ghee, spices, dry fruits, and cold-pressed oils. Pure, organic, and traditionally crafted.",
  alternates: {
    canonical: "/shop",
  },
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
