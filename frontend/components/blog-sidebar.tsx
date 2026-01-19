import Image from "next/image"
import Link from "next/link"
import { BookOpen, Clock, Mail, TrendingUp, Award, Leaf, Heart, Calendar } from "lucide-react"

type SidebarPost = {
  id: number | string
  slug: string
  title: string
  date: string
  readTime?: string
  image: string
  category?: string
}

export function BlogSidebar({
  recentPosts,
  categories,
}: {
  recentPosts: SidebarPost[]
  categories: string[]
}) {
  // Get popular posts (use recent posts sorted by a stable metric if views/likes not available)
  const popularPosts = [...recentPosts].slice(0, 3).map((post, index) => ({
    ...post,
    views: 1000 - (index * 100),
    likes: 50 - (index * 5)
  }))

  return (
    <aside className="lg:col-span-4">
      <div className="lg:sticky lg:top-28 space-y-6">
        {/* About Me Card */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#2D5F3F] to-[#1E4A2F] text-white p-6 shadow-lg">
          <div className="text-center mb-4">
            <div className="inline-block p-2 bg-white/10 rounded-full mb-3">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to Our Blog</h3>
            <p className="text-sm text-white/90 mb-4">
              Discover wellness insights, health tips, and natural living advice from our team of experts.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold">100+</div>
              <div className="text-white/70">Articles</div>
            </div>
            <div>
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-white/70">Readers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">10+</div>
              <div className="text-white/70">Experts</div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        {/* <div className="rounded-2xl border-2 border-[#E8DCC8] bg-white p-6 shadow-sm">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F5F1E8] text-[#6B4423] mb-3">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-[#2D5F3F] mb-2">Weekly Digest</h3>
            <p className="text-sm text-[#6B4423] mb-4">
              Get the latest articles and wellness tips delivered to your inbox.
            </p>
          </div>
          <form className="space-y-3">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                type="email"
                id="email"
                placeholder="Your email address"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-[#E8DCC8] focus:ring-2 focus:ring-[#6B4423]/50 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#6B4423] hover:bg-[#5A3A1F] text-white font-medium rounded-lg transition-colors duration-200"
            >
              Subscribe Now
            </button>
          </form>
          <p className="text-xs text-[#8B6F47] mt-3 text-center">
            No spam, unsubscribe anytime.
          </p>
        </div> */}

        {/* Popular Posts */}
        <div className="rounded-2xl border border-[#E8DCC8] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2D5F3F]">Trending Now</h3>
            <TrendingUp className="h-5 w-5 text-[#8B6F47]" />
          </div>
          <ul className="space-y-4">
            {popularPosts.map((post, index) => (
              <li key={post.id} className="group">
                <Link href={`/blog/${post.slug}`} className="flex items-start gap-3">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-[#F5F1E8] shrink-0 flex items-center justify-center text-[#8B6F47] font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#2D5F3F] group-hover:text-[#1E4A2F] line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center text-xs text-[#8B6F47] mt-1 space-x-2">
                      {/* <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {post.likes}
                      </span>
                      <span>•</span> */}
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="rounded-2xl border border-[#E8DCC8] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2D5F3F]">Categories</h3>
            <BookOpen className="h-5 w-5 text-[#8B6F47]" />
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/blog?category=${encodeURIComponent(category)}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F9F5F0] transition-colors group"
              >
                <span className="text-[#5A3A1F] group-hover:text-[#2D5F3F] font-medium">
                  {category}
                </span>
                <span className="text-xs bg-[#F5F1E8] text-[#6B4423] px-2 py-1 rounded-full">
                  {recentPosts.filter(p => p.category === category).length}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="rounded-2xl border border-[#E8DCC8] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2D5F3F]">Latest Articles</h3>
            <Calendar className="h-5 w-5 text-[#8B6F47]" />
          </div>
          <ul className="space-y-4">
            {recentPosts.slice(0, 3).map((post) => (
              <li key={post.id} className="group">
                <Link href={`/blog/${post.slug}`} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-[#F5F1E8] shrink-0">
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      width={56} 
                      height={56} 
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#2D5F3F] group-hover:text-[#1E4A2F] line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center text-xs text-[#8B6F47] mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        {/* <div className="rounded-2xl border border-[#E8DCC8] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2D5F3F]">Popular Tags</h3>
            <Award className="h-5 w-5 text-[#8B6F47]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['Wellness', 'Nutrition', 'Ayurveda', 'Healthy Living', 'Mindfulness', 'Herbs', 'Superfoods', 'Detox', 'Immunity', 'Gut Health', 'Holistic', 'Recipes'].map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#F5F1E8] text-[#6B4423] hover:bg-[#E8DCC8] hover:text-[#5A3A1F] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div> */}
      </div>
    </aside>
  )
}
