import { ReactNode } from "react"
import { Button } from "./ui/button"
import { SiteHeader } from "./site-header"
import { SiteFooter } from "./site-footer"

interface PolicySection {
  title: string;
  icon: ReactNode;
  content: ReactNode;
}

interface PolicyPageProps {
  title: string;
  description: string;
  sections: PolicySection[];
  helpTitle?: string;
  helpDescription?: string;
  showTrackOrder?: boolean;
}

export function PolicyPage({
  title,
  description,
  sections,
  helpTitle = "Need Help?",
  helpDescription = "If you have any questions or need assistance, our customer service team is here to help.",
  showTrackOrder = true
}: PolicyPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <div className="bg-[#F5F1E8] py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#6B4423] mb-4">{title}</h1>
            <p className="text-[#8B6F47] max-w-3xl mx-auto">
              {description}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-[#E8DCC8] overflow-hidden">
                <div className="bg-[#F5F1E8] p-4 flex items-center gap-3 border-b border-[#E8DCC8]">
                  {section.icon}
                  <h2 className="text-xl font-semibold text-[#6B4423]">{section.title}</h2>
                </div>
                <div className="p-6 text-[#6B4423]">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-xl shadow-sm border border-[#E8DCC8] p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-[#6B4423] mb-4">{helpTitle}</h2>
            <p className="text-[#6B4423] mb-6">{helpDescription}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/contact" className="w-full sm:w-auto">
                <Button className="w-full bg-[#2D5F3F] hover:bg-[#234A32] text-white hover:text-white">
                  Contact Support
                </Button>
              </a>
              {showTrackOrder && (
                <a href="/track-order" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full border-[#E8DCC8] text-[#6B4423] hover:bg-[#F5F1E8] hover:text-[#6B4423]">
                    Track Your Order
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
