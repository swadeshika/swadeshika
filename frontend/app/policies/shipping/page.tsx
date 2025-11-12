import { Clock, Truck, MapPin, CheckCircle, XCircle, Info } from "lucide-react"
import { PolicyPage } from "@/components/policy-page"

export const metadata = {
  title: "Shipping Policy - Swadeshika",
  description: "Comprehensive information about our shipping methods, delivery times, and order tracking.",
  keywords: ["shipping policy", "delivery information", "order tracking", "shipping rates", "international shipping"]
}

const sections = [
  {
    title: "Order Processing",
    icon: <Clock className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We strive to process all orders as quickly as possible. Here's what you can expect:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>Orders placed before 2:00 PM IST are processed the same business day (Monday-Friday).</li>
          <li>Orders placed after 2:00 PM IST or on weekends will be processed the next business day.</li>
          <li>You will receive an order confirmation email with your order details once your order is placed.</li>
          <li>Once processed, you'll receive a shipping confirmation with tracking information.</li>
        </ul>
      </div>
    )
  },
  {
    title: "Domestic Shipping",
    icon: <Truck className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We offer reliable shipping services across India with the following options:</p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-[#F5F1E8]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B4423] uppercase tracking-wider">Service</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B4423] uppercase tracking-wider">Delivery Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B4423] uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC8]">
              <tr>
                <td className="px-4 py-3 text-sm text-[#6B4423]">Standard Shipping</td>
                <td className="px-4 py-3 text-sm text-[#6B4423]">5-7 business days</td>
                <td className="px-4 py-3 text-sm text-[#6B4423]">Free on orders over ₹999</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-[#6B4423]">Express Shipping</td>
                <td className="px-4 py-3 text-sm text-[#6B4423]">2-3 business days</td>
                <td className="px-4 py-3 text-sm text-[#6B4423]">₹99</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    title: "International Shipping",
    icon: <MapPin className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>We currently offer international shipping to select countries. Please note:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>International orders typically take 7-14 business days for delivery.</li>
          <li>Customs and import duties may apply and are the responsibility of the recipient.</li>
          <li>Shipping costs are calculated at checkout based on destination and package weight.</li>
          <li>For international returns, please contact our customer support team.</li>
        </ul>
      </div>
    )
  },
  {
    title: "Order Tracking",
    icon: <CheckCircle className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Track your order with these simple steps:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Click on the tracking link in your shipping confirmation email.</li>
          <li>Enter your tracking number on our website's tracking page.</li>
          <li>View real-time updates on your order's journey.</li>
        </ol>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">Having trouble tracking your order? Contact our support team with your order number for assistance.</p>
        </div>
      </div>
    )
  },
  {
    title: "Shipping Restrictions",
    icon: <XCircle className="h-5 w-5 text-[#2D5F3F]" />,
    content: (
      <div className="space-y-4">
        <p>Please be aware of the following restrictions:</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>We do not ship to P.O. Boxes or APO/FPO addresses.</li>
          <li>Some remote areas may have limited shipping options.</li>
          <li>Certain items may have specific shipping requirements or restrictions.</li>
          <li>We reserve the right to cancel any order that violates our shipping policies.</li>
        </ul>
      </div>
    )
  }
]

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      description="We're committed to delivering your order as quickly and efficiently as possible. 
      Please review our shipping policy for detailed information about delivery times, 
      shipping methods, and order tracking."
      sections={sections}
      helpTitle="Need Help with Shipping?"
      helpDescription="If you have any questions about our shipping policy or need assistance with your order, our customer service team is here to help."
      showTrackOrder={true}
    />
  )
}
