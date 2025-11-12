import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { HeroSlider } from "@/components/hero-slider"
import { Star, Truck, Shield, Leaf, Award } from "lucide-react"

/**
 * Homepage Component for Swadeshika E-commerce Platform
 */

const quickLinks = [
  { name: "Festival Specials", icon: "🪔", href: "/shop/festival" },
  { name: "Membership Deals", icon: "🎁", href: "/membership" },
  { name: "New Launches", icon: "✨", href: "/shop/new" },
  { name: "Under ₹499", icon: "💰", href: "/shop/under-499" },
  { name: "Under ₹999", icon: "🛍️", href: "/shop/under-999" },
  { name: "All Products", icon: "📦", href: "/shop" },
]

const featuredProducts = [
  {
    id: 1,
    name: "Pure Desi Cow Ghee",
    slug: "pure-desi-cow-ghee",
    price: 850,
    memberPrice: 799,
    comparePrice: 1000,
    image: "/golden-ghee-in-glass-jar.jpg",
    badge: "Best Seller",
    badgeColor: "bg-emerald-600",
    category: "Ghee",
    rating: 4.9,
    reviews: 234,
    variants: ["500g", "1kg", "2kg"],
  },
  {
    id: 2,
    name: "Organic Turmeric Powder",
    slug: "organic-turmeric-powder",
    price: 180,
    memberPrice: 165,
    comparePrice: 220,
    image: "/turmeric-powder-in-bowl.jpg",
    badge: "6% GST OFF",
    badgeColor: "bg-yellow-600",
    category: "Spices",
    rating: 4.8,
    reviews: 156,
    variants: ["100g", "250g", "500g"],
  },
  {
    id: 3,
    name: "Premium Kashmiri Almonds",
    slug: "premium-kashmiri-almonds",
    price: 650,
    memberPrice: 599,
    image: "/kashmiri-almonds.jpg",
    badge: "Trending",
    badgeColor: "bg-orange-600",
    category: "Dry Fruits",
    rating: 4.9,
    reviews: 189,
    variants: ["250g", "500g", "1kg"],
  },
  {
    id: 4,
    name: "Cold Pressed Coconut Oil",
    slug: "cold-pressed-coconut-oil",
    price: 320,
    memberPrice: 299,
    image: "/coconut-oil-in-glass-bottle.jpg",
    badge: "Hot Deals",
    badgeColor: "bg-pink-600",
    category: "Oils",
    rating: 4.7,
    reviews: 98,
    variants: ["500ml", "1L"],
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroSlider />

        <section className="py-6 bg-[#F5F1E8] border-y-2 border-[#E8DCC8]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-8 lg:gap-16 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-[#E8DCC8] flex items-center justify-center">
                  <Truck className="h-6 w-6 text-[#2D5F3F]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#6B4423]">Free Shipping</p>
                  <p className="text-xs text-[#8B6F47]">On orders above ₹999</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-[#E8DCC8] flex items-center justify-center">
                  <Shield className="h-6 w-6 text-[#2D5F3F]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#6B4423]">100% Authentic</p>
                  <p className="text-xs text-[#8B6F47]">Quality Guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-[#E8DCC8] flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-[#2D5F3F]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#6B4423]">100% Organic</p>
                  <p className="text-xs text-[#8B6F47]">Farm Fresh Products</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-[#E8DCC8] flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#2D5F3F]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#6B4423]">Trusted by 10K+</p>
                  <p className="text-xs text-[#8B6F47]">Happy Customers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-[#F5F1E8] border-y-2 border-[#E8DCC8]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-6 lg:gap-12 flex-wrap">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex flex-col items-center gap-3 group transition-transform hover:scale-105 cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-md group-hover:shadow-lg transition-all border-2 border-[#E8DCC8] bg-white">
                    {link.icon}
                  </div>
                  <span className="text-sm font-semibold text-center max-w-[100px] leading-tight text-[#6B4423] group-hover:text-[#2D5F3F] transition-colors">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-2 md:grid-rows-2 gap-6 h-auto md:h-[600px]">

              {/* Big banner */}
              <Link
                href="/shop/festival"
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all col-span-2 md:col-span-1 md:row-span-2 h-[260px] sm:h-80 md:h-full cursor-pointer"
              >
                <div className="absolute inset-0">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ex8VxC2U7ANMfELBQuhxanzrVb8gEz.png"
                    alt="Festival Special Offers"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* Text container: responsive max-width so text wraps on small screens */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
                  <div className="max-w-[92%] sm:max-w-[70%] md:max-w-[520px] lg:max-w-[640px]">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-3 text-balance leading-tight whitespace-normal break-words">
                      Festival Special Offers
                    </h2>

                    <p className="text-xs sm:text-sm md:text-xl text-white/95 mb-6 font-medium whitespace-normal break-words">
                      Pure Desi Ghee at Best Prices
                    </p>

                    <Button
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-white font-semibold px-4 sm:px-5 md:px-6 h-9 sm:h-10 rounded-lg shadow-lg whitespace-nowrap text-[10px] sm:text-xs md:text-sm leading-none cursor-pointer"
                    >
                      ORDER NOW
                    </Button>

                  </div>
                </div>
              </Link>

              {/* Small banner 1 */}
              <Link
                href="/shop/a2-ghee"
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-56 md:h-auto min-h-[220px] cursor-pointer"
              >
                <div className="absolute inset-0">
                  <img
                    src="/hero-slide-2-spices.jpg"
                    alt="A2 Ghee from Free-Grazing Gir Cows"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                  <div className="max-w-[92%] sm:max-w-[85%] md:max-w-[420px]">
                    <h3 className="text-sm sm:text-xl md:text-3xl font-bold mb-2 text-balance leading-tight whitespace-normal break-words">
                      A2 Ghee from Free-Grazing Gir Cows
                    </h3>
                    <p className="text-xs sm:text-sm md:text-lg text-white/95 mb-4 font-medium whitespace-normal break-words cursor-pointer">
                      Pure & Authentic
                    </p>
                    <Button
                      size="default"
                      className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 sm:px-5 md:px-6 h-8 sm:h-9 rounded-lg whitespace-nowrap text-[10px] sm:text-xs md:text-sm leading-none cursor-pointer"
                    >
                      Shop Now
                    </Button>

                  </div>
                </div>
              </Link>

              {/* Small banner 2 */}
              <Link
                href="/about/farmers"
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-56 md:h-auto min-h-[220px] bg-gradient-to-br from-amber-800 to-amber-950 cursor-pointer"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-[url('/pattern-leaves.jpg')] opacity-10 pointer-events-none transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="relative h-full flex flex-col justify-center p-4 sm:p-6 md:p-6 text-white">
                  <div className="inline-block mb-3">
                    <span
                      className="bg-accent text-white font-bold px-3 py-1.5 rounded-md uppercase tracking-wide whitespace-nowrap leading-none inline-flex items-center"
                      // using Tailwind arbitrary value for responsive clamping:
                      // font size will clamp between 10px and 13px, scaling with viewport
                      // (adjust numbers if you want it even smaller/larger)
                      // If your Tailwind config disallows arbitrary values, you can replace
                      // text-[clamp(...)] with text-xs / sm:text-sm etc.
                      style={{ fontSize: "clamp(10px, 2.2vw, 13px)" }}
                    >
                      BREAKING NEWS
                    </span>
                  </div>

                  <div className="max-w-[92%] sm:max-w-[80%] md:max-w-[420px]">
                    <h3 className="text-sm sm:text-xl md:text-3xl font-bold mb-4 text-balance leading-tight whitespace-normal break-words">
                      Farmers to get more back to Your Roots
                    </h3>
                    <Button
                      size="default"
                      variant="outline"
                      className="bg-white/10 border-white/40 text-white hover:bg-white hover:text-foreground font-semibold px-4 sm:px-5 md:px-6 h-8 sm:h-9 rounded-lg backdrop-blur-sm w-fit whitespace-nowrap text-[10px] sm:text-xs md:text-sm leading-none cursor-pointer"
                    >
                      ORDER NOW
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#F5F1E8]">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-10 gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
                <div className="mb-2 md:mb-0">
                  <span className="inline-block bg-[#FF7E00] text-white text-sm font-bold px-3 py-2 rounded-md uppercase tracking-wide">
                    Most Loved
                  </span>
                </div>

                <div>
                  <h2 className="text-4xl sm:text-4xl md:text-4xl font-bold text-[#6B4423] mb-2">
                    Customer Favorites
                  </h2>
                  <p className="text-base sm:text-lg text-[#8B6F47]">
                    Bestsellers picked by our community
                  </p>
                </div>
              </div>

              <div className="hidden md:block">
                <Button
                  variant="default"
                  size="lg"
                  asChild
                  className="rounded-full shadow-md hover:shadow-lg transition-shadow bg-[#2D5F3F] hover:bg-[#234A32] text-white cursor-pointer"
                >
                  <Link href="/shop">View All Products</Link>
                </Button>
              </div>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center md:justify-items-stretch">
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-full max-w-sm md:max-w-none">
                  <ProductCard {...product} sizes={product.variants} />
                </div>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-10 text-center md:hidden">
              <Button
                variant="default"
                size="lg"
                asChild
                className="rounded-full shadow-md text-lg px-8 py-6 cursor-pointer"
              >
                <Link href="/shop">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#F5F1E8] border-y-2 border-[#E8DCC8]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#6B4423] mb-3">What Our Customers Say</h2>
              <p className="text-lg text-[#8B6F47]">Trusted by thousands of happy families</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Priya Sharma",
                  location: "Mumbai",
                  rating: 5,
                  text: "The ghee quality is exceptional! You can taste the purity in every spoonful. My family loves it.",
                },
                {
                  name: "Rajesh Kumar",
                  location: "Delhi",
                  rating: 5,
                  text: "Best organic spices I've ever used. The aroma is incredible and they're completely authentic.",
                },
                {
                  name: "Anita Patel",
                  location: "Bangalore",
                  rating: 5,
                  text: "Fast delivery and excellent packaging. The dry fruits are fresh and of premium quality.",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border-2 border-[#E8DCC8] hover:shadow-lg transition-shadow">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#FF7E00] text-[#FF7E00]" />
                    ))}
                  </div>
                  <p className="mb-4 leading-relaxed text-[#6B4423]">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2D5F3F]/10 flex items-center justify-center font-semibold text-[#2D5F3F]">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#6B4423]">{testimonial.name}</p>
                      <p className="text-xs text-[#8B6F47]">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#2D5F3F] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Experience Authentic Indian Flavors</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto text-pretty">
              Join thousands of happy customers who trust Swadeshika for pure, organic products
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="px-8 py-3 text-base h-auto shadow-lg hover:shadow-xl rounded-full bg-[#FF7E00] hover:bg-[#E67300] text-white cursor-pointer"
              >
                <Link href="/shop">Start Shopping</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="px-8 py-3 text-base h-auto bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-sm rounded-full cursor-pointer"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
