"use client"

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!show) return null

  return (
    <div className="bg-white border-t border-[#E8DCC8]">
      <div className="container mx-auto px-4">
        <div className="py-6 flex justify-center">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center text-sm font-medium text-[#6B4423] hover:text-[#5A3A1F] transition-colors cursor-pointer"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Back to top
          </button>
        </div>
      </div>
    </div>
  )
}
