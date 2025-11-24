"use client"
/**
 * FAQ Page
 * 
 * This page displays frequently asked questions in a searchable, categorized format.
 * It includes a search bar for finding specific questions and highlights matching text.
 * 
 * @component
 * @returns {JSX.Element} The FAQ page component
 */

// Client-side component for interactive search functionality

import { useState } from "react";
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ChevronDown, Truck, RefreshCw, Shield, CreditCard, HelpCircle, Package, Search as SearchIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"

// FAQ data structure
// Organized by categories for better maintainability and searchability
const faqSections = [
  {
    title: "Orders & Shipping",
    icon: <Truck className="h-5 w-5 text-[#2D5F3F]" />,
    items: [
      {
        q: "How long does shipping take?",
        a: "Orders are typically processed within 1-2 business days. Delivery times vary by location: 3-5 business days for metro cities and 5-7 business days for other locations. You'll receive a tracking number once your order ships."
      },
      {
        q: "What are the delivery charges?",
        a: "We offer free standard shipping on all orders above ₹999. For orders below this amount, a flat shipping fee of ₹50 applies. Express delivery options are also available at checkout for an additional charge."
      },
      {
        q: "Do you offer international shipping?",
        a: "Currently, we only ship within India. We're working on expanding our international shipping options in the near future."
      },
      {
        q: "How can I track my order?",
        a: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can track your order using this number on our website or the courier partner's website."
      }
    ]
  },
  {
    title: "Returns & Refunds",
    icon: <RefreshCw className="h-5 w-5 text-[#2D5F3F]" />,
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns of unopened and unused products within 7 days of delivery. The product must be in its original packaging with all seals intact. Some perishable items may not be eligible for return."
      },
      {
        q: "How do I initiate a return?",
        a: "To initiate a return, please contact our customer support at support@swadeshika.com with your order number and reason for return. Our team will guide you through the process and provide a return authorization if eligible."
      },
      {
        q: "How long do refunds take to process?",
        a: "Once we receive the returned items, refunds are typically processed within 3-5 business days. The time it takes for the refund to reflect in your account depends on your bank's processing time."
      }
    ]
  },
  {
    title: "Products & Quality",
    icon: <Package className="h-5 w-5 text-[#2D5F3F]" />,
    items: [
      {
        q: "Are your products organic?",
        a: "We work with trusted farmers and suppliers who follow sustainable and natural farming practices. While not all our products are certified organic, we ensure they meet high-quality standards. Product pages include detailed sourcing information."
      },
      {
        q: "How do you ensure product quality?",
        a: "We have strict quality control measures in place. Our team personally visits partner farms and production facilities to ensure all products meet our quality standards before they reach you."
      },
      {
        q: "Do you offer bulk or wholesale purchases?",
        a: "Yes, we offer special pricing for bulk and wholesale orders. Please contact our wholesale team at wholesale@swadeshika.com for more information and pricing."
      }
    ]
  },
  {
    title: "Payments & Security",
    icon: <Shield className="h-5 w-5 text-[#2D5F3F]" />,
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets. We also offer cash on delivery for select locations."
      },
      {
        q: "Is it safe to use my credit card on your website?",
        a: "Yes, we use industry-standard SSL encryption to protect your payment information. We don't store your credit card details on our servers."
      }
    ]
  },
  {
    title: "Account & Subscriptions",
    icon: <CreditCard className="h-5 w-5 text-[#2D5F3F]" />,
    items: [
      {
        q: "How do I create an account?",
        a: "Click on 'Sign Up' in the top right corner and follow the prompts. You can create an account using your email address or social media accounts."
      },
      {
        q: "Do you offer a subscription service?",
        a: "Yes, we offer a subscription service for regular deliveries of your favorite products. You can set the frequency and easily manage your subscriptions from your account dashboard."
      },
      {
        q: "How do I update my account information?",
        a: "Log in to your account and go to 'Account Settings' to update your personal information, delivery addresses, and notification preferences."
      }
    ]
  }
]

