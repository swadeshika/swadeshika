import { RefreshCw, CheckCircle, XCircle, Clock, CreditCard, AlertCircle, Mail, Truck } from "lucide-react"
import { PolicyPage } from "@/components/policy-page"

export const metadata = {
  title: "Refund Policy - Swadeshika",
  description: "Learn about our refund and return policies, including eligibility, timeframes, and how to initiate a return.",
  keywords: ["refund policy", "return policy", "money back guarantee", "refund process", "return items"]
}

const sections = [
  {
    title: "Our Refund Policy",
    icon: <RefreshCw className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>At Swadeshika, we want you to be completely satisfied with your purchase. If you're not entirely happy with your order, we're here to help with our straightforward refund and return policy.</p>
        <p>Please read this policy carefully to understand your rights and our obligations regarding refunds and returns.</p>
      </div>
    )
  },
  {
    title: "Eligibility for Returns & Refunds",
    icon: <CheckCircle className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>To be eligible for a return and refund, your item must meet the following criteria:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Item must be unused and in the same condition as received</li>
          <li>Original tags and packaging must be intact and undamaged</li>
          <li>Return must be initiated within 7 days of delivery</li>
          <li>Proof of purchase or order number is required</li>
          <li>Items must not be marked as final sale or non-returnable</li>
        </ul>
      </div>
    )
  },
  {
    title: "Non-Refundable Items",
    icon: <XCircle className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Certain items are not eligible for returns or refunds:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Personalized or custom-made products</li>
          <li>Items marked as final sale or clearance</li>
          <li>Gift cards and downloadable products</li>
          <li>Products that have been used, washed, or damaged after delivery</li>
          <li>Items without original packaging or tags</li>
        </ul>
      </div>
    )
  },
  {
    title: "Return Process",
    icon: <RefreshCw className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>To initiate a return, please follow these steps:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Contact our customer support team within 7 days of receiving your order</li>
          <li>Provide your order number and reason for return</li>
          <li>Wait for return approval and instructions</li>
          <li>Package the item securely with all original packaging and tags</li>
          <li>Ship the item back using the provided return label</li>
        </ol>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">We recommend using a trackable shipping service and purchasing shipping insurance for your return.</p>
        </div>
      </div>
    )
  },
  {
    title: "Refund Processing",
    icon: <Clock className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Once we receive your returned item, our team will inspect it and notify you of the status of your refund. Here's what you can expect:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Processing Time:</strong> 3-5 business days after we receive your return</li>
          <li><strong>Refund Method:</strong> Refund will be issued to your original payment method</li>
          <li><strong>Bank Processing:</strong> Additional 5-10 business days for the refund to appear in your account</li>
          <li><strong>Shipping Costs:</strong> Original shipping fees are non-refundable unless the return is due to our error</li>
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
        <p>To request an exchange, please contact our customer support team with your order details and the reason for exchange.</p>
      </div>
    )
  },
  {
    title: "Damaged or Defective Items",
    icon: <AlertCircle className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>If you receive a damaged or defective item, please contact us within 48 hours of delivery. We'll be happy to replace the item or issue a full refund, including return shipping costs.</p>
        <p>Please provide the following when reporting a damaged or defective item:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Order number</li>
          <li>Product name and SKU</li>
          <li>Clear photos of the damaged or defective item</li>
          <li>Description of the issue</li>
        </ul>
      </div>
    )
  },
  {
    title: "Late or Missing Refunds",
    icon: <CreditCard className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>If you haven't received your refund within the expected timeframe, please check the following before contacting us:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Check your bank account or credit card statement to confirm the refund hasn't been processed</li>
          <li>Contact your bank, as processing times can vary</li>
          <li>If you paid via PayPal, log in to your account to check the status</li>
        </ul>
        <p>If you've completed these steps and still haven't received your refund, please contact our customer support team for assistance.</p>
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
  },
  {
    title: "Contact Us",
    icon: <Mail className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>If you have any questions about our Refund Policy, please contact us:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Email:</strong> official.swadeshika@gmail.com</li>
          <li><strong>Phone:</strong> +91 7300039429, +91 8150976411</li>
          <li><strong>Business Hours:</strong> Monday to Saturday, 9:00 AM to 6:00 PM</li>
        </ul>
        <p className="text-sm text-gray-600">Last Updated: November 1, 2025</p>
      </div>
    )
  }
]

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      description="We want you to be completely satisfied with your purchase. Please review our refund policy for detailed information about eligibility, timeframes, and the return process."
      sections={sections}
      helpTitle="Need Help with a Return?"
      helpDescription="If you have any questions about our refund policy or need assistance with a return, our customer service team is here to help."
      showTrackOrder={true}
    />
  )
}
