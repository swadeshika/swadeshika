/**
 * Shop Header Component
 *
 * Displays the page title and description at the top of shop/category pages.
 * Provides context to users about what products they're viewing.
 *
 * Usage:
 * <ShopHeader title="All Products" description="Browse our collection" />
 *
 * Props:
 * @param title - Main heading text (e.g., "Pure Ghee", "All Products")
 * @param description - Subtitle text providing additional context
 */

interface ShopHeaderProps {
  title: string
  description: string
}

export function ShopHeader({ title, description }: ShopHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-[#E8DCC8] bg-[#F5F1E8] p-8 md:p-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[#FF7E00]/10 blur-3xl" />
      </div>

      <div className="relative">
        <h1 className="font-sans text-3xl md:text-5xl font-extrabold tracking-tight text-[#6B4423]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base md:text-lg text-[#8B6F47]">
          {description}
        </p>
      </div>
    </section>
  )
}
