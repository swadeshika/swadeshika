import { Shield, User, Lock, Mail, Server, EyeOff, ShieldCheck } from "lucide-react"
import { PolicyPage } from "@/components/policy-page"

export const metadata = {
  title: "Privacy Policy - Swadeshika",
  description: "Learn how we collect, use, and protect your personal information in accordance with data protection regulations.",
  keywords: ["privacy policy", "data protection", "personal information", "GDPR", "CCPA", "data security"]
}

const sections = [
  {
    title: "Introduction",
    icon: <Shield className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>At Swadeshika, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.</p>
        <p>By using our website or providing us with your personal information, you agree to the terms of this Privacy Policy.</p>
      </div>
    )
  },
  {
    title: "Information We Collect",
    icon: <User className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We may collect the following types of information:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Personal Information:</strong> Name, email address, phone number, shipping/billing address</li>
          <li><strong>Account Information:</strong> Username, password, profile information</li>
          <li><strong>Order Information:</strong> Purchase history, payment details, shipping preferences</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
          <li><strong>Usage Data:</strong> Pages visited, time spent on site, clickstream data</li>
        </ul>
      </div>
    )
  },
  {
    title: "How We Use Your Information",
    icon: <Server className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We use your information for the following purposes:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Process and fulfill your orders</li>
          <li>Provide customer support and respond to inquiries</li>
          <li>Improve our products, services, and website functionality</li>
          <li>Send promotional emails and marketing communications (with your consent)</li>
          <li>Prevent fraud and enhance security</li>
          <li>Comply with legal obligations</li>
        </ul>
      </div>
    )
  },
  {
    title: "Data Security",
    icon: <Lock className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>SSL/TLS encryption for data transmission</li>
          <li>Secure servers with restricted access</li>
          <li>Regular security assessments and updates</li>
          <li>Employee training on data protection</li>
        </ul>
        <p className="text-sm text-gray-600">While we strive to protect your personal information, no method of transmission over the internet is 100% secure.</p>
      </div>
    )
  },
  {
    title: "Your Rights",
    icon: <ShieldCheck className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>You have the following rights regarding your personal information:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Update or correct your information</li>
          <li><strong>Erasure:</strong> Request deletion of your data</li>
          <li><strong>Restriction:</strong> Limit how we use your data</li>
          <li><strong>Portability:</strong> Request transfer of your data</li>
          <li><strong>Objection:</strong> Opt-out of certain data uses</li>
        </ul>
        <p>To exercise these rights, please contact us using the information below.</p>
      </div>
    )
  },
  {
    title: "Cookies and Tracking",
    icon: <EyeOff className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We use cookies and similar technologies to:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Remember your preferences and settings</li>
          <li>Analyze website traffic and usage patterns</li>
          <li>Deliver targeted advertisements</li>
          <li>Improve website functionality</li>
        </ul>
        <p>You can manage your cookie preferences through your browser settings or our cookie consent banner.</p>
      </div>
    )
  },
  {
    title: "Third-Party Services",
    icon: <Server className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We may share your information with trusted third parties, including:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Payment processors for transaction processing</li>
          <li>Shipping carriers for order fulfillment</li>
          <li>Marketing platforms for promotional communications</li>
          <li>Analytics providers for website improvement</li>
        </ul>
        <p>We only share the minimum necessary information and ensure third parties comply with data protection standards.</p>
      </div>
    )
  },
  {
    title: "Children's Privacy",
    icon: <User className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Our website is not intended for children under the age of 16. We do not knowingly collect personal information from children without parental consent.</p>
        <p>If you believe we have collected information from a child, please contact us immediately.</p>
      </div>
    )
  },
  {
    title: "Changes to This Policy",
    icon: <Shield className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
        <p>We encourage you to review this Privacy Policy periodically for any changes.</p>
      </div>
    )
  },
  {
    title: "Contact Us",
    icon: <Mail className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Email:</strong> privacy@swadeshika.com</li>
          <li><strong>Phone:</strong> +91 XXXXXXXXXX</li>
          <li><strong>Address:</strong> [Your Company Address]</li>
        </ul>
        <p className="text-sm text-gray-600">Last Updated: November 1, 2025</p>
      </div>
    )
  }
]

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      description="We are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data."
      sections={sections}
      helpTitle="Questions About Your Privacy?"
      helpDescription="If you have any questions about our privacy practices or your personal information, please don't hesitate to contact our privacy team."
      showTrackOrder={false}
    />
  )
}
