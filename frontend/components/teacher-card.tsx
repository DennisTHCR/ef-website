"use client"

import { useEffect, useRef, useState } from "react"

interface TeacherCardProps {
  id: string
  name: string
  quote: string
  subject?: string
  onVote?: (cardId: string) => void
  onSelect?: () => void
  isSelected?: boolean
  cardHeight?: number
  onHeightChange?: (height: number) => void
}

function teacherNameToWebString(teacherName: string): string {
  if (!teacherName || typeof teacherName !== 'string') {
    return '';
  }

  // Convert to lowercase
  let webString = teacherName.toLowerCase();

  // Replace umlauts and other diacritical marks
  const charMap: Record<string, string> = {
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
    'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'å': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u',
    'ñ': 'n', 'ç': 'c'
  };

  // Replace diacritical marks
  for (const [key, value] of Object.entries(charMap)) {
    webString = webString.replace(new RegExp(key, 'g'), value);
  }

  // Remove all remaining non-alphanumeric characters except hyphens and replace spaces with hyphens
  webString = webString.replace(/\s+/g, '-');

  // Remove any remaining non-alphanumeric characters (except hyphens)
  webString = webString.replace(/[^a-z0-9-]/g, '');

  // Remove multiple consecutive hyphens
  webString = webString.replace(/-+/g, '-');

  // Remove leading and trailing hyphens
  webString = webString.replace(/^-+|-+$/g, '');

  return webString;
}

export default function TeacherCard({
  id,
  name,
  quote,
  subject,
  onVote,
  onSelect,
  isSelected = false,
  cardHeight,
  onHeightChange,
}: TeacherCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null)

  // Measure the natural height of the card
  useEffect(() => {
    if (cardRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height
          setNaturalHeight(height)
          if (onHeightChange) {
            onHeightChange(height)
          }
        }
      })

      observer.observe(cardRef.current)
      return () => observer.disconnect()
    }
  }, [quote, onHeightChange])

  const handleClick = () => {
    if (onVote) {
      onVote(id)
    } else if (onSelect) {
      onSelect()
    }
  }

  return (
    <div
      ref={cardRef}
      className={`h-full bg-[#f7e8d4] rounded-3xl p-3 border-2 ${isSelected ? "border-red-500 border-4" : "border-black"} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-[320px] flex flex-col cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow`}
      onClick={handleClick}
    >
      <div className="p-2 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-2 font-pixel">{name}</h2>
        {subject && (
          <div className="bg-[#ffe3b2] px-2 py-1 mb-2 border border-black inline-block self-start">
            <span className="font-pixel text-sm">{subject}</span>
          </div>
        )}
        <div className="bg-[#d9d9d9] w-full h-36 mb-3 overflow-hidden">
          <img src={`https://kswofficial.fr/images/${teacherNameToWebString(name)}.jpg`} />
        </div>
        <p className="text-lg text-center font-bold font-pixel">{quote}</p>
      </div>
    </div>
  )
}
