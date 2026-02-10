import { FaqsContent } from "@/components/faqs-content"

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Frequently Asked Questions - Swadeshika",
  description: "Find answers to common questions about Swadeshika products, orders, shipping, and returns.",
}

/**
 * FAQ Page Component (Server Side)
 * 
 * Renders the FAQ page shell.
 * Uses "force-dynamic" to ensure it's treated as a dynamic route, 
 * resolving build issues with useSearchParams in the child client component.
 */
export default function FaqsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            name: "Frequently Asked Questions - Swadeshika",
            description: "Find answers to common questions about Swadeshika products and services.",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is Swadeshika ghee pure?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, our ghee is made from traditional Bilona method using A2 milk."
                }
              },
               {
                "@type": "Question",
                name: "How do I track my order?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can track your order from the 'My Orders' section in your account."
                }
              }
            ]
          })
        }}
      />
      <FaqsContent />
    </>
  )
}
