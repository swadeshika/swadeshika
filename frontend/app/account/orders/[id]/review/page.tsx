import OrderReviewContent from "@/components/order-review-content"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import { ShopHeader } from "@/components/shop-header"

export const metadata = {
  title: "Review Order - Swadeshika",
  description: "Share your feedback about the products in your order",
}

export default function OrderReviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <ShopHeader title="Write Reviews" description={`Order #${params.id}`} />
          <div className="grid lg:grid-cols-4 gap-8 mt-8">
            <aside className="lg:col-span-1">
              <AccountSidebar />
            </aside>
            <div className="lg:col-span-3">
              <OrderReviewContent orderId={params.id} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
