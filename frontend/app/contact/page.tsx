import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ShopHeader } from "@/components/shop-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/contact-form"
import { Phone, Mail, Clock, MapPin, MessageCircle, Instagram, Twitter, Facebook } from "lucide-react"

export const metadata = {
  title: "Contact Us - Swadeshika",
  description: "Get in touch with Swadeshika in Jodhpur. We're here to help with orders, products, and any questions.",
}

const contactInfo = [
  {
    icon: <Phone className="h-6 w-6 text-[#2D5F3F]" />,
    title: "Phone",
    description: "+91 73000 39429",
    link: "tel:+917300039429"
  },
  {
    icon: <Phone className="h-6 w-6 text-[#2D5F3F]" />,
    title: "Phone (Alternate)",
    description: "+91 81509 76411",
    link: "tel:+918150976411"
  },
  {
    icon: <Mail className="h-6 w-6 text-[#2D5F3F]" />,
    title: "Email",
    description: "official.swadeshika@gmail.com",
    link: "mailto:official.swadeshika@gmail.com"
  },
  {
    icon: <Clock className="h-6 w-6 text-[#2D5F3F]" />,
    title: "Working Hours",
    description: "Mon - Sat: 9:00 AM - 6:00 PM",
    extra: "Closed on Sundays & Public Holidays"
  },
  {
    icon: <MapPin className="h-6 w-6 text-[#2D5F3F]" />,
    title: "Visit Us",
    description: "98, 99 Swavalamban Kendra, Karni Nagar",
    extra: "Kudi - Madhuban Main Link Road, Jodhpur, Rajasthan",
    link: "https://maps.google.com?q=Swadeshika+Jodhpur"
  }
]

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <ShopHeader title="Contact Us" description="Visit us in Jodhpur! Have questions or feedback? We'd love to hear from you. Our team is here to help with any inquiries." />
          {/* Contact Grid */}
          <div className="grid lg:grid-cols-3 mt-8 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl border-2 border-[#E8DCC8] overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageCircle className="h-6 w-6 text-[#2D5F3F]" />
                    <h2 className="text-2xl font-semibold text-[#6B4423]">Send us a message</h2>
                  </div>
                  <ContactForm />
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-white rounded-2xl border-2 border-[#E8DCC8] overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#6B4423] mb-4">Find us on the map</h3>
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d856.3281976213816!2d73.02497082846641!3d26.225860501610864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39418b0073aabd59%3A0xcde004111bdf411c!2sSwadeshika!5e1!3m2!1sen!2sin!4v1761985008215!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-6">
                <CardHeader>
                  <CardTitle className="text-[#6B4423]">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 flex items-start pt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#6B4423]">{item.title}</h4>
                        {item.link ? (
                          <a
                            href={item.link}
                            className="text-[#8B6F47] hover:text-[#6B4423] transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.description}
                          </a>
                        ) : (
                          <p className="text-[#8B6F47]">{item.description}</p>
                        )}
                        {item.extra && <p className="text-sm text-[#8B6F47]">{item.extra}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-2 border-[#E8DCC8] bg-white py-6">
                <CardHeader>
                  <CardTitle className="text-[#6B4423]">Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <a
                      href="https://www.instagram.com/swadeshika.official?igsh=MzU3YTd0aWxkMHZy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B6F47] hover:text-[#6B4423] transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                    
                    <a
                      href="https://www.facebook.com/share/19ZcPQy7N5/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B6F47] hover:text-[#6B4423] transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-6 w-6" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-[#F5F1E8] p-6 rounded-2xl border-2 border-[#E8DCC8]">
                <h3 className="font-semibold text-[#6B4423] mb-2">Need help with an order?</h3>
                <p className="text-sm text-[#8B6F47] mb-4">Check our <a href="/faqs" className="text-[#2D5F3F] hover:underline">FAQs</a> for quick answers to common questions about orders, shipping, and returns.</p>
                <a
                  href="/faqs"
                  className="inline-flex items-center text-sm font-medium text-[#2D5F3F] hover:underline"
                >
                  Visit Help Center
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
