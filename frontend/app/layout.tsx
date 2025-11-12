import type React from "react"
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
  title: "Swadeshika - Premium Ghee, Spices & Dry Fruits",
  description:
    "Shop authentic Indian ghee, premium spices, and fresh dry fruits. Traditional quality meets modern convenience.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppinsSans.className} ${poppinsSerif.variable} antialiased`}>
        <ScrollToTop />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
