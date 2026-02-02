"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Search } from 'lucide-react'
import { BlogPost, BlogCategory } from '@/lib/blogService'
import { format } from 'date-fns'
import { BACKEND_ORIGIN } from '@/lib/services/uploadService'

interface BlogListingProps {
  initialPosts: BlogPost[]
  categories: BlogCategory[]
}

export function BlogListing({ initialPosts, categories }: BlogListingProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // Helper to validate and fix image URLs
  const getValidImageUrl = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    
    // Allow data URIs
    if (trimmed.startsWith('data:image')) return trimmed;

    // Fix localhost URLs in production (Mixed Content fix)
    if (trimmed.includes('localhost:5000') || trimmed.includes('127.0.0.1:5000')) {
       // Replace origin with current backend origin
       return trimmed.replace(/http:\/\/localhost:5000|http:\/\/127.0.0.1:5000/g, BACKEND_ORIGIN);
    }

    // Handle relative paths
    if (trimmed.startsWith('/')) {
        return `${BACKEND_ORIGIN}${trimmed}`;
    }

    // Return other absolute URLs as is
    return trimmed;
  };

  // Helper to get read time (estimate)
  const getReadTime = (content: string) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
  }

  const filteredPosts = initialPosts.filter(post => {
    const query = searchQuery.toLowerCase()
    
    // Parse tags if they are a string (JSON)
    const tagsArray = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : [])
    
    // Double-check status (safety net)
    const isPublished = post.status === 'published'

    const matchesSearch = query === '' ||
                         post.title.toLowerCase().includes(query) ||
                         post.excerpt.toLowerCase().includes(query) ||
                         tagsArray.some((tag: string) => tag.toLowerCase().includes(query))
                         
    const matchesCategory = selectedCategory === 'All' || post.category_name === selectedCategory
    
    return isPublished && matchesSearch && matchesCategory
  })

  return (
    <>
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
        </div>

        {/* Blog Posts Grid */}
        <section className="py-12 bg-[#FFFDFA] w-full overflow-hidden">
          <div className="w-full px-4 mx-auto max-w-7xl">
            {filteredPosts.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => {
                   const tagsArray = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : []);
                   return (
                  <Card key={post.id} className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E8DCC8] bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#D4C8B8]">
                    <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                      {(() => {
                        const imgUrl = getValidImageUrl(post.featured_image);
                        return imgUrl ? (
                           <Image
                            src={imgUrl}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                        );
                      })()}
                     
                      {post.category_name && (
                        <Badge className="absolute top-4 right-4 bg-[#6B4423]/90 hover:bg-[#5A3A1F] backdrop-blur-sm">
                            {post.category_name}
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="flex-grow">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                          {(() => {
                             const authorImgUrl = getValidImageUrl(post.author_image);
                             return authorImgUrl ? (
                              <Image
                                src={authorImgUrl}
                                alt={post.author_name || 'Author'}
                                fill
                                className="object-cover"
                              />
                             ) : null;
                          })()}
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
    </>
  )
}
