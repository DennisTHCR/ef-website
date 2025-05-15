"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface LeaderboardProps {
  isFullPage?: boolean
  topCards: LeaderboardCard[]
  isLoading: boolean
  hideHeader?: boolean
  className?: string
}

interface LeaderboardCard {
  type: string
  teacherName: string
  subject: string
}

export default function Leaderboard({
  isFullPage = false,
  topCards = [],
  isLoading = true,
  hideHeader = false,
  className = "",
}: LeaderboardProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [scrollInfo, setScrollInfo] = useState({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const isMobile = useIsMobile()

  // Handle scroll events to update scrubber position
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      setScrollInfo({ scrollTop, scrollHeight, clientHeight })
    }
  }

  // Calculate scrubber height and position
  const getScrubberHeight = () => {
    if (scrollInfo.scrollHeight <= scrollInfo.clientHeight) return "100%"
    const ratio = scrollInfo.clientHeight / scrollInfo.scrollHeight
    return `${ratio * 100}%`
  }

  const getScrubberPosition = () => {
    if (scrollInfo.scrollHeight <= scrollInfo.clientHeight) return 0
    const scrubberHeight = (scrollInfo.clientHeight / scrollInfo.scrollHeight) * scrollInfo.clientHeight
    const availableTrackSpace = scrollInfo.clientHeight - scrubberHeight
    const scrollRatio = scrollInfo.scrollTop / (scrollInfo.scrollHeight - scrollInfo.clientHeight)
    // Ensure the scrubber doesn't go beyond the bottom of the track
    return Math.min(scrollRatio * availableTrackSpace, scrollInfo.clientHeight - scrubberHeight)
  }

  // Handle scrubber drag events
  const handleScrubberMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !contentRef.current) return

    const trackRect = document.querySelector(".scrollbar-track")?.getBoundingClientRect()
    if (!trackRect) return

    // Calculate position relative to the track, not the content
    const relativeY = Math.max(0, Math.min(e.clientY - trackRect.top, trackRect.height))
    const scrollRatio = relativeY / trackRect.height

    // Calculate the new scroll position
    const maxScrollTop = scrollInfo.scrollHeight - scrollInfo.clientHeight
    const newScrollTop = scrollRatio * maxScrollTop

    // Apply scroll
    contentRef.current.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle click on track to scroll to that position
  const handleTrackClick = (e: React.MouseEvent) => {
    if (!contentRef.current) return

    // Don't process if clicking on the scrubber itself
    if ((e.target as HTMLElement).classList.contains("scrubber")) return

    const trackRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const relativeY = e.clientY - trackRect.top
    const scrollRatio = relativeY / trackRect.height

    const maxScrollTop = scrollInfo.scrollHeight - scrollInfo.clientHeight
    const newScrollTop = scrollRatio * maxScrollTop

    contentRef.current.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop))
  }

  // Add and remove event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, scrollInfo])

  // Initialize scroll info
  useEffect(() => {
    if (contentRef.current) {
      handleScroll()
    }
  }, [contentRef, topCards])

  return (
    <div
      className={`bg-[#ffe3b2] ${isFullPage ? "w-full max-w-4xl mx-auto" : "w-full"} flex flex-col h-full max-h-svh ${className}`}
    >
      {/* Header div containing the title - only show if hideHeader is false */}
      {!hideHeader && (
        <div className="bg-[#ffd080] p-4 border-b-2 border-black flex-shrink-0">
          {isMobile ? (
            <h2
              className="text-2xl font-bold font-pixel text-center"
              style={{
                letterSpacing: "-0.05em",
                paddingLeft: "0.5rem",
                paddingRight: "0.5rem",
              }}
            >
              LEADERBOARD
            </h2>
          ) : (
            <h2 className="text-4xl font-bold font-pixel text-center">LEADERBOARD</h2>
          )}
        </div>
      )}

      {/* Lower div that fills to the bottom of the page */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left div containing the scrollable content */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={contentRef}
            className="h-full divide-y-2 divide-black overflow-y-auto pr-4 no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            onScroll={handleScroll}
          >
            {isLoading ? (
              <div className="p-4 text-xl font-bold font-pixel">LOADING...</div>
            ) : topCards.length > 0 ? (
              topCards.map((card, index) => (
                <div key={index} className="p-4 font-bold font-pixel">
                  {isMobile ? (
                    <div>
                      <div className="text-xl">{card.teacherName}:</div>
                      <div className="text-xl">{card.subject}</div>
                    </div>
                  ) : (
                    <div className="text-xl">
                      {card.teacherName}: {card.subject}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-xl font-bold font-pixel">NO CARDS FOUND</div>
            )}
          </div>
        </div>

        {/* Right div containing the scrollbar */}
        <div className="w-4 border-l-2 border-black relative flex-shrink-0">
          <div className="scrollbar-track h-full w-full" onClick={handleTrackClick}>
            {/* Always show the scrollbar, even if content doesn't need scrolling */}
            <div
              className="scrubber absolute w-5/6 bg-[#ffd080] border border-black cursor-pointer left-1/2 -translate-x-1/2"
              style={{
                height: getScrubberHeight(),
                top: getScrubberPosition(),
              }}
              onMouseDown={handleScrubberMouseDown}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
