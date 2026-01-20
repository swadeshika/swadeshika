import { FileText, BookOpen, Shield, AlertTriangle, CreditCard, Truck, User, Mail, RefreshCw } from "lucide-react"
import { PolicyPage } from "@/components/policy-page"

export const metadata = {
  title: "Terms & Conditions - Swadeshika",
  description: "Please read these Terms and Conditions carefully before using our website and services.",
  keywords: ["terms and conditions", "terms of service", "user agreement", "website terms", "legal"]
}

const sections = [
  {
    title: "Introduction",
    icon: <FileText className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Welcome to Swadeshika. These Terms and Conditions outline the rules and regulations for the use of our website and services.</p>
        <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use Swadeshika if you do not agree to all of the terms and conditions stated on this page.</p>
      </div>
    )
  },
  {
    title: "Intellectual Property",
    icon: <BookOpen className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Unless otherwise stated, Swadeshika and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved.</p>
        <p>You may view and/or print pages from swadeshika.com for your own personal use subject to restrictions set in these terms and conditions.</p>
        <p>You must not:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Republish material from this website</li>
          <li>Sell, rent, or sub-license material from the website</li>
          <li>Reproduce, duplicate, or copy material from the website</li>
          <li>Redistribute content from Swadeshika (unless content is specifically made for redistribution)</li>
        </ul>
      </div>
    )
  },
  {
    title: "User Account",
    icon: <User className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account and password.</p>
        <p>You agree to:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Keep your password secure and confidential</li>
          <li>Not share your account credentials with others</li>
          <li>Immediately notify us of any unauthorized use of your account</li>
          <li>Be responsible for all activities that occur under your account</li>
        </ul>
      </div>
    )
  },
  {
    title: "Product Information",
    icon: <Shield className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the website. However, we do not guarantee that the product descriptions, colors, or other content available on the website are accurate, complete, reliable, current, or free of errors.</p>
        <p>All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason.</p>
      </div>
    )
  },
  {
    title: "Pricing and Payment",
    icon: <CreditCard className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>All prices are shown in Indian Rupees (₹) and are inclusive of all taxes unless otherwise stated. We reserve the right to modify prices at any time without prior notice.</p>
        <p>We accept various payment methods including credit/debit cards, UPI, and net banking. By providing your payment information, you represent and warrant that you have the legal right to use the payment method.</p>
        <p>In case of payment failure, we reserve the right to cancel your order.</p>
      </div>
    )
  },
  {
    title: "Shipping and Delivery",
    icon: <Truck className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Shipping costs and delivery times may vary depending on your location and the shipping method selected. Please refer to our Shipping Policy for detailed information.</p>
        <p>Risk of loss and title for items purchased from this website pass to you upon delivery of the items to the carrier.</p>
        <p>We are not responsible for any customs and duties applied to your order. All fees imposed during or after shipping are the responsibility of the customer.</p>
      </div>
    )
  },
  {
    title: "Returns and Refunds",
    icon: <RefreshCw className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Please review our Return & Refund Policy for detailed information about our return and refund process.</p>
        <p>We accept returns within 7 days of delivery for eligible items. Items must be unused, in their original packaging, and in the same condition as received.</p>
        <p>Refunds will be processed to the original payment method within 3-5 business days after we receive and inspect the returned item.</p>
      </div>
    )
  },
  {
    title: "Limitation of Liability",
    icon: <AlertTriangle className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>In no event shall Swadeshika, nor any of its officers, directors, and employees, be liable for anything arising out of or in any way connected with your use of this website, whether such liability is under contract, tort, or otherwise.</p>
        <p>Swadeshika, including its officers, directors, and employees shall not be liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this website.</p>
      </div>
    )
  },
  {
    title: "Governing Law & Jurisdiction",
    icon: <Shield className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>These terms and conditions are governed by and construed in accordance with the laws of India, and you submit to the non-exclusive jurisdiction of the courts located in India for the resolution of any disputes.</p>
      </div>
    )
  },
  {
    title: "Changes to Terms",
    icon: <AlertTriangle className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We reserve the right to modify these terms and conditions at any time. You should check this page periodically for changes. Your continued use of the website following the posting of changes to these terms will be deemed your acceptance of those changes.</p>
      </div>
    )
  },
  {
    title: "Contact Us",
    icon: <Mail className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>If you have any questions about these Terms and Conditions, please contact us:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Email:</strong> official.swadeshika@gmail.com</li>
          <li><strong>Phone:</strong> +91 7300039429, +91 8150976411</li>
          <li><strong>Address:</strong> 98, 99 Swavalamban Kendra, Karni Nagar, Kudi - Madhuban Main Link Road, Near Kisan Gas Godam, Jodhpur</li>
        </ul>
        <p className="text-sm text-gray-600">Last Updated: November 1, 2025</p>
      </div>
    )
  }
]

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      description="Please read these Terms and Conditions carefully before using our website and services. By accessing or using our website, you agree to be bound by these terms."
      sections={sections}
      helpTitle="Have Questions About Our Terms?"
      helpDescription="If you have any questions or concerns about our Terms and Conditions, please don't hesitate to contact our legal team."
      showTrackOrder={false}
    />
  )
}
