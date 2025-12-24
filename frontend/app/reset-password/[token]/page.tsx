
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-[#F5F1E8] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ResetPasswordForm token={params.token} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
