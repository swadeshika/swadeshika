import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { WishlistContent } from "@/components/wishlist-content"
import { ShopHeader } from "@/components/shop-header"
import { AccountSidebar } from "@/components/account-sidebar"

/**
 * Wishlist Page
 *
 * Displays the user's saved/favorited products for future purchase.
 * Allows users to keep track of products they're interested in.
 *
 * Features:
 * - View all wishlisted products
 * - Quick add to cart from wishlist
 * - Remove items from wishlist
 * - Share wishlist with others
 *
 * Layout: Full-page with header and footer
 */

export default function WishlistPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <ShopHeader title="My Wishlist" description="Your saved products, all in one place" />
          <div className="grid lg:grid-cols-4 gap-8 mt-8">
            <aside className="lg:col-span-1">
              <AccountSidebar />
            </aside>
            <div className="lg:col-span-3">
              <WishlistContent />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
