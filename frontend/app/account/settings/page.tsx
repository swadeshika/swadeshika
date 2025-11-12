import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AccountSidebar } from "@/components/account-sidebar"
import { AccountSettings } from "@/components/account-settings"
import { ShopHeader } from "@/components/shop-header"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <ShopHeader title="Account Settings" description="Update your profile, password and preferences" />

          <div className="grid lg:grid-cols-4 gap-8 mt-8">
            <aside className="lg:col-span-1">
              <AccountSidebar />
            </aside>

            <div className="lg:col-span-3">
              <AccountSettings />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
