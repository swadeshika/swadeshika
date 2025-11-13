"use client"

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Search } from 'lucide-react'
import Image from 'next/image'

// Mock blog posts data with thumbnails and longer content
const blogPosts = [
  {
    id: 1,
    title: 'The Health Benefits of Pure Desi Ghee',
    excerpt: 'Discover why pure desi ghee is considered a superfood in Ayurveda and how it can benefit your health. Learn about its digestive properties, skin benefits, and how it enhances flavor in traditional Indian cooking.',
    image: 'https://images.unsplash.com/photo-1602351444334-90c7cc49824e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Health & Wellness',
    date: '2025-10-15',
    readTime: '5 min read',
    slug: 'health-benefits-pure-desi-ghee',
    author: 'Dr. Anjali Sharma',
    authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    tags: ['ayurveda', 'ghee', 'healthy-fats']
  },
  {
    id: 2,
    title: 'Organic Farming: Why It Matters',
    excerpt: 'Learn how organic farming practices contribute to better health and a sustainable environment. Discover the benefits of chemical-free agriculture and how it preserves soil health and biodiversity for future generations.',
    category: 'Sustainable Living',
    date: '2025-10-10',
    readTime: '6 min read',
    slug: 'organic-farming-benefits',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: 'Rahul Verma',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    tags: ['organic', 'farming', 'sustainability']
  },
  {
    id: 3,
    title: 'The Art of Mindful Eating',
    excerpt: 'Discover how practicing mindfulness during meals can transform your relationship with food. Learn techniques to savor each bite, recognize hunger cues, and develop a healthier approach to eating that nourishes both body and mind.',
    category: 'Health & Wellness',
    date: '2025-10-05',
    readTime: '5 min read',
    slug: 'art-of-mindful-eating',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: 'Dr. Priya Sharma',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    tags: ['mindfulness', 'nutrition', 'wellness']
  },
  {
    id: 4,
    title: 'The Power of Plant-Based Nutrition',
    excerpt: 'Dive into the science-backed benefits of plant-based eating, from reducing chronic disease risk to promoting environmental sustainability. This comprehensive guide includes practical tips for transitioning to a plant-focused diet, essential nutrients to watch, and delicious recipe ideas to get you started on your journey to better health.',
    category: 'Nutrition',
    date: '2025-09-28',
    readTime: '8 min read',
    slug: 'plant-based-nutrition',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    author: 'Meera Krishnan',
    authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    tags: ['plant-based', 'nutrition', 'sustainability']
  },
  {
    id: 5,
    title: 'Seasonal Eating: Fall Edition',
    excerpt: 'Discover the best seasonal foods to eat this fall and their health benefits according to Ayurveda. Learn how eating with the seasons can boost your immunity, improve digestion, and keep you in harmony with nature\'s rhythms.',
    image: 'https://images.unsplash.com/photo-1504674900247-087703dfcca9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Ayurveda',
    date: '2025-09-20',
    readTime: '6 min read',
    slug: 'seasonal-eating-fall-edition',
    author: 'Dr. Vikram Patel',
    authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a2c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    tags: ['seasonal', 'ayurveda', 'fall-foods']
  },
  {
    id: 6,
    title: 'The Power of Turmeric: Golden Spice of Life',
    excerpt: 'Explore the incredible health benefits of turmeric, the golden spice that has been used in Ayurveda for centuries. Learn about its anti-inflammatory properties, how it supports joint health, and delicious ways to incorporate it into your daily routine.',
    image: 'https://images.unsplash.com/photo-1601584337957-4d9dc9b7be7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Ayurveda',
    date: '2025-09-10',
    readTime: '7 min read',
    slug: 'power-of-turmeric',
    author: 'Dr. Neha Kapoor',
    authorImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    tags: ['turmeric', 'ayurveda', 'anti-inflammatory']
  }
]

