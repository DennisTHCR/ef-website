"use client"

import { useEffect, useRef, useState } from "react"

interface TeacherCardProps {
  id: string
  name: string
  quote: string
  subject?: string
  rating?: number
  level?: number
  onVote?: (cardId: string) => void
  onSelect?: () => void
  isSelected?: boolean
}

function teacherNameToWebString(teacherName: string): string {
  if (!teacherName || typeof teacherName !== "string") {
    return ""
  }

  // Convert to lowercase
  let webString = teacherName.toLowerCase()

  // Replace umlauts and other diacritical marks
  const charMap: Record<string, string> = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    ß: "ss",
    á: "a",
    à: "a",
    â: "a",
    ã: "a",
    å: "a",
    é: "e",
    è: "e",
    ê: "e",
    ë: "e",
    í: "i",
    ì: "i",
    î: "i",
    ï: "i",
    ó: "o",
    ò: "o",
    ô: "o",
    õ: "o",
    ú: "u",
    ù: "u",
    û: "u",
    ñ: "n",
    ç: "c",
  }

  // Replace diacritical marks
  for (const [key, value] of Object.entries(charMap)) {
    webString = webString.replace(new RegExp(key, "g"), value)
  }

  // Remove all remaining non-alphanumeric characters except hyphens and replace spaces with hyphens
  webString = webString.replace(/\s+/g, "-")

  // Remove any remaining non-alphanumeric characters (except hyphens)
  webString = webString.replace(/[^a-z0-9-]/g, "")

  // Remove multiple consecutive hyphens
  webString = webString.replace(/-+/g, "-")

  // Remove leading and trailing hyphens
  webString = webString.replace(/^-+|-+$/g, "")

  return webString
}

