"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface PageBackgroundProps {
  children: ReactNode
  className?: string
}

export default function PageBackground({ children, className = "" }: PageBackgroundProps) {
  const isMobile = useIsMobile()

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Fixed Background Image - shown on both mobile and desktop */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/pixel-building.png"
          alt="Pixel art Kanti school building"
          fill
          className={`object-cover ${!isMobile ? "filter blur-[2px]" : ""}`}
          priority
        />
      </div>

      {/* Semi-transparent overlay to improve readability */}
      <div className="fixed inset-0 bg-black/20 z-10"></div>

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </div>
  )
}
