"use client"

import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Clock, Home, ChevronRight, MessageSquare, Facebook, Twitter, Linkedin, ArrowUp, Link as LinkIcon, Bookmark, Heart, Share, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useEffect, useMemo, useState } from 'react'
import { BlogSidebar } from '@/components/blog-sidebar'

// This would typically come from your CMS or database
const blogPosts = [
  {
    id: 1,
    slug: 'health-benefits-pure-desi-ghee',
    title: 'The Health Benefits of Pure Desi Ghee',
    content: `
      <h2 class="text-2xl font-bold text-[#2D5F3F] mt-8 mb-4">Introduction to Desi Ghee</h2>
      <p class="mb-4 text-[#5A3A1F]">
        Pure desi ghee has been a staple in Indian households for centuries, revered not just for its rich flavor but also for its numerous health benefits. Made from the milk of grass-fed cows, this golden elixir is packed with essential nutrients and healthy fats.
      </p>
      <p class="mb-4 text-[#5A3A1F]">
        In Ayurveda, ghee is considered a 'yogavahi' - a catalyst that carries the medicinal properties of herbs and spices. Modern science is now catching up with what ancient wisdom has known all along - that high-quality ghee can be a valuable addition to a healthy diet.
      </p>
      <h2 class="text-2xl font-bold text-[#2D5F3F] mt-8 mb-4">Nutritional Profile</h2>
      <p class="mb-4 text-[#5A3A1F]">
        Desi ghee is rich in fat-soluble vitamins A, D, E, and K, as well as essential fatty acids like conjugated linoleic acid (CLA) and butyric acid. These nutrients play crucial roles in various bodily functions, from supporting immune health to reducing inflammation.
      </p>
    `,
    excerpt: 'Discover why pure desi ghee is considered a superfood in Ayurveda and how it can benefit your health.',
    image: 'https://images.unsplash.com/photo-1602351444334-90c7cc49824e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    category: 'Health & Wellness',
    date: '2025-10-15',
    readTime: '5 min read',
    author: 'Dr. Anjali Sharma',
    authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    tags: ['ayurveda', 'ghee', 'healthy-fats']
  },
  {
    id: 2,
    slug: 'plant-based-nutrition',
    title: 'The Power of Plant-Based Nutrition',
    content: `
      <h2 class="text-2xl font-bold text-[#2D5F3F] mt-8 mb-4">Embracing a Plant-Based Lifestyle</h2>
      <p class="mb-4 text-[#5A3A1F]">
        Plant-based nutrition is more than just a diet—it's a lifestyle that emphasizes foods derived from plant sources. This includes not only fruits and vegetables, but also nuts, seeds, oils, whole grains, legumes, and beans.
      </p>
      <p class="mb-4 text-[#5A3A1F]">
        Research consistently shows that plant-based diets are associated with a lower risk of heart disease, diabetes, and certain cancers. The high fiber content, antioxidants, and phytonutrients in plant foods contribute to better overall health and longevity.
      </p>
      <h2 class="text-2xl font-bold text-[#2D5F3F] mt-8 mb-4">Key Benefits</h2>
      <p class="mb-4 text-[#5A3A1F]">
        A well-planned plant-based diet provides all the necessary nutrients your body needs, often with fewer calories than a typical Western diet. It's naturally lower in saturated fats and cholesterol while being rich in fiber, vitamins, and minerals.
      </p>
    `,
    excerpt: 'Discover the health benefits of a plant-based diet and how it can transform your wellbeing.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    category: 'Nutrition',
    date: '2025-09-28',
    readTime: '6 min read',
    author: 'Dr. Meera Krishnan',
    authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    tags: ['plant-based', 'nutrition', 'healthy-eating']
  }
]

interface BlogPostProps {
  params: {
    slug: string
  }
}

export default function BlogPost({ params }: BlogPostProps) {
  // Use React.use() to unwrap the params Promise
  const unwrappedParams = React.use(params)
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
  
  const post = blogPosts.find(post => post.slug === slug)
  
  if (!post) {
    notFound()
  }
  
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${slug}`
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const handleBack = () => {
    router.back()
  }
  
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

  // Sidebar data
  const recentPosts = useMemo(
    () => blogPosts.filter((p) => p.slug !== post.slug).slice(0, 5),
    [post.slug]
  )
  const categories = useMemo(
    () => Array.from(new Set(blogPosts.map((p) => p.category))),
    []
  )

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
                <span className="inline-block bg-[#6B4423] text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-md">
                  {post.category}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D5F3F] mb-8 leading-tight font-serif">
                  {post.title}
                </h1>
                <p className="text-xl text-[#6B4423]/80 max-w-3xl mx-auto mb-8">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <div className="flex items-center">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3 border-2 border-white shadow-md">
                      <Image
                        src={post.authorImage}
                        alt={post.author}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#2D5F3F]">{post.author}</p>
                      <div className="flex items-center text-sm text-[#8B6F47]">
                        <span>{new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                        <span className="mx-2">•</span>
                        <span>{post.readTime}</span>
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
              <div className="relative w-full h-64 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-16 group mx-auto max-w-4xl">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent flex items-end p-8">
                  <p className="text-white/80 text-sm">Photo by {post.author}</p>
                </div>
              </div>
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
                    {post.tags && post.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-[#2D5F3F] uppercase tracking-wider mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
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
                    <div className="relative h-24 w-24 min-w-24 rounded-full overflow-hidden mb-6 md:mb-0 md:mr-8 border-4 border-white shadow-md shrink-0">
                      <Image
                        src={post.authorImage}
                        alt={post.author}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-bold text-[#2D5F3F]">About {post.author.split(' ')[0]}</h3>
                      <p className="mt-3 text-[#6B4423] leading-relaxed">
                        {post.author} is a passionate writer and wellness advocate with a deep interest in holistic health and traditional medicine.
                        With years of experience in the field, they bring valuable insights into the world of natural health and wellness.
                      </p>
                      <div className="mt-4 flex justify-center md:justify-start space-x-4">
                        <a href="#" className="text-[#6B4423] hover:text-[#5A3A1F] transition-colors">
                          <span className="sr-only">Twitter</span>
                          <Twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-[#6B4423] hover:text-[#5A3A1F] transition-colors">
                          <span className="sr-only">Website</span>
                          <LinkIcon className="h-5 w-5" />
                        </a>
                      </div>
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
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-[#2D5F3F] mb-8">You Might Also Like</h2>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {blogPosts
                      .filter((p) => p.slug !== post.slug)
                      .slice(0, 3)
                      .map((relatedPost) => (
                        <Link
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.slug}`}
                          className="group block rounded-xl overflow-hidden bg-white border border-[#E8DCC8] hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                          <div className="relative h-48 bg-gray-100">
                            <Image
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3">
                              <span className="inline-block bg-white/90 text-[#6B4423] text-xs font-medium px-2.5 py-1 rounded-full">
                                {relatedPost.category}
                              </span>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-lg text-[#2D5F3F] group-hover:text-[#1E4A2F] transition-colors line-clamp-2 mb-2">
                              {relatedPost.title}
                            </h3>
                            <p className="text-sm text-[#8B6F47] line-clamp-2 mb-4">
                              {relatedPost.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-sm text-[#6B4423]">
                              <span>{relatedPost.readTime}</span>
                              <span className="text-[#8B6F47]">Read More →</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <BlogSidebar recentPosts={recentPosts} categories={categories} />
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
