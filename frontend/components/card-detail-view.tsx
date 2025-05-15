"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import TeacherCard from "./teacher-card"
import { toast } from "sonner"

interface CardDetailViewProps {
  card: {
    id: string
    type: string
    level: number
    teacherName: string
    subject: string
    quote: string
    season?: {
      id: number
      name: string
    }
  }
  onClose: () => void
  onCardSold: (cardId: string, completelyRemoved: boolean) => void
}

export default function CardDetailView({ card, onClose, onCardSold }: CardDetailViewProps) {
  const isMobile = useIsMobile()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSellingCard, setIsSellingCard] = useState(false)

  // Calculate coin value for selling one level of the card
  // Base value of 10 coins per level
  const coinValue = 10

  // Determine what will happen after selling
  const willBeRemoved = card.level === 1
  const newLevel = card.level - 1

  const handleSellClick = () => {
    setShowConfirmation(true)
  }

  const handleCancelSell = () => {
    setShowConfirmation(false)
  }

  const handleConfirmSell = async () => {
    setIsSellingCard(true)
    try {
      // This is where we would call the API to sell the card
      // await sellCard(card.id)

      // For now, we'll simulate the API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success(`Card level reduced and received ${coinValue} coins!`)
      setShowConfirmation(false)
      onCardSold(card.id, willBeRemoved)
    } catch (error) {
      console.error("Error selling card:", error)
      toast.error("Failed to sell card. Please try again.")
    } finally {
      setIsSellingCard(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`bg-[#fffdd0] border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
          ${isMobile ? "w-full max-w-md flex flex-col overflow-y-auto max-h-[90vh]" : "w-full max-w-4xl flex flex-row"}`}
      >
        {/* Close button - positioned absolutely in the top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#ffd080] hover:bg-[#ffb060] border-2 border-black rounded-full w-12 h-12 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all z-10"
          aria-label="Close card details"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Card container - centered for both mobile and desktop */}
        {isMobile ? (
          <div className="pt-16 pb-6 px-4 flex justify-center">
            <div className="transform scale-90 origin-top">
              <TeacherCard
                id={card.id}
                name={card.teacherName}
                quote={card.quote}
                subject={card.subject}
                level={card.level}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 flex-shrink-0 flex justify-center items-center">
            <TeacherCard
              id={card.id}
              name={card.teacherName}
              quote={card.quote}
              subject={card.subject}
              level={card.level}
            />
          </div>
        )}

        {/* Card details - below on mobile, right side on desktop */}
        <div
          className={`${isMobile ? "p-6 pt-2" : "p-8 flex-1"} bg-[#ffe3b2] border-t-4 md:border-t-0 md:border-l-4 border-black rounded-b-lg md:rounded-b-none md:rounded-r-lg`}
        >
          <h2 className="text-2xl md:text-3xl font-bold font-pixel mb-4 md:mb-6 text-center md:text-left">
            CARD DETAILS
          </h2>

          <div className="space-y-3 md:space-y-4">
            <div>
              <h3 className="text-lg md:text-xl font-bold font-pixel mb-1">TEACHER</h3>
              <p className="text-base md:text-lg font-pixel">{card.teacherName}</p>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold font-pixel mb-1">SUBJECT</h3>
              <p className="text-base md:text-lg font-pixel">{card.subject || "Unknown"}</p>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold font-pixel mb-1">QUOTE</h3>
              <p className="text-base md:text-lg font-pixel">"{card.quote}"</p>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold font-pixel mb-1">LEVEL</h3>
              <p className="text-base md:text-lg font-pixel">x{card.level}</p>
            </div>

            {card.season && (
              <div>
                <h3 className="text-lg md:text-xl font-bold font-pixel mb-1">SEASON</h3>
                <p className="text-base md:text-lg font-pixel">{card.season.name}</p>
              </div>
            )}

            {/* Sell value information */}
            <div className="mt-2 pt-3 border-t-2 border-black">
              <h3 className="text-lg md:text-xl font-bold font-pixel mb-1">SELL VALUE (1 CARD)</h3>
              <p className="text-base md:text-lg font-pixel">{coinValue} COINS</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className={`mt-6 flex ${isMobile ? "flex-col" : "flex-row"} gap-3 justify-center md:justify-start`}>
            {/* Sell button */}
            <button
              onClick={handleSellClick}
              disabled={isSellingCard || showConfirmation}
              className="px-6 py-3 bg-[#ffb2b2] hover:bg-[#ff9090] border-2 border-black font-pixel shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SELL 1 CARD
            </button>

            {/* Back button - always visible */}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#ffd080] hover:bg-[#ffb060] border-2 border-black font-pixel shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-base"
            >
              BACK TO DECK
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#fffdd0] border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold font-pixel mb-4 text-center">CONFIRM SALE</h3>

            <div className="mb-6 text-center">
              <p className="text-lg font-pixel mb-4">Are you sure you want to sell one card?</p>
              <p className="text-lg font-pixel font-bold">You will receive {coinValue} coins.</p>

              {/* Warning about what happens */}
              <div className="mt-4 p-3 bg-[#ffd080] border-2 border-black">
                <p className="text-base font-pixel">
                  {willBeRemoved
                    ? "This is the last card! It will be removed from your deck."
                    : `The card's level will decrease from x${card.level} to x${newLevel}.`}
                </p>
              </div>

              <p className="text-sm font-pixel mt-4 text-red-600">This action cannot be undone!</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleConfirmSell}
                disabled={isSellingCard}
                className="px-6 py-3 bg-[#ffb2b2] hover:bg-[#ff9090] border-2 border-black font-pixel shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-base disabled:opacity-50 flex items-center justify-center"
              >
                {isSellingCard ? "SELLING..." : "CONFIRM SELL"}
              </button>

              <button
                onClick={handleCancelSell}
                disabled={isSellingCard}
                className="px-6 py-3 bg-[#ffe3b2] hover:bg-[#ffd080] border-2 border-black font-pixel shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-base"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

