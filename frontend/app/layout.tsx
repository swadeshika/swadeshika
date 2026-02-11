import React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"
import "quill/dist/quill.snow.css"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Toaster } from "@/components/ui/toaster"
import { AuthInitializer } from "@/components/auth-initializer"

// Register Poppins for both sans and serif CSS variables so all text (including elements using `font-serif`) uses Poppins
const poppinsSans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
})

const poppinsSerif = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://swadeshika.in"),
  title: {
    default: "Swadeshika - Authentic Indian Ghee, Spices & Dry Fruits",
    template: "%s | Swadeshika",
  },
  description:
    "Shop authentic Indian ghee, premium spices, and fresh dry fruits from Swadeshika. Traditional quality meets modern convenience. Pure, Organic, and Healthy.",
  keywords: [
    "Swadeshika",
    "Ghee",
    "Desi Cow Ghee",
    "A2 Ghee",
    "Spices",
    "Organic Spices",
    "Dry Fruits",
    "Cold Pressed Oils",
    "Ayurvedic Products",
    "Indian Grocery",
    "Online Grocery India",
  ],
  authors: [{ name: "Swadeshika" }],
  creator: "Swadeshika",
  generator: "Next.js",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://swadeshika.in",
    title: "Swadeshika - Authentic Indian Ghee, Spices & Dry Fruits",
    description:
      "Shop authentic Indian ghee, premium spices, and fresh dry fruits. Traditional quality meets modern convenience.",
    siteName: "Swadeshika",
    images: [
      {
        url: "/og-image.jpg", // Ensure you have a default OG image at this path or update it
        width: 1200,
        height: 630,
        alt: "Swadeshika - Authentic Indian Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swadeshika - Authentic Indian Ghee, Spices & Dry Fruits",
    description:
      "Shop authentic Indian ghee, premium spices, and fresh dry fruits. Pure, Organic, and Healthy.",
    images: ["/og-image.jpg"],
    creator: "@swadeshika",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
             __html: JSON.stringify({
               "@context": "https://schema.org",
               "@type": "Organization",
               name: "Swadeshika",
               url: process.env.NEXT_PUBLIC_APP_URL || "https://swadeshika.in",
               logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://swadeshika.in"}/logo.png`,
               sameAs: [
                 "https://facebook.com/swadeshika",
                 "https://instagram.com/swadeshika",
                 "https://twitter.com/swadeshika"
               ],
               contactPoint: {
                 "@type": "ContactPoint",
                 telephone: "+91 7300039429, +91 8150976411",
                 contactType: "customer service"
               }
             })
          }}
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body className={`${poppinsSans.className} ${poppinsSerif.variable} antialiased`}>
        <AuthInitializer />
        <ScrollToTop />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
