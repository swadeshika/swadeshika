"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Search } from 'lucide-react'
import Image from 'next/image'
import { blogService, BlogPost, BlogCategory } from '@/lib/blogService'
import { format } from 'date-fns'

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [postsData, categoriesData] = await Promise.all([
          blogService.getAllPosts(),
          blogService.getActiveCategories()
        ])
        
        // Filter only published posts for public view
        const publishedPosts = postsData.filter(post => post.status === 'published')
        setPosts(publishedPosts)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to fetch blog data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase()
    
    // Parse tags if they are a string (JSON)
    const tagsArray = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : [])
    
    const matchesSearch = query === '' ||
                         post.title.toLowerCase().includes(query) ||
                         post.excerpt.toLowerCase().includes(query) ||
                         tagsArray.some((tag: string) => tag.toLowerCase().includes(query))
                         
    const matchesCategory = selectedCategory === 'All' || post.category_name === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Helper to get read time (estimate)
  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
  }

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

          {/* Decorative elements */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 transform pointer-events-none">
            <div className="h-24 w-24 rounded-full bg-[#E8DCC8] opacity-30 blur-xl"></div>
          </div>
          <div className="absolute -top-12 right-1/4 pointer-events-none">
            <div className="h-16 w-16 rounded-full bg-[#2D5F3F] opacity-20 blur-xl"></div>
          </div>
        </section>

        {/* Category Filter */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 my-12">
          {isLoading ? (
             <div className="text-center py-8 text-[#8B6F47]">Loading categories...</div> 
          ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E8DCC8]">
            <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6 text-center">Browse by Category</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                  key="All"
                  variant={selectedCategory === 'All' ? 'default' : 'outline'}
                  className={`h-auto flex-col items-center justify-center p-4 min-w-[100px] rounded-xl transition-all duration-200 ${
                    selectedCategory === 'All'
                      ? 'bg-[#6B4423] text-white hover:bg-[#5A3A1F] shadow-md'
                      : 'border-[#E8DCC8] bg-white text-[#6B4423] hover:bg-[#F5F1E8] hover:border-[#D4C8B8] hover:text-[#5A3A1F]'
                  }`}
                  onClick={() => setSelectedCategory('All')}
                >
                  <span className="text-2xl mb-2">📚</span>
                  <span className="text-xs font-medium">All</span>
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  className={`relative h-auto flex-col items-center justify-center p-4 min-w-[100px] rounded-xl transition-all duration-200 ${
                    selectedCategory === category.name
                      ? 'bg-[#6B4423] text-white hover:bg-[#5A3A1F] shadow-md'
                      : 'border-[#E8DCC8] bg-white text-[#6B4423] hover:bg-[#F5F1E8] hover:border-[#D4C8B8] hover:text-[#5A3A1F]'
                  }`}
                  onClick={() => setSelectedCategory(category.name === selectedCategory ? 'All' : category.name)}
                >
                  <span className="text-2xl mb-2">🌿</span>
                  <span className="text-xs font-medium">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* Blog Posts Grid */}
        <section className="py-12 bg-[#FFFDFA] w-full overflow-hidden">
          <div className="w-full px-4 mx-auto max-w-7xl">
            {isLoading ? (
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-96 rounded-xl bg-gray-100 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => {
                   const tagsArray = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : []);
                   return (
                  <Card key={post.id} className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E8DCC8] bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#D4C8B8]">
                    <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                      {post.featured_image ? (
                           <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                      )}
                     
                      {post.category_name && (
                        <Badge className="absolute top-4 right-4 bg-[#6B4423]/90 hover:bg-[#5A3A1F] backdrop-blur-sm">
                            {post.category_name}
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="flex-grow">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                          {post.author_image ? (
                              <Image
                                src={post.author_image}
                                alt={post.author_name || 'Author'}
                                fill
                                className="object-cover"
                              />
                          ) : null}
                        </div>
                        <div className="text-sm font-medium text-[#6B4423]">{post.author_name || 'Unknown Author'}</div>
                      </div>
                      <CardTitle className="text-xl font-bold leading-tight text-[#2D5F3F] transition-colors group-hover:text-[#1E4A2F] md:text-lg lg:text-xl">
                        <Link href={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-2 text-[#5A3A1F] line-clamp-3">
                        {post.excerpt}
                      </CardDescription>

                      {tagsArray.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tagsArray.slice(0, 2).map((tag: string, index: number) => (
                            <span key={index} className="rounded-full bg-[#F5F1E8] px-2.5 py-0.5 text-xs font-medium text-[#6B4423]">
                              {tag}
                            </span>
                          ))}
                          {tagsArray.length > 2 && (
                            <span className="rounded-full bg-[#F5F1E8] px-2.5 py-0.5 text-xs font-medium text-[#6B4423]">
                              +{tagsArray.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardFooter className="mt-auto flex items-center justify-between border-t border-[#E8DCC8] bg-[#F9F6F0] p-4 text-sm text-[#8B6F47]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={new Date(post.published_at || post.created_at || new Date()).toISOString()}>
                          {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : (post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : 'Date N/A')}
                        </time>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{getReadTime(post.content || '')}</span>
                      </div>
                    </CardFooter>
                  </Card>
                )})}
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
              {/* Decorative elements */}
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
