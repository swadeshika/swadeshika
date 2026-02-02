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
  return <FaqsContent />
}
