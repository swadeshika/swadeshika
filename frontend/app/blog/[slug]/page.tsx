import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Home, ChevronRight, Facebook, Twitter, Linkedin, Link as LinkIcon, Mail } from 'lucide-react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BlogSidebar } from '@/components/blog-sidebar'
import { blogService, BlogPost, BlogCategory } from '@/lib/blogService'
import { BackToTop } from '@/components/back-to-top'
import { BlogShare } from '@/components/blog-share'
import { format } from 'date-fns'

interface BlogPostProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostProps) {
  const unwrappedParams = await params
  try {
    const post = await blogService.getPostBySlug(unwrappedParams.slug)
    if (!post) return { title: 'Blog Post Not Found' }
    
    return {
      title: `${post.title} | Swadeshika Blog`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.featured_image ? [post.featured_image] : [],
      }
    }
  } catch (error) {
    return { title: 'Blog | Swadeshika' }
  }
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const unwrappedParams = await params
  const { slug } = unwrappedParams

  let post: BlogPost | null = null;
  let allPosts: BlogPost[] = [];
  let categoriesData: BlogCategory[] = [];

  try {
    const results = await Promise.all([
      blogService.getPostBySlug(slug),
      blogService.getAllPosts(),
      blogService.getActiveCategories()
    ]);
    post = results[0];
    allPosts = results[1];
    categoriesData = results[2];
  } catch (error) {
    console.error("Error fetching blog data:", error);
  }

  if (!post || post.status !== 'published') {
    notFound()
  }

  // Filter recent posts (exclude current)
  // Ensure we consistently use BlogPost type
  const recentPosts: BlogPost[] = allPosts
    .filter((p) => p.id !== post!.id && p.status === 'published')
    .slice(0, 5)
  
  // Extract categories names
  const categories: string[] = categoriesData.map((c) => c.name)

  // Helper to get read time (estimate)
  const getReadTime = (content: string | null | undefined) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
  }

  // Helper to validate image URLs
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('data:image')) return true;
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  };

  // Sidebar props mapping
  const sidebarRecentPosts = recentPosts.map((p: any) => ({
      id: p.id!,
      slug: p.slug,
      title: p.title,
      date: p.published_at ? format(new Date(p.published_at), 'MMM d, yyyy') : '',
      readTime: getReadTime(p.content),
      image: p.featured_image || '',
      category: p.category_name
  }))

  const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags) : [])

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <SiteHeader />
      
      {/* Breadcrumb Navigation - Simplified (Server Rendered) */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-[#E8DCC8] py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link 
                    href="/" 
                    className="inline-flex items-center text-sm font-medium text-[#6B4423] hover:text-[#5A3A1F]"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRight className="w-4 h-4 text-[#8B6F47] mx-2" />
                    <Link 
                      href="/blog" 
                      className="text-sm font-medium text-[#6B4423] hover:text-[#5A3A1F]"
                    >
                      Blog
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <ChevronRight className="w-4 h-4 text-[#8B6F47] mx-2" />
                    <span className="text-sm font-medium text-[#5A3A1F] truncate max-w-xs">
                      {post.title}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            {/* Interactions could go here if needed */}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full overflow-hidden bg-white">
        {/* Article Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-b from-[#F9F5F0] to-white z-0"></div>
          <div className="relative z-10">
            <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-20">
              <div className="text-center mb-12">
                {post.category_name && (
                    <span className="inline-block bg-[#6B4423] text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-md">
                    {post.category_name}
                    </span>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D5F3F] mb-8 leading-tight font-serif">
                  {post.title}
                </h1>
                <p className="text-xl text-[#6B4423]/80 max-w-3xl mx-auto mb-8">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <div className="flex items-center">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3 border-2 border-white shadow-md bg-gray-200">
                      {isValidImageUrl(post.author_image) ? (
                          <Image
                            src={post.author_image!}
                            alt={post.author_name || 'Author'}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                      ) : null}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#2D5F3F]">{post.author_name || 'Unknown'}</p>
                      <div className="flex items-center text-sm text-[#8B6F47]">
                        <span>{new Date(post.published_at || post.created_at || new Date()).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                        <span className="mx-2">•</span>
                        <span>{getReadTime(post.content)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-px w-16 bg-[#E8DCC8] sm:h-12 sm:w-px"></div>
                  
                  <div className="flex items-center space-x-4">
                     {/* Client-side Share Component */}
                    <BlogShare title={post.title} slug={slug} />
                  </div>
                </div>
              </div>
              
              {/* Featured Image */}
              {isValidImageUrl(post.featured_image) && (
                <div className="relative w-full h-64 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-16 group mx-auto max-w-4xl">
                  <Image
                    src={post.featured_image!}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent">
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article Content + Sidebar */}
        <div className="bg-white py-12">
          <div className="mx-auto px-4 w-full max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-12">
              <article className="lg:col-span-8">
                {/* CSS Logic for Content */}
                {/* We use a simple way to inject styles or rely on global CSS/Tailwind typography */}
                <div className="blog-content prose prose-lg max-w-none w-full">
                     {/* Inline style block for specific overrides if needed, 
                         or ensure global CSS handles .blog-content 
                     */}
                      <style>{`
                        /* Override PrimeReact inline styles if any leak through, though unsafe in server components usually ok */
                        .blog-content span[style*="background-color"],
                        .blog-content strong[style*="background-color"],
                        .blog-content p[style*="background-color"] {
                            background-color: transparent !important;
                        }
                        
                        .blog-content span[style*="color"],
                        .blog-content strong[style*="color"],
                        .blog-content p[style*="color"] {
                            color: inherit !important;
                        }
                        
                        .blog-content p { margin-bottom: 1.25em; line-height: 1.8; color: #5A3A1F; }
                        .blog-content h2 { font-size: 1.875rem; font-weight: 700; margin-bottom: 1em; color: #2D5F3F; margin-top: 1.5em; }
                        .blog-content h3 { font-size: 1.5rem; font-weight: 600; margin-top: 2em; margin-bottom: 0.75em; color: #2D5F3F; }
                        .blog-content .ql-align-justify { text-align: justify; }
                        .blog-content .ql-align-center { text-align: center; }
                        .blog-content .ql-align-right { text-align: right; }
                        .blog-content strong { font-weight: 700; color: #2D5F3F; }
                        .blog-content em { font-style: italic; }
                        .blog-content ul, .blog-content ol { margin-left: 1.5em; margin-bottom: 1.25em; color: #5A3A1F; list-style-type: disc; }
                        .blog-content ol { list-style-type: decimal; }
                        .blog-content li { margin-bottom: 0.5em; line-height: 1.75; }
                        .blog-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1.5em 0; }
                    `}</style>
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-[#E8DCC8]">
                    {tags.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-sm font-semibold text-[#2D5F3F] uppercase tracking-wider mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag: string, index: number) => (
                            <Link
                              key={index}
                              href={`/blog?tag=${tag}`}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#F5F1E8] text-[#6B4423] hover:bg-[#E8DCC8] transition-colors"
                            >
                              {tag}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Author Bio */}
                <div className="mt-8 p-8 bg-[#F9F5F0] rounded-xl">
                  <div className="flex flex-col md:flex-row items-start">
                    <div className="relative h-24 w-24 min-w-24 rounded-full overflow-hidden mb-6 md:mb-0 md:mr-8 border-4 border-white shadow-md shrink-0 bg-gray-200">
                      {isValidImageUrl(post.author_image) && (
                          <Image
                            src={post.author_image!}
                            alt={post.author_name || 'Author'}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                      )}
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-bold text-[#2D5F3F]">About {post.author_name}</h3>
                      <p className="mt-3 text-[#6B4423] leading-relaxed">
                        {post.author_bio}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related Posts */}
                {recentPosts.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-[#2D5F3F] mb-8">You Might Also Like</h2>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {recentPosts
                      .slice(0, 3)
                      .map((relatedPost: any) => (
                        <Link
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.slug}`}
                          className="group block rounded-xl overflow-hidden bg-white border border-[#E8DCC8] hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                          <div className="relative h-48 bg-gray-100">
                            {isValidImageUrl(relatedPost.featured_image) ? (
                                <Image
                                src={relatedPost.featured_image!}
                                alt={relatedPost.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : null}
                            {relatedPost.category_name && (
                                <div className="absolute top-3 right-3">
                                <span className="inline-block bg-white/90 text-[#6B4423] text-xs font-medium px-2.5 py-1 rounded-full">
                                    {relatedPost.category_name}
                                </span>
                                </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-lg text-[#2D5F3F] group-hover:text-[#1E4A2F] transition-colors line-clamp-2 mb-2">
                              {relatedPost.title}
                            </h3>
                            <p className="text-sm text-[#8B6F47] line-clamp-2 mb-4">
                              {relatedPost.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-sm text-[#6B4423]">
                              <span>{getReadTime(relatedPost.content)}</span>
                              <span className="text-[#8B6F47]">Read More →</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
                )}
              </article>

              {/* Sidebar */}
              <BlogSidebar recentPosts={sidebarRecentPosts} categories={categories} />
            </div>
            
          </div>
        </div>
      </main>

      <BackToTop />
      
      <SiteFooter />
    </div>
  )
}
