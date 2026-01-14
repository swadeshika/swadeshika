"use client"

import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Home, ChevronRight, MessageSquare, Facebook, Twitter, Linkedin, ArrowUp, Link as LinkIcon, Bookmark, Heart, Share, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useEffect, useMemo, useState } from 'react'
import { BlogSidebar } from '@/components/blog-sidebar'
import { blogService, BlogPost } from '@/lib/blogService'
import { format } from 'date-fns'

interface BlogPostProps {
  params: Promise<{
    slug: string
  }>
}

export default function BlogPostPage({ params }: BlogPostProps) {
  // Use React.use() to unwrap the params Promise
  const unwrappedParams = React.use(params) as { slug: string }
  return <BlogPostContent slug={unwrappedParams.slug} />
}

function BlogPostContent({ slug }: { slug: string }) {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [comment, setComment] = useState('')
  const [commenterName, setCommenterName] = useState('')
  const [comments, setComments] = useState<Array<{id: number, text: string, author: string, name: string, date: string}>>([])
  const [showCommentForm, setShowCommentForm] = useState(false)

  // Data state
  const [post, setPost] = useState<BlogPost | null>(null)
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  
  useEffect(() => {
      const fetchData = async () => {
          try {
              setIsLoading(true)
              const [postData, allPostsData, categoriesData] = await Promise.all([
                  blogService.getPostBySlug(slug),
                  blogService.getAllPosts(),
                  blogService.getActiveCategories()
              ])
              
              if (!postData) {
                  setError(true)
              } else {
                  setPost(postData)
                  // Filter recent posts (exclude current)
                  const otherPosts = allPostsData
                    .filter(p => p.id !== postData.id && p.status === 'published')
                    .slice(0, 5)
                  setRecentPosts(otherPosts)
                  
                  // Extract categories names
                  setCategories(categoriesData.map(c => c.name))
              }
          } catch (err) {
              console.error("Error fetching blog post:", err)
              setError(true)
          } finally {
              setIsLoading(false)
          }
      }
      
      if (slug) {
          fetchData()
      }
  }, [slug])

  if (error) {
    notFound()
  }
  
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : ''
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      // You might want to add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }
  
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // Add toast notification here
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    // Add API call to save like
  }

  const handleShare = (platform: string) => {
    if (!post) return
    const url = encodeURIComponent(shareUrl)
    const title = encodeURIComponent(post.title)
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
        break
      case 'mail':
        window.open(`mailto:?subject=${title}&body=Check out this article: ${url}`)
        break
    }
    setShowShareOptions(false)
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !commenterName.trim()) return
    
    const newComment = {
      id: Date.now(),
      text: comment,
      author: 'user',
      name: commenterName,
      date: new Date().toISOString()
    }
    
    setComments([...comments, newComment])
    setComment('')
    setCommenterName('')
    setShowCommentForm(false)
    // Add API call to save comment
  }

  // Helper to format tags
  const getTags = (): string[] => {
      if (!post?.tags) return []
      return Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags) : [])
  }
  
  // Helper to get read time (estimate)
  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return `${time} min read`;
  }

  // Sidebar props mapping
  const sidebarRecentPosts = recentPosts.map(p => ({
      id: p.id!,
      slug: p.slug,
      title: p.title,
      date: p.published_at ? format(new Date(p.published_at), 'MMM d, yyyy') : '',
      readTime: getReadTime(p.content),
      image: p.featured_image || '',
      category: p.category_name
  }))


  if (isLoading) {
      return (
        <div className="flex min-h-screen flex-col overflow-hidden">
             <SiteHeader />
             <div className="flex-1 flex items-center justify-center">
                 <div className="w-16 h-16 border-4 border-[#2D5F3F] border-t-transparent rounded-full animate-spin"></div>
             </div>
             <SiteFooter />
        </div>
      )
  }

  if (!post) return null // Should be handled by notFound() above

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <SiteHeader />
      
      {/* Breadcrumb Navigation */}
      <div className={`sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-[#E8DCC8] transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
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
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleBookmark}
                className="p-2 rounded-full hover:bg-[#F5F1E8] transition-colors cursor-pointer"
                aria-label={isBookmarked ? 'Remove from bookmarks' : 'Bookmark this article'}
              >
                <Bookmark 
                  className={`h-5 w-5 ${isBookmarked ? 'fill-[#6B4423] text-[#6B4423]' : 'text-[#8B6F47]'}`} 
                />
              </button>
              <button 
                onClick={toggleLike}
                className="p-2 rounded-full hover:bg-[#F5F1E8] transition-colors cursor-pointer"
                aria-label={isLiked ? 'Unlike this article' : 'Like this article'}
              >
                <Heart 
                  className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#8B6F47]'}`} 
                />
              </button>
            </div>
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
                      {post.author_image ? (
                          <Image
                            src={post.author_image}
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
                    <button 
                      onClick={toggleBookmark}
                      className="flex items-center cursor-pointer text-sm text-[#6B4423] hover:text-[#5A3A1F] transition-colors group"
                    >
                      <Bookmark 
                        className={`h-5 w-5 mr-1.5 ${isBookmarked ? 'fill-[#6B4423] text-[#6B4423]' : 'text-[#8B6F47]'}`} 
                      />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </button>
                    <button 
                      onClick={toggleLike}
                      className="flex items-center text-sm cursor-pointer text-[#6B4423] hover:text-[#5A3A1F] transition-colors group"
                    >
                      <Heart 
                        className={`h-5 w-5 mr-1.5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#8B6F47]'}`} 
                      />
                      {isLiked ? 'Liked' : 'Like'}
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setShowShareOptions(!showShareOptions)}
                        className="flex items-center cursor-pointer text-sm text-[#6B4423] hover:text-[#5A3A1F] transition-colors group relative z-10"
                      >
                        <Share className="h-4 w-4 mr-1.5 text-[#8B6F47]" />
                        Share
                      </button>
                      {showShareOptions && (
                        <div className="absolute right-0 mt-2 cursor-pointer w-48 bg-white rounded-md shadow-lg py-1 z-20">
                          <button 
                            onClick={() => handleShare('facebook')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                            Share on Facebook
                          </button>
                          <button 
                            onClick={() => handleShare('twitter')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                            Share on Twitter
                          </button>
                          <button 
                            onClick={() => handleShare('linkedin')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                            Share on LinkedIn
                          </button>
                          <button 
                            onClick={() => handleShare('mail')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            Share via Email
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Featured Image */}
              {post.featured_image && (
                <div className="relative w-full h-64 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-16 group mx-auto max-w-4xl">
                    <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 80vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent flex items-end p-8">
                    <p className="text-white/80 text-sm">Photo by {post.author_name}</p>
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
                <div
                  className="prose max-w-none w-full prose-p:text-[#5A3A1F] prose-headings:text-[#2D5F3F] prose-a:text-[#6B4423] hover:prose-a:text-[#5A3A1F] prose-strong:text-[#2D5F3F] prose-img:rounded-xl prose-img:shadow-md prose-img:max-w-full"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags and Share */}
                <div className="mt-12 pt-8 border-t border-[#E8DCC8]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    {getTags().length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-[#2D5F3F] uppercase tracking-wider mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {getTags().map((tag, index) => (
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

                    <div className="w-full sm:w-auto">
                      <h3 className="text-sm font-semibold text-[#2D5F3F] uppercase tracking-wider mb-3">Share</h3>
                      <div className="flex items-center space-x-3">
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-[#F5F1E8] text-[#6B4423] hover:bg-[#6B4423] hover:text-white transition-colors"
                          aria-label="Share on Facebook"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-[#F5F1E8] text-[#6B4423] hover:bg-[#6B4423] hover:text-white transition-colors"
                          aria-label="Share on Twitter"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                        <a
                          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-[#F5F1E8] text-[#6B4423] hover:bg-[#6B4423] hover:text-white transition-colors"
                          aria-label="Share on LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-[#F5F1E8] text-[#6B4423] hover:bg-[#6B4423] hover:text-white transition-colors"
                          aria-label="Copy link"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Author Bio */}
                <div className="mt-12 p-8 bg-[#F9F5F0] rounded-xl">
                  <div className="flex flex-col md:flex-row items-start">
                    <div className="relative h-24 w-24 min-w-24 rounded-full overflow-hidden mb-6 md:mb-0 md:mr-8 border-4 border-white shadow-md shrink-0 bg-gray-200">
                      {post.author_image && (
                          <Image
                            src={post.author_image}
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
                        {post.author_name} is a contributor to our wellness blog.
                      </p>
                      
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mt-12 pt-8 border-t border-[#E8DCC8]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#2D5F3F]">
                      Comments {comments.length > 0 && `(${comments.length})`}
                    </h3>
                    <button
                      onClick={() => setShowCommentForm(!showCommentForm)}
                      className="inline-flex items-center text-sm font-medium text-[#6B4423] hover:text-[#5A3A1F] transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {showCommentForm ? 'Cancel' : 'Leave a comment'}
                    </button>
                  </div>

                  {showCommentForm && (
                    <form onSubmit={handleCommentSubmit} className="mb-8">
                      <div className="grid gap-4 mb-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-[#5A3A1F] mb-1">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={commenterName}
                            onChange={(e) => setCommenterName(e.target.value)}
                            className="w-full px-4 py-2 border border-[#E8DCC8] rounded-lg focus:ring-2 focus:ring-[#6B4423] focus:border-transparent"
                            placeholder="Enter your name"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="comment" className="block text-sm font-medium text-[#5A3A1F] mb-1">
                            Comment <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="comment"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-3 border border-[#E8DCC8] rounded-lg focus:ring-2 focus:ring-[#6B4423] focus:border-transparent"
                            placeholder="Share your thoughts..."
                            required
                          ></textarea>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#6B4423] text-white font-medium rounded-lg hover:bg-[#5A3A1F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B4423] focus:ring-offset-2"
                        >
                          Post Comment
                        </button>
                      </div>
                    </form>
                  )}

                  {comments.length > 0 ? (
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-4">
                          <div className="shrink-0">
                            <div className="h-10 w-10 rounded-full bg-[#E8DCC8] flex items-center justify-center text-[#6B4423] font-medium">
                              {comment.name ? comment.name.charAt(0).toUpperCase() : comment.author.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-[#2D5F3F]">{comment.name || 'Anonymous'}</span>
                              <span className="text-sm text-[#8B6F47]">•</span>
                              <span className="text-sm text-[#8B6F47]">
                                {new Date(comment.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="mt-1 text-[#5A3A1F]">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#F9F5F0] rounded-lg p-6 text-center">
                      <p className="text-[#8B6F47]">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>

                {/* Related Posts */}
                {recentPosts.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-[#2D5F3F] mb-8">You Might Also Like</h2>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {recentPosts
                      .slice(0, 3)
                      .map((relatedPost) => (
                        <Link
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.slug}`}
                          className="group block rounded-xl overflow-hidden bg-white border border-[#E8DCC8] hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                          <div className="relative h-48 bg-gray-100">
                            {relatedPost.featured_image ? (
                                <Image
                                src={relatedPost.featured_image}
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

      {/* Back to top button */}
      <div className="bg-white border-t border-[#E8DCC8]">
        <div className="container mx-auto px-4">
          <div className="py-6 flex justify-center">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center text-sm font-medium text-[#6B4423] hover:text-[#5A3A1F] transition-colors"
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              Back to top
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
