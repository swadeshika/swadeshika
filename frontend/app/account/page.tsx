/**
 * Account Dashboard Page
 *
 * Main account management page showing user profile overview.
 * Central hub for accessing all account-related features.
 *
 * Features:
 * - Account overview with key statistics
 * - Recent orders summary
 * - Quick access to account sections via sidebar
 * - Profile information display
 * - Loyalty points and rewards (future enhancement)
 *
 * Layout: Two-column layout with sidebar navigation
 * Structure: Sidebar (1/4 width) + Main content (3/4 width)
 */

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import { AccountOverview } from "@/components/account-overview"
import { ShopHeader } from "@/components/shop-header"

export default function AccountPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <ShopHeader title="My Account" description="Manage your orders, addresses, wishlist and settings" />

          <div className="grid lg:grid-cols-4 gap-8 mt-8">
            {/* Sidebar navigation for account sections */}
            <aside className="lg:col-span-1">
              <AccountSidebar />
            </aside>

            {/* Main content area showing account overview */}
            <div className="lg:col-span-3">
              <AccountOverview />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
