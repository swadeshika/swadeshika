import Link from 'next/link'
import { Home, ArrowRight, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        <div className="relative bg-[#F9F5F0] overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 transform">
            <div className="h-24 w-24 rounded-full bg-[#E8DCC8] opacity-30 blur-xl"></div>
          </div>
          <div className="absolute -top-12 right-1/4">
            <div className="h-16 w-16 rounded-full bg-[#2D5F3F] opacity-20 blur-xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-[#2D5F3F] sm:text-5xl">404</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#2D5F3F] sm:text-5xl">
                Page not found
              </h1>
              <p className="mt-4 text-lg text-[#6B4423]">
                Sorry, we couldn't find the page you're looking for.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild className="bg-[#6B4423] hover:bg-[#5A3A1F] text-white">
                  <Link href="/" className="inline-flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    Go back home
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="border-[#6B4423] text-[#6B4423] hover:bg-[#F5F1E8]">
                  <Link href="/blog" className="inline-flex items-center">
                    Read our blog
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="mt-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#E8DCC8] text-[#6B4423] text-sm font-medium">
                  <Leaf className="mr-2 h-4 w-4" />
                  Swadeshika - Sustainable Living
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
}