/**
 * Highlights search query matches in the given text
 * @param {string} text - The text to search within
 * @param {string} query - The search term to highlight
 * @returns {React.ReactNode} Text with highlighted matches
 */
function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  // Split text into parts, capturing the query as separate elements
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return parts.map((part, i) => {
    // Apply highlight only to matching parts (case-insensitive)
    const isMatch = part.toLowerCase() === query.toLowerCase();
    return isMatch ? (
      <span key={i} className="bg-yellow-100 text-[#6B4423] px-1 rounded">
        {part}
      </span>
    ) : (
      part
    );
  });
}

/**
 * FAQ Page Component
 * 
 * Renders the FAQ page with search functionality and categorized questions.
 * Implements client-side search with real-time filtering.
 */
export default function FaqsPage() {
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  
  /**
   * Filters FAQ sections based on the search query
   * @type {Array} Filtered and mapped FAQ sections
   */
  const filteredSections = faqSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(section => section.items.length > 0);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        {/* Hero Section */}
        <div className="bg-[#F5F1E8] py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#6B4423] mb-4">How can we help you?</h1>
            <p className="text-[#8B6F47] max-w-2xl mx-auto mb-8">
              Find answers to common questions about our products, orders, shipping, and more. Can't find what you're looking for?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="w-full sm:w-auto">
                <Button className="w-full bg-[#2D5F3F] hover:bg-[#234A32] text-white hover:text-white">
                  Contact Support
                </Button>
              </a>
              <a href="/track-order" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-[#E8DCC8] text-[#6B4423] hover:bg-[#F5F1E8] hover:text-[#6B4423]">
                  Track Order
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search help articles..."
                className="w-full rounded-full border-2 border-[#E8DCC8] bg-white py-3 pl-12 pr-10 text-[#6B4423] placeholder-[#8B6F47] focus:outline-none focus:ring-2 focus:ring-[#2D5F3F] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8B6F47]" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B6F47] hover:text-[#6B4423]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="max-w-4xl mx-auto space-y-12">
            {filteredSections.length > 0 ? (
              filteredSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="bg-white rounded-2xl border-2 border-[#E8DCC8] overflow-hidden">
                  <div className="bg-[#F5F1E8] p-4 flex items-center gap-3">
                    {section.icon}
                    <h2 className="text-xl font-semibold text-[#6B4423]">{section.title}</h2>
                  </div>
                  <div className="divide-y divide-[#E8DCC8]">
                    {section.items.map((faq, faqIndex) => (
                      <details key={faqIndex} className="group p-5 hover:bg-[#FCFAF7] transition-colors">
                        <summary className="flex justify-between items-center cursor-pointer list-none">
                          <span className="text-[#6B4423] font-medium">
                            {highlightMatches(faq.q, searchQuery)}
                          </span>
                          <ChevronDown className="h-5 w-5 text-[#8B6F47] transform group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="mt-3 text-[#8B6F47] pl-1">
                          {highlightMatches(faq.a, searchQuery)}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-[#E8DCC8] p-8">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-[#F5F1E8] text-[#6B4423] mb-4">
                  <SearchIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-[#6B4423] mb-2">No results found</h3>
                <p className="text-[#8B6F47] mb-6">
                  We couldn't find any results for "{searchQuery}". Try different keywords or check out our <a href="/contact" className="text-[#2D5F3F] hover:underline">contact page</a> for help.
                </p>
                <Button 
                  variant="outline" 
                  className="border-[#E8DCC8] text-[#6B4423] hover:bg-[#F5F1E8]"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-[#2D5F3F] rounded-2xl p-8 md:p-12 text-center text-white">
            <div className="max-w-2xl mx-auto">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-white/80" />
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Still have questions?</h2>
              <p className="text-white/90 mb-6">
                Our customer support team is available to help you with any questions or concerns you may have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Contact Support
                </Button>
                <Button variant="outline" className="bg-white text-[#2D5F3F] hover:bg-white/90 hover:bg-accent">
                  Call Us: +91 98765 43210
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
