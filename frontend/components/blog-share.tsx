"use client"

import { useState } from 'react'
import { Share, Facebook, Twitter, Linkedin, Link as LinkIcon, Mail } from 'lucide-react'

interface ShareProps {
  title: string
  slug: string
}

export function BlogShare({ title, slug }: ShareProps) {
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleShare = (platform: string) => {
    if (!shareUrl) return
    const url = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(title)
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
        break
      case 'mail':
        window.open(`mailto:?subject=${encodedTitle}&body=Check out this article: ${url}`)
        break
    }
    setShowShareOptions(false)
  }

  return (
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
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
            Share on Facebook
          </button>
          <button 
            onClick={() => handleShare('twitter')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <Twitter className="h-4 w-4 mr-2 text-blue-400" />
            Share on Twitter
          </button>
          <button 
            onClick={() => handleShare('linkedin')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
            Share on LinkedIn
          </button>
          <button 
            onClick={() => handleShare('mail')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            Share via Email
          </button>
           <button 
            onClick={handleCopyLink}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  )
}
