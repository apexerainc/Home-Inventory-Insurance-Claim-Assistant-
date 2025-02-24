import type React from "react"
import "@/app/globals.css"
import { Montserrat, Inter, IBM_Plex_Mono } from "next/font/google"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
})

export const metadata = {
  title: "AI Home Inventory Analyzer",
  description: "Get instant valuation for your home inventory using AI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${inter.variable} ${ibmPlexMono.variable} font-sans`}>{children}</body>
    </html>
  )
}



import './globals.css'