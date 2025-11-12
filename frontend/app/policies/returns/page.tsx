import { RefreshCw, Package, CheckCircle, XCircle, Info, Clock, Truck } from "lucide-react"
import { PolicyPage } from "@/components/policy-page"

export const metadata = {
  title: "Return & Refund Policy - Swadeshika",
  description: "Learn about our return and refund policies, including eligibility, timeframes, and how to initiate a return.",
  keywords: ["return policy", "refund policy", "returns", "refunds", "exchange policy"]
}

const sections = [
  {
    title: "Return Eligibility",
    icon: <CheckCircle className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>To be eligible for a return, your item must meet the following criteria:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Items must be unused, unworn, and in their original condition with all tags attached</li>
          <li>Original packaging must be intact and undamaged</li>
          <li>Returns must be initiated within 7 days of receiving your order</li>
          <li>Proof of purchase or order number is required</li>
        </ul>
      </div>
    )
  },
  {
    title: "Non-Returnable Items",
    icon: <XCircle className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>The following items cannot be returned or exchanged:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Personalized or custom-made products</li>
          <li>Products marked as final sale or clearance</li>
          <li>Gift cards and downloadable products</li>
          <li>Items that have been used, washed, or damaged after delivery</li>
          <li>Products without original packaging or missing tags</li>
        </ul>
      </div>
    )
  },
  {
    title: "Return Process",
    icon: <RefreshCw className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Follow these steps to initiate a return:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Contact our customer support team within 7 days of receiving your order</li>
          <li>Provide your order number and reason for return</li>
          <li>Wait for return approval and instructions</li>
          <li>Package the item securely with all original packaging and tags</li>
          <li>Ship the item back using the provided return label</li>
        </ol>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">We recommend using a trackable shipping service and purchasing shipping insurance for your return.</p>
        </div>
      </div>
    )
  },
  {
    title: "Refund Information",
    icon: <Package className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Here's what you need to know about refunds:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Refunds are processed within 3-5 business days after we receive your return</li>
          <li>Original shipping fees are non-refundable</li>
          <li>Return shipping costs are the responsibility of the customer unless the return is due to our error</li>
          <li>Refunds will be issued to the original payment method used for purchase</li>
        </ul>
      </div>
    )
  },
  {
    title: "Exchanges",
    icon: <RefreshCw className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We currently offer exchanges for the following reasons:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Wrong size or color (subject to availability)</li>
          <li>Defective or damaged items (must be reported within 48 hours of delivery)</li>
          <li>Wrong item received</li>
        </ul>
        <p className="mt-4">To request an exchange, please contact our customer support team with your order details and the reason for exchange.</p>
      </div>
    )
  },
  {
    title: "Return Shipping",
    icon: <Truck className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Important information about return shipping:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Customers are responsible for return shipping costs unless the return is due to our error</li>
          <li>We recommend using a trackable shipping service</li>
          <li>Original shipping fees are non-refundable</li>
          <li>For international returns, please contact our support team for specific instructions</li>
        </ul>
      </div>
    )
  }
]

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      title="Return & Refund Policy"
      description="We want you to be completely satisfied with your purchase. Please review our return and refund policy for detailed information about eligibility, timeframes, and the return process."
      sections={sections}
      helpTitle="Need Help with Returns?"
      helpDescription="If you have any questions about our return policy or need assistance with a return, our customer service team is here to help."
      showTrackOrder={false}
    />
  )
}