export default function TeacherCard({
  id,
  name,
  quote,
  subject,
  rating,
  level,
  onVote,
  onSelect,
  isSelected = false,
}: TeacherCardProps) {
  const nameRef = useRef<HTMLHeadingElement>(null)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const subjectRef = useRef<HTMLSpanElement>(null)
  const ratingRef = useRef<HTMLSpanElement>(null)
  const levelRef = useRef<HTMLSpanElement>(null)
  const [nameFontSize, setNameFontSize] = useState(24) // Default font size in pixels
  const [quoteFontSize, setQuoteFontSize] = useState(18) // Default font size in pixels
  const [subjectFontSize, setSubjectFontSize] = useState(14) // Default font size in pixels
  const [ratingFontSize, setRatingFontSize] = useState(14)
  const [levelFontSize, setLevelFontSize] = useState(14)
  const [imageError, setImageError] = useState(false)

  // Function to adjust text size to fit container
  const adjustTextSize = () => {
    // Adjust name font size
    if (nameRef.current) {
      const nameContainer = nameRef.current.parentElement
      if (nameContainer) {
        const containerWidth = nameContainer.clientWidth
        const containerHeight = nameContainer.clientHeight
        let fontSize = 24 // Start with default size

        nameRef.current.style.fontSize = `${fontSize}px`

        // Reduce font size until text fits within container
        while (
          (nameRef.current.scrollWidth > containerWidth || nameRef.current.scrollHeight > containerHeight) &&
          fontSize > 10
        ) {
          fontSize -= 1
          nameRef.current.style.fontSize = `${fontSize}px`
        }

        setNameFontSize(fontSize)
      }
    }

    // Adjust quote font size
    if (quoteRef.current) {
      const quoteContainer = quoteRef.current.parentElement
      if (quoteContainer) {
        const containerWidth = quoteContainer.clientWidth
        const containerHeight = quoteContainer.clientHeight
        let fontSize = 18 // Start with default size

        quoteRef.current.style.fontSize = `${fontSize}px`

        // Reduce font size until text fits within container
        while (
          (quoteRef.current.scrollWidth > containerWidth || quoteRef.current.scrollHeight > containerHeight) &&
          fontSize > 8
        ) {
          fontSize -= 1
          quoteRef.current.style.fontSize = `${fontSize}px`
        }

        setQuoteFontSize(fontSize)
      }
    }

    // Adjust subject font size
    if (subjectRef.current && subject) {
      const subjectContainer = subjectRef.current.parentElement
      if (subjectContainer) {
        const containerStyles = window.getComputedStyle(subjectContainer)
        const paddingLeft = Number.parseFloat(containerStyles.paddingLeft)
        const paddingRight = Number.parseFloat(containerStyles.paddingRight)

        const containerWidth = subjectContainer.clientWidth - paddingLeft - paddingRight
        let fontSize = 14 // Start with default size

        subjectRef.current.style.fontSize = `${fontSize}px`

        // Reduce font size until text fits within container
        while (subjectRef.current.scrollWidth > containerWidth && fontSize > 8) {
          fontSize -= 1
          subjectRef.current.style.fontSize = `${fontSize}px`
        }

        setSubjectFontSize(fontSize)
      }
    }

    // Adjust rating font size
    if (ratingRef.current && rating !== undefined) {
      const ratingContainer = ratingRef.current.parentElement
      if (ratingContainer) {
        const containerStyles = window.getComputedStyle(ratingContainer)
        const paddingLeft = Number.parseFloat(containerStyles.paddingLeft)
        const paddingRight = Number.parseFloat(containerStyles.paddingRight)

        const containerWidth = ratingContainer.clientWidth - paddingLeft - paddingRight
        let fontSize = 14 // Start with default size

        ratingRef.current.style.fontSize = `${fontSize}px`

        // Reduce font size until text fits within container
        while (ratingRef.current.scrollWidth > containerWidth && fontSize > 8) {
          fontSize -= 1
          ratingRef.current.style.fontSize = `${fontSize}px`
        }

        setRatingFontSize(fontSize)
      }
    }

    // Adjust level font size
    if (levelRef.current && level !== undefined) {
      const levelContainer = levelRef.current.parentElement
      if (levelContainer) {
        const containerStyles = window.getComputedStyle(levelContainer)
        const paddingLeft = Number.parseFloat(containerStyles.paddingLeft)
        const paddingRight = Number.parseFloat(containerStyles.paddingRight)

        const containerWidth = levelContainer.clientWidth - paddingLeft - paddingRight
        let fontSize = 14 // Start with default size

        levelRef.current.style.fontSize = `${fontSize}px`

        // Reduce font size until text fits within container
        while (levelRef.current.scrollWidth > containerWidth && fontSize > 8) {
          fontSize -= 1
          levelRef.current.style.fontSize = `${fontSize}px`
        }

        setLevelFontSize(fontSize)
      }
    }
  }

  // Handle image load error
  const handleImageError = () => {
    setImageError(true)
  }

  // Adjust text size on initial render and when content changes
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      adjustTextSize()
    }, 0)

    // Also adjust on window resize
    window.addEventListener("resize", adjustTextSize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", adjustTextSize)
    }
  }, [name, quote, subject, rating, level, imageError])

  const handleClick = () => {
    if (onVote) {
      onVote(id)
    } else if (onSelect) {
      onSelect()
    }
  }

  // Fixed card dimensions
  const CARD_WIDTH = 320 // pixels
  const CARD_HEIGHT = 448 // pixels (based on 2.5:3.5 aspect ratio)

  return (
    <div
      className={`bg-[#f7e8d4] rounded-3xl p-3 border-2 ${
        isSelected ? "border-red-500 border-4" : "border-black"
      } shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-5px] hover:translate-x-[-5px] transition-all duration-200 cursor-pointer`}
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
      }}
      onClick={handleClick}
    >
      <div className="flex flex-col h-full">
        {/* Name section - fixed height */}
        <div className="h-[64px] flex items-center justify-center mb-2 px-2">
          <h2
            ref={nameRef}
            className="font-bold font-pixel w-full text-center overflow-hidden"
            style={{ fontSize: `${nameFontSize}px` }}
          >
            {name}
            {level ? ` x${level}` : ""}
          </h2>
        </div>

        {/* Image container - fixed square dimensions */}
        <div className="relative w-full h-[280px] bg-[#d9d9d9] mb-3 overflow-hidden border border-black">
          {!imageError ? (
            <img
              src={`https://cdn.kswofficial.fr/quotemon_images/${teacherNameToWebString(name)}.png`}
              alt={name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#d9d9d9]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-1/2 h-1/2 text-gray-400"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}

          {/* Subject tag positioned at bottom left of image with dynamic text sizing */}
          {subject && (
            <div
              className="absolute bottom-1 left-1 bg-[#ffe3b2] px-2 py-1 border border-black inline-flex items-center justify-center"
              style={{ maxWidth: "40%" }}
            >
              <span
                ref={subjectRef}
                className="font-pixel block text-center overflow-hidden"
                style={{ fontSize: `${subjectFontSize}px` }}
              >
                {subject}
              </span>
            </div>
          )}

          {/* Rating tag positioned at bottom right of image */}
          {rating !== undefined && (
            <div
              className="absolute bottom-1 right-1 bg-[#ffb2b2] px-2 py-1 border border-black inline-flex items-center justify-center"
              style={{ maxWidth: "40%" }}
            >
              <span
                ref={ratingRef}
                className="font-pixel block text-center overflow-hidden"
                style={{ fontSize: `${ratingFontSize}px` }}
              >
                {rating} HP
              </span>
            </div>
          )}
        </div>

        {/* Quote section - fixed height */}
        <div className="h-[80px] flex items-center justify-center px-2">
          <p
            ref={quoteRef}
            className="text-center font-bold font-pixel w-full overflow-hidden"
            style={{ fontSize: `${quoteFontSize}px` }}
          >
            {quote}
          </p>
        </div>
      </div>
    </div>
  )
}
