import { BlogListing } from './blog-listing'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { blogService } from '@/lib/blogService'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog - Wellness & Lifestyle | Swadeshika',
  description: 'Explore expert insights on health, wellness, and sustainable living to help you live your best life.',
}

export default async function BlogPage() {
  const [postsData, categoriesData] = await Promise.all([
    blogService.getAllPosts({ status: 'published', limit: 100 }), // increased limit for now, ideally pagination UI should be added
    blogService.getActiveCategories()
  ])

  // Posts are already filtered by backend
  const publishedPosts = postsData;

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Swadeshika Blog",
            description: "Read the latest updates, recipes, and health tips from Swadeshika.",
            url: `${process.env.NEXT_PUBLIC_APP_URL || "https://swadeshika.in"}/blog`
          })
        }}
      />
      <main className="flex-1 w-full overflow-x-hidden">
        <BlogListing initialPosts={publishedPosts} categories={categoriesData} />
      </main>

      <SiteFooter />
    </div>
  )
}
