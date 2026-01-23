import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ShopHeader } from "@/components/shop-header"

export const metadata = {
  title: "About Us - Swadeshika",
  description: "Learn about Swadeshika's mission, values, and story ",
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
                <h2 className="text-3xl font-serif font-bold text-[#6B4423]">The SwadeshiKa Mission</h2>
                <div className="mt-3 text-[#8B6F47] space-y-4">
                  <p>
                    <strong>*SwadeshiKa's*</strong> mission is to ensure that every product born from the soil and toil of our villages becomes not just a brand, but a household essential and a part of every plate.
                  </p>
                  <p className="font-medium italic">"Made in Village - Made for Nation"</p>
                </div>
              </div>
              <div className="relative">
                <img src="/images/about/swadeshika.jpeg" alt="Swadeshika farms and kitchens" className="w-full h-full object-cover min-h-[260px]" />
              </div>
            </div>
          </section>

          {/* Mission Pillars */}
          <section className="mt-8">
             <div className="mb-6">
                <h3 className="text-2xl font-serif font-bold text-[#6B4423]">Our Mission Pillars:</h3>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
                  <h4 className="text-lg font-bold text-[#2D5F3F] mb-2">1. Rural Development & Self-Reliance</h4>
                  <ul className="list-disc pl-5 text-[#8B6F47] text-sm space-y-1">
                    <li>Providing fair markets and value for food & household products made in villages.</li>
                    <li>Empowering rural youth, farmers, and women towards employment and self-reliance.</li>
                  </ul>
                </div>
                 <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
                  <h4 className="text-lg font-bold text-[#2D5F3F] mb-2">2. Quality & Purity</h4>
                  <ul className="list-disc pl-5 text-[#8B6F47] text-sm space-y-1">
                    <li>Delivering products to consumers without adulteration and with complete tradition.</li>
                    <li>Adopting modern packaging and quality standards while maintaining authentic taste.</li>
                  </ul>
                </div>
                 <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
                  <h4 className="text-lg font-bold text-[#2D5F3F] mb-2">3. Promoting Swadeshi</h4>
                  <ul className="list-disc pl-5 text-[#8B6F47] text-sm space-y-1">
                    <li>Assuring every customer that SwadeshiKa products are "Made in Village - Made for Nation".</li>
                    <li>Giving identity and independence to indigenous and local products.</li>
                  </ul>
                </div>
                 <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6">
                  <h4 className="text-lg font-bold text-[#2D5F3F] mb-2">4. Customer Trust & Satisfaction</h4>
                  <ul className="list-disc pl-5 text-[#8B6F47] text-sm space-y-1">
                    <li>Delivering natural, health-promoting, and trustworthy items to every home.</li>
                    <li>Assuring customers that "What comes from the village is the purest."</li>
                  </ul>
                </div>
                 <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6 md:col-span-2 lg:col-span-1">
                  <h4 className="text-lg font-bold text-[#2D5F3F] mb-2">5. Local to Global</h4>
                  <ul className="list-disc pl-5 text-[#8B6F47] text-sm space-y-1">
                    <li>Starting from villages, but aiming for national and international markets.</li>
                    <li>Taking India's traditional treasures to the world and strengthening "Brand India".</li>
                  </ul>
                </div>
             </div>
          </section>

          {/* Inspiration / Founders */}
          <section className="mt-12 rounded-2xl border-2 border-[#E8DCC8] bg-[#F9F5F0] overflow-hidden">
            <div className="p-8 lg:p-10">
               <h3 className="text-2xl font-serif font-bold text-[#6B4423] mb-6 text-center">Our Inspiration – The Story of SwadeshiKa</h3>
               
               <p className="text-[#8B6F47] text-center max-w-3xl mx-auto mb-10">
                 Inspired by the <strong>Swadeshi Swavalamban Bharat Abhiyan</strong> and <strong>Swavalamban Kendra Jodhpur</strong>, SwadeshiKa was founded by two empowered women – <strong>Priyanka Rajpurohit</strong> and <strong>Seema Bishnoi</strong>.
                 Their shared vision was to bring India's tradition, taste, art, and swadeshi products to every home with purity, self-reliance, and pride.
               </p>

               <div className="grid md:grid-cols-2 gap-10">
                 <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-[#E8DCC8]">
                    <div className="flex items-center gap-4 mb-2">
                       <img src="/images/team/priyanka.jpeg" alt="Priyanka Rajpurohit" className="h-20 w-20 rounded-full object-cover border-2 border-[#2D5F3F]" /> 
                       <h4 className="text-xl font-bold text-[#2D5F3F]">Priyanka Rajpurohit</h4>
                    </div>
                    <p className="text-[#6B4423] text-sm leading-relaxed">
                      Priyanka's dream was that the hard work of our villages should not be limited to industries but should reach every Indian family directly and transparently. SwadeshiKa was started so that people adopt not just a product, but a lifestyle and culture.
                    </p>
                 </div>

                 <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-[#E8DCC8]">
                    <div className="flex items-center gap-4 mb-2">
                       <img src="/images/team/seema.jpeg" alt="Seema Bishnoi" className="h-20 w-20 rounded-full object-cover border-2 border-[#2D5F3F]" /> 
                       <h4 className="text-xl font-bold text-[#2D5F3F]">Seema Bishnoi</h4>
                    </div>
                    <p className="text-[#6B4423] text-sm leading-relaxed">
                      With 15 years of experience abroad, Seema realized the deep connection people have with their country's products and culture. She felt the need to strengthen our roots. "Wherever we are, our indigenous strength is our true natural wealth."
                    </p>
                 </div>
               </div>

               <div className="mt-8 text-center max-w-4xl mx-auto space-y-4">
                 <p className="text-[#6B4423] italic font-medium">
                   SwadeshiKa is not just a product; it is a platform for employment, independence, and rural self-reliance.
                 </p>
                 <p className="text-[#8B6F47]">
                   It gives women, artisans, and rural producers the opportunity to connect their skills and products to the market. Every store and every sale becomes a symbol of economic freedom and self-respect.
                 </p>
                 <h4 className="text-xl font-bold text-[#2D5F3F] mt-4">"I am Swadeshi, I am SwadeshiKa."</h4>
               </div>
            </div>
          </section>

          {/* Restoration of Tradition */}
          <section className="mt-12 mb-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-3xl font-serif font-bold text-[#6B4423] mb-6">SwadeshiKa – Restoring Tradition</h3>
                <div className="space-y-4 text-[#6B4423]">
                  <p>
                    SwadeshiKa's objective is not merely to sell products, but to revive the Indian tradition and culture that has gifted us health, balance, and self-reliance for centuries.
                  </p>
                  <p>
                    We believe that <strong>Desi Cow Ghee, Buttermilk, Wood-Pressed Oils, Stone-Ground Flour, and Hand-Pounded Spices</strong> are not just food, but a lifestyle and part of our Ayurvedic wisdom.
                  </p>
                  <p>
                    In a time when chemicals and adulteration have weakened our diet and health, SwadeshiKa pledges to restore these ancient methods and return purity and trust to every home.
                  </p>
                  <div className="bg-[#E8F5E9] p-4 rounded-lg border-l-4 border-[#2D5F3F] mt-4">
                    <p className="italic text-[#2D5F3F]">
                      "From Ancient Tradition to Modern Health – That is the SwadeshiKa Way."
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-2xl bg-[#F9F5F0] p-6 border border-[#E8DCC8]">
                   <h4 className="font-bold text-[#2D5F3F] mb-2">Our Belief</h4>
                   <p className="text-[#8B6F47] text-sm">
                     We believe that the path of Swadeshi is the path to a Self-Reliant India. With this spirit, SwadeshiKa provides not only pure food but also encourages women's empowerment and rural employment.
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-xl text-center border border-[#E8DCC8] shadow-sm">
                      <span className="block text-2xl font-bold text-[#2D5F3F]">100%</span>
                      <span className="text-xs text-[#8B6F47]">Natural & Chemical-Free</span>
                   </div>
                   <div className="bg-white p-4 rounded-xl text-center border border-[#E8DCC8] shadow-sm">
                      <span className="block text-2xl font-bold text-[#2D5F3F]">Pure</span>
                      <span className="text-xs text-[#8B6F47]">Hand-Pounded Spices</span>
                   </div>
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
              <a href="/shop" className="inline-flex h-11 px-5 items-center justify-center rounded-lg bg-white text-[#2D5F3F] font-medium hover:bg-white/90 cursor-pointer">Shop Now</a>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
