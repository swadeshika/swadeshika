/**
 * Shopping Cart Page
 *
 * Displays the user's shopping cart with all added items.
 * Users can review items, adjust quantities, and proceed to checkout.
 *
 * Features:
 * - View all cart items with images and details
 * - Update item quantities or remove items
 * - See real-time cart total and savings
 * - Apply coupon codes for discounts
 * - Proceed to secure checkout
 *
 * Layout: Full-page with header and footer
 */

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartContent } from "@/components/cart-content"
import { ShopHeader } from "@/components/shop-header"

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <ShopHeader title="Shopping Cart" description="Review your items and proceed to checkout" />
          <div className="mt-8">
            <CartContent />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
