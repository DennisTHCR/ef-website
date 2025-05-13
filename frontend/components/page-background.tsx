"use client"

import Image from "next/image"
import type { ReactNode } from "react"

interface PageBackgroundProps {
  children: ReactNode
  className?: string
}

export default function PageBackground({ children, className = "" }: PageBackgroundProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/pixel-building.png"
          alt="Pixel art background"
          fill
          className="object-cover filter blur-[2px]"
          priority
        />
      </div>

      {/* Semi-transparent overlay to improve readability */}
      <div className="absolute inset-0 bg-black/20 z-10"></div>

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </div>
  )
}
