"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Header from "@/components/header"
import { useIsMobile } from "@/hooks/use-mobile"

export default function CollapsibleHeader() {
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const [isExpanded, setIsExpanded] = useState(false)

  // Reset expanded state when navigating between pages
  useEffect(() => {
    setIsExpanded(false)
  }, [pathname])

  // On desktop, just render the normal header
  if (!isMobile) {
    return <Header />
  }

  // For mobile home page
  if (isHomePage) {
    // If expanded, show the full header
    if (isExpanded) {
      return <Header />
    }

    // If collapsed, show the collapsed header with up arrow
    return (
      <button
        className="w-full bg-[#fffcb2] border-b-2 border-black p-2 flex justify-center items-center"
        onClick={() => setIsExpanded(true)}
      >
        <div className="font-pixel text-sm flex items-center gap-2">
          <span>QUOTEMON</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>
      </button>
    )
  }

  // For all other pages on mobile
  return (
    <button
      className="w-full bg-[#fffcb2] border-b-2 border-black p-2 flex justify-center items-center"
      onClick={() => router.push("/")}
    >
      <div className="font-pixel text-sm flex items-center gap-2">
        <span>QUOTEMON</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
    </button>
  )
}
