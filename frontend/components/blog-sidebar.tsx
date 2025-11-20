import Image from "next/image"
import Link from "next/link"

type SidebarPost = {
  id: number | string
  slug: string
  title: string
  date: string
  readTime?: string
  image: string
}

export function BlogSidebar({
  recentPosts,
  categories,
}: {
  recentPosts: SidebarPost[]
  categories: string[]
}) {
  return (
    <aside className="lg:col-span-4">
      <div className="lg:sticky lg:top-28 space-y-6">
        {/* CTA Card */}
        <div className="rounded-2xl border border-[#E8DCC8] bg-linear-to-br from-[#F9F5F0] to-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#2D5F3F] mb-2">Enjoying this article?</h3>
          <p className="text-[#6B4423] mb-4">Get wellness tips and new posts straight to your inbox.</p>
          <Link
            href="/subscribe"
            className="inline-flex items-center justify-center rounded-lg bg-[#6B4423] px-4 py-2 text-white hover:bg-[#5A3A1F] transition-colors"
          >
            Subscribe
          </Link>
        </div>

        {/* Recent Posts */}
        <div className="rounded-2xl border border-[#E8DCC8] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#2D5F3F] mb-4">Recent Posts</h3>
          <ul className="space-y-4">
            {recentPosts.map((rp) => (
              <li key={rp.id} className="flex items-center gap-3">
                <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-[#F5F1E8] shrink-0">
                  <Image src={rp.image} alt={rp.title} fill className="object-cover" sizes="80px" />
                </div>
                <div className="min-w-0">
                  <Link href={`/blog/${rp.slug}`} className="block text-sm font-medium text-[#2D5F3F] hover:text-[#1E4A2F] line-clamp-2">
                    {rp.title}
                  </Link>
                  <div className="text-xs text-[#8B6F47] mt-0.5">
                    {new Date(rp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {rp.readTime ? ` • ${rp.readTime}` : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Categories */}
        <div className="rounded-2xl border border-[#E8DCC8] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#2D5F3F] mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#F5F1E8] text-[#6B4423] hover:bg-[#E8DCC8] transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
