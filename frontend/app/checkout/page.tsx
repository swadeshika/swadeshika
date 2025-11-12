import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CheckoutForm } from "@/components/checkout-form"
import { ShopHeader } from "@/components/shop-header"

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <ShopHeader title="Checkout" description="Secure payment and fast delivery guaranteed" />
          <div className="mt-8">
            <CheckoutForm />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
