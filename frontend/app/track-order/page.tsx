import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import TrackOrderContent from "@/components/track-order-content"

export const metadata: Metadata = {
  title: "Track Order - Swadeshika",
  description: "Track your order status and delivery information",
}

export default function TrackOrderPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <TrackOrderContent />
      </main>
      <SiteFooter />
    </div>
  )
}
