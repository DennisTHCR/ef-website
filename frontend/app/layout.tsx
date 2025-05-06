import type React from "react"
import type { Metadata } from "next"
import { Press_Start_2P } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

// Properly import the Press Start 2P font
const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel",
})

export const metadata: Metadata = {
  title: "Teachemone",
  description: "A retro pixel-style teacher rating platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} bg-[#fffcb2]`}>
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
