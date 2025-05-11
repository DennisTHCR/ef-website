import type React from "react"
import type { Metadata } from "next"
import { Press_Start_2P } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel",
})

export const metadata: Metadata = {
  title: "Quotemon",
  description: "Retro Pixel-Style Lehrerzitat Bewertungsplatform",
  icons: {
    icon: '/favicon.png',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} bg-[#fffdd0]`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "var(--font-pixel)",
                background: "#f7e8d4",
                border: "2px solid black",
                color: "black",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