// Categories for filtering with icons
const categories = [
  { name: 'All', icon: '📚' },
  { name: 'Health & Wellness', icon: '💪' },
  { name: 'Ayurveda', icon: '🌿' },
  { name: 'Nutrition', icon: '🍎' },
  { name: 'Yoga', icon: '🧘' },
  { name: 'Sustainable Living', icon: '🌱' },
  { name: 'Recipes', icon: '🍳' },
  { name: 'Natural Remedies', icon: '🌼' }
]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredPosts = blogPosts.filter(post => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = query === '' ||
                         post.title.toLowerCase().includes(query) ||
                         post.excerpt.toLowerCase().includes(query) ||
                         (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <SiteHeader />

      <main className="flex-1 w-full overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative bg-[#F9F5F0] overflow-hidden w-full">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
          <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:py-20 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-[#2D5F3F] sm:text-5xl md:text-6xl">
                Discover Our Blog
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6B4423] md:text-xl">
                Expert insights on health, wellness, and sustainable living to help you live your best life.
              </p>

              <div className="mt-10 max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B6F47]" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-[#E8DCC8] bg-white pl-12 pr-6 py-6 text-[#5A3A1F] placeholder-[#8B6F47] focus-visible:ring-2 focus-visible:ring-[#6B4423]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F1E8] shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements — safe because page-level overflow-x-hidden hides any tiny overflow */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 transform pointer-events-none">
            <div className="h-24 w-24 rounded-full bg-[#E8DCC8] opacity-30 blur-xl"></div>
          </div>
          <div className="absolute -top-12 right-1/4 pointer-events-none">
            <div className="h-16 w-16 rounded-full bg-[#2D5F3F] opacity-20 blur-xl"></div>
          </div>
        </section>

        {/* Category Filter */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E8DCC8]">
            <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6 text-center">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8 gap-3">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  className={`relative h-auto flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                    selectedCategory === category.name
                      ? 'bg-[#6B4423] text-white hover:bg-[#5A3A1F] shadow-md'
                      : 'border-[#E8DCC8] bg-white text-[#6B4423] hover:bg-[#F5F1E8] hover:border-[#D4C8B8] hover:text-[#5A3A1F]'
                  }`}
                  onClick={() => setSelectedCategory(category.name === selectedCategory ? 'All' : category.name)}
                >
                  <span className="text-2xl mb-2">{category.icon}</span>
                  <span className="text-xs font-medium">{category.name}</span>
                  {selectedCategory === category.name && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D5F3F] text-xs text-white">
                      {filteredPosts.length}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <section className="py-12 bg-[#FFFDFA] w-full overflow-hidden">
          <div className="w-full px-4 mx-auto max-w-7xl">
            {filteredPosts.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E8DCC8] bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#D4C8B8]">
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={post.id <= 3}
                      />
                      <Badge className="absolute top-4 right-4 bg-[#6B4423]/90 hover:bg-[#5A3A1F] backdrop-blur-sm">
                        {post.category}
                      </Badge>
                    </div>
                    <CardHeader className="flex-grow">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full">
                          <Image
                            src={post.authorImage}
                            alt={post.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-sm font-medium text-[#6B4423]">{post.author}</div>
                      </div>
                      <CardTitle className="text-xl font-bold leading-tight text-[#2D5F3F] transition-colors group-hover:text-[#1E4A2F] md:text-lg lg:text-xl">
                        <Link href={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-2 text-[#5A3A1F] line-clamp-3">
                        {post.excerpt}
                      </CardDescription>

                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {post.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="rounded-full bg-[#F5F1E8] px-2.5 py-0.5 text-xs font-medium text-[#6B4423]">
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="rounded-full bg-[#F5F1E8] px-2.5 py-0.5 text-xs font-medium text-[#6B4423]">
                              +{post.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardFooter className="mt-auto flex items-center justify-between border-t border-[#E8DCC8] bg-[#F9F6F0] p-4 text-sm text-[#8B6F47]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={new Date(post.date).toISOString().split('T')[0]}>
                          {post.date}
                        </time>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F9F6F0] p-12 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8DCC8] text-[#6B4423]">
                  <Search className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D5F3F] md:text-3xl">No articles found</h3>
                <p className="mt-3 max-w-md text-[#8B6F47] md:text-lg">
                  {searchQuery
                    ? `We couldn't find any articles matching "${searchQuery}". Try different keywords or browse our categories.`
                    : 'No articles match the selected category. Try another category or check back soon for new content.'}
                </p>

                {/* BUTTON now resets filters to show all posts */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All')
                    setSearchQuery('')
                  }}
                  className="inline-flex items-center justify-center mt-6 rounded-full bg-[#6B4423] px-6 py-6 text-base font-medium text-white hover:bg-[#5A3A1F] transition-colors"
                >
                  View All Articles
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-white py-16 md:py-24 w-full overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="bg-[#F9F5F0] rounded-2xl p-6 md:p-12 relative overflow-hidden">
              {/* Decorative elements (kept but safe due to overflow-x-hidden at page level) */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#E8DCC8] opacity-40"></div>
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-[#2D5F3F] opacity-10"></div>

              <div className="relative z-10 text-center">
                <h2 className="text-2xl font-bold text-[#2D5F3F] md:text-3xl">Join Our Community</h2>
                <p className="mx-auto mt-3 max-w-2xl text-[#6B4423] md:text-lg">
                  Get the latest articles, wellness tips, and exclusive offers delivered straight to your inbox.
                </p>

                <form className="mt-8 max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow">
                      <label htmlFor="email" className="sr-only">Email address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full rounded-full border border-[#E8DCC8] bg-white px-6 py-3 text-[#5A3A1F] placeholder-[#8B6F47] focus:outline-none focus:ring-2 focus:ring-[#6B4423]/50 focus:ring-offset-2 focus:ring-offset-[#F5F1E8]"
                        placeholder="Enter your email address"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-full bg-[#6B4423] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5A3A1F] focus:outline-none focus:ring-2 focus:ring-[#6B4423]/50 focus:ring-offset-2 focus:ring-offset-[#F5F1E8] whitespace-nowrap"
                    >
                      Subscribe
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-[#8B6F47]">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-[#6B4423]">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-[#2D5F3F] mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    No spam, ever
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-[#2D5F3F] mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Easy unsubscribe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
