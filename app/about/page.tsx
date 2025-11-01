import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ShopHeader } from "@/components/shop-header"

export const metadata = {
  title: "About Us - Swadeshika",
  description: "Learn about Swadeshika's mission, values, and story",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <ShopHeader title="About Swadeshika" description="Authentic, traditionally crafted foods from Indian farms and kitchens" />

          {/* Hero: image + stats */}
          <section className="mt-8 rounded-2xl overflow-hidden border-2 border-[#E8DCC8] bg-white">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <h2 className="text-3xl font-serif font-bold text-[#6B4423]">Rooted in Tradition. Crafted with Care.</h2>
                <p className="mt-3 text-[#8B6F47]">We partner directly with farmers and artisan producers across India to bring you pure, honest ingredients—no shortcuts, no compromises.</p>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-[#2D5F3F]">150+</p>
                    <p className="text-xs text-[#8B6F47]">Farmer partners</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#2D5F3F]">1M+</p>
                    <p className="text-xs text-[#8B6F47]">Orders delivered</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#2D5F3F]">4.8★</p>
                    <p className="text-xs text-[#8B6F47]">Avg. product rating</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img src="/about-hero.jpg" alt="Swadeshika farms and kitchens" className="w-full h-full object-cover min-h-[260px]" />
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="mt-8 grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
              <h3 className="text-xl font-semibold text-[#6B4423]">Our Mission</h3>
              <p className="mt-2 text-[#8B6F47]">To make traditional Indian foods accessible to every home while ensuring fair value to the hands that produce them.</p>
            </div>
            <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
              <h3 className="text-xl font-semibold text-[#6B4423]">Our Vision</h3>
              <p className="mt-2 text-[#8B6F47]">A world where purity, taste and sustainability go hand-in-hand—reviving culinary heritage for future generations.</p>
            </div>
          </section>

          {/* Founders */}
          <section className="mt-8 rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
            <h3 className="text-xl font-semibold text-[#6B4423] mb-4">Founders</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <img src="/founder-1.jpg" alt="Founder" className="h-20 w-20 rounded-xl object-cover bg-[#F5F1E8]" />
                <div>
                  <p className="font-semibold text-[#6B4423]">Aarav Sharma</p>
                  <p className="text-sm text-[#8B6F47]">Co-founder & CEO</p>
                  <p className="text-sm text-[#6B4423] mt-2">Food enthusiast on a mission to bring transparent, farm-origin foods to Indian homes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <img src="/founder-2.jpg" alt="Founder" className="h-20 w-20 rounded-xl object-cover bg-[#F5F1E8]" />
                <div>
                  <p className="font-semibold text-[#6B4423]">Mira Iyer</p>
                  <p className="text-sm text-[#8B6F47]">Co-founder & Head of Sourcing</p>
                  <p className="text-sm text-[#6B4423] mt-2">Works closely with farmer communities to ensure purity, fair practices and consistency.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Values Grid */}
          <section className="mt-8">
            <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
              <h3 className="text-xl font-semibold text-[#6B4423] mb-4">Our Values</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { t: "Purity First", d: "No additives. No shortcuts. Just honest ingredients." },
                  { t: "Fair to Farmers", d: "Direct partnerships and fair pricing for producers." },
                  { t: "Sustainable", d: "Thoughtful sourcing and eco-friendly packaging." },
                  { t: "Customer-First", d: "Quality you can trust, service you can depend on." },
                ].map((v, i) => (
                  <div key={i} className="rounded-xl border-2 border-[#E8DCC8] p-4">
                    <p className="font-medium text-[#6B4423]">{v.t}</p>
                    <p className="text-sm text-[#8B6F47] mt-1">{v.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Story Timeline */}
          <section className="mt-8 rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
            <h3 className="text-xl font-semibold text-[#6B4423] mb-4">Our Journey</h3>
            <div className="space-y-5">
              {[
                { y: "2019", e: "Started as a small kitchen initiative" },
                { y: "2020", e: "Partnered with first 20 farmer groups" },
                { y: "2022", e: "Launched nationwide delivery" },
                { y: "2024", e: "Crossed 1 million orders and expanded product lines" },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-[#2D5F3F]" />
                  <p className="text-sm text-[#6B4423]"><span className="font-semibold text-[#2D5F3F] mr-2">{s.y}</span>{s.e}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Impact Stats CTA */}
          <section className="mt-8 rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-semibold text-[#6B4423]">Impact that matters</h3>
                <p className="text-[#8B6F47] mt-2">Every purchase supports sustainable livelihoods and preserves time-honored food traditions.</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#2D5F3F]">95%</p>
                  <p className="text-xs text-[#8B6F47]">Repeat customers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2D5F3F]">500+</p>
                  <p className="text-xs text-[#8B6F47]">Artisan products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2D5F3F]">20+</p>
                  <p className="text-xs text-[#8B6F47]">States sourced</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-8">
            <div className="rounded-2xl border-2 border-[#E8DCC8] bg-[#2D5F3F] text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Taste the difference of honest food</h3>
                <p className="text-white/80 text-sm mt-1">Explore our bestsellers curated from farms and artisanal kitchens.</p>
              </div>
              <a href="/shop" className="inline-flex h-11 px-5 items-center justify-center rounded-lg bg-white text-[#2D5F3F] font-medium hover:bg-white/90">Shop Now</a>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
