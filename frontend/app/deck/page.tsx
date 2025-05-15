"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import CollapsibleHeader from "@/components/collapsible-header"
import PageBackground from "@/components/page-background"
import { useAuth } from "@/contexts/auth-context"
import { getUserCards, getCardByType, getAllSeasons } from "@/utils/api-service"
import TeacherCard from "@/components/teacher-card"
import CardDetailView from "@/components/card-detail-view"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface DealtCard {
  id: string
  type: string
  level: number
  season?: {
    id: number
  }
}

interface CardDetails {
  type: string
  teacherName: string
  subject: string
  quote: string
  season?: {
    id: number
  }
}

interface Season {
  id: number
  name: string
}

interface CardWithDetails {
  id: string
  type: string
  level: number
  teacherName: string
  subject: string
  quote: string
  season: Season
}

export default function DeckPage() {
  const { isAuthenticated, isLoading, refreshUserData } = useAuth()
  const [cards, setCards] = useState<CardWithDetails[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(true)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null)
  const [showAllCards, setShowAllCards] = useState(false)
  const [showSeasonOptions, setShowSeasonOptions] = useState(true)
  const [selectedCard, setSelectedCard] = useState<CardWithDetails | null>(null)
  const router = useRouter()
  const isMobile = useIsMobile()
  const seasonScrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch user's cards
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchUserCards()
    }
  }, [isAuthenticated, isLoading])

  async function fetchUserCards() {
    setIsLoadingCards(true)
    try {
      // Get all seasons first
      const seasonsData = await getAllSeasons()
      const allSeasons: Season[] = seasonsData.seasons || []

      // Sort seasons by ID in descending order (newest first)
      allSeasons.sort((a, b) => b.id - a.id)
      setSeasons(allSeasons)

      // Get the user's dealt cards
      const data = await getUserCards()
      const dealtCards: DealtCard[] = data.cards || []

      console.log("Fetched cards:", dealtCards)

      if (dealtCards.length === 0) {
        setIsLoadingCards(false)
        return
      }

      // Fetch details for each card by type
      const cardsWithDetails: CardWithDetails[] = []

      for (const card of dealtCards) {
        try {
          // Get card details
          const cardDetails = (await getCardByType(card.type)).card
          console.log(`Card details for ${card.type}:`, cardDetails)

          // Get the season ID from either the card or card details
          const seasonId = card.season?.id || cardDetails.season?.id || 0

          // Find season from the already fetched seasons
          const season = allSeasons.find((s) => s.id === seasonId) || {
            id: seasonId,
            name: "Unknown Season",
          }

          cardsWithDetails.push({
            id: card.id,
            type: card.type,
            level: card.level,
            teacherName: cardDetails.teacherName,
            subject: cardDetails.subject,
            quote: cardDetails.quote,
            season: season,
          })
        } catch (error) {
          console.error(`Failed to fetch details for card type ${card.type}:`, error)
        }
      }

      console.log("Cards with details:", cardsWithDetails)
      setCards(cardsWithDetails)

      // Set the most recent season as the default selected season
      if (allSeasons.length > 0 && selectedSeasonId === null) {
        // Find the season with the most cards
        const seasonCounts = new Map<number, number>()
        cardsWithDetails.forEach((card) => {
          const count = seasonCounts.get(card.season.id) || 0
          seasonCounts.set(card.season.id, count + 1)
        })

        let mostPopulatedSeasonId = allSeasons[0].id
        let maxCount = 0

        seasonCounts.forEach((count, seasonId) => {
          if (count > maxCount) {
            maxCount = count
            mostPopulatedSeasonId = seasonId
          }
        })

        setSelectedSeasonId(mostPopulatedSeasonId)
      }
    } catch (error) {
      console.error("Failed to fetch user cards:", error)
      toast.error("Failed to load your cards. Please try again.")
    } finally {
      setIsLoadingCards(false)
    }
  }

  // Filter cards by selected season
  const getFilteredCards = () => {
    if (showAllCards || selectedSeasonId === null) return cards

    const filtered = cards.filter((card) => card.season.id === selectedSeasonId)

    // If filtering results in zero cards, show all cards
    if (filtered.length === 0 && cards.length > 0) {
      return cards
    }

    return filtered
  }

  // Sort cards by teacher name and type
  const getSortedCards = (cardsToSort: CardWithDetails[]) => {
    return [...cardsToSort].sort((a, b) => {
      // First sort by teacher name
      const teacherCompare = a.teacherName.localeCompare(b.teacherName)
      if (teacherCompare !== 0) return teacherCompare

      // If same teacher, sort by type
      return a.type.localeCompare(b.type)
    })
  }

  // Handle season selection change
  const handleSeasonChange = (seasonId: number) => {
    setSelectedSeasonId(seasonId)
    setShowAllCards(false)
  }

  // Handle showing all cards
  const handleShowAllCards = () => {
    setShowAllCards(true)
    setSelectedSeasonId(null)
  }

  // Toggle season options visibility (desktop only)
  const toggleSeasonOptions = () => {
    setShowSeasonOptions(!showSeasonOptions)
  }

  // Handle card selection for detail view
  const handleCardSelect = (card: CardWithDetails) => {
    setSelectedCard(card)
  }

  // Close card detail view
  const closeCardDetail = () => {
    setSelectedCard(null)
  }

  // Handle card sold event
  const handleCardSold = async () => {
    setSelectedCard(null)
    await fetchUserCards() // Refresh the cards list
    if (refreshUserData) {
      await refreshUserData() // Refresh user data to update coin count
    }
  }

  // Get card count for each season
  const getSeasonCardCount = (seasonId: number) => {
    return cards.filter((card) => card.season.id === seasonId).length
  }

  // Get current filter description
  const getCurrentFilterDescription = () => {
    if (showAllCards) {
      return `All Seasons (${cards.length})`
    } else if (selectedSeasonId !== null) {
      const seasonName = seasons.find((s) => s.id === selectedSeasonId)?.name
      return `${seasonName} (${getSeasonCardCount(selectedSeasonId)})`
    }
    return "Select Season"
  }

  // Scroll to selected season button
  useEffect(() => {
    if (isMobile && seasonScrollRef.current && selectedSeasonId !== null && !showAllCards) {
      const selectedButton = seasonScrollRef.current.querySelector(
        `[data-season-id="${selectedSeasonId}"]`,
      ) as HTMLElement
      if (selectedButton) {
        const scrollContainer = seasonScrollRef.current
        const buttonLeft = selectedButton.offsetLeft
        const containerWidth = scrollContainer.clientWidth
        const scrollPosition = buttonLeft - containerWidth / 2 + selectedButton.offsetWidth / 2

        scrollContainer.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        })
      }
    }
  }, [isMobile, selectedSeasonId, showAllCards])

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  const filteredCards = getFilteredCards()
  const sortedCards = getSortedCards(filteredCards)

  return (
    <PageBackground>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Use the CollapsibleHeader component */}
        <CollapsibleHeader />

        {/* Fixed content area with scrollable cards */}
        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          <div
            className={`${isMobile ? "" : "bg-[#fffdd0]/90 backdrop-blur-sm p-6 rounded-lg border-2 border-black"} flex flex-col h-full`}
          >
            {/* Fixed title and season selector */}
            <div className="flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <h1
                  className={`font-bold font-pixel text-center ${isMobile ? "text-3xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : "text-4xl"}`}
                >
                  YOUR DECK
                </h1>

                {/* Show/Hide Filters button - desktop only */}
                {!isMobile && (
                  <button
                    onClick={toggleSeasonOptions}
                    className="px-4 py-2 font-pixel text-sm border-2 border-black bg-[#ffe3b2] hover:bg-[#ffd080] transition-all flex items-center gap-2 w-auto justify-center"
                    aria-expanded={showSeasonOptions}
                    aria-controls="season-options"
                  >
                    <span>{showSeasonOptions ? "Hide" : "Show"} Filters</span>
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
                      className={`transition-transform ${showSeasonOptions ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                )}
              </div>

              {/* Season selector - always visible on mobile, collapsible on desktop */}
              <div
                id="season-options"
                className={`${
                  !isMobile && !showSeasonOptions
                    ? "max-h-0 overflow-hidden"
                    : isMobile
                      ? "max-h-[300px]"
                      : "max-h-[300px] overflow-hidden"
                } transition-all duration-300`}
              >
                {/* Mobile scrollable seasons - always visible */}
                {isMobile && (
                  <div
                    ref={seasonScrollRef}
                    className="flex overflow-x-auto pb-3 hide-scrollbar snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    <div className="flex gap-2 px-2">
                      <button
                        onClick={handleShowAllCards}
                        className={`px-3 py-2 font-pixel text-sm border-2 border-black transition-all whitespace-nowrap snap-center ${
                          showAllCards
                            ? "bg-[#ffd080] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            : "bg-[#ffe3b2] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        }`}
                      >
                        All Seasons ({cards.length})
                      </button>

                      {seasons.map((season) => (
                        <button
                          key={season.id}
                          data-season-id={season.id}
                          onClick={() => handleSeasonChange(season.id)}
                          className={`px-3 py-2 font-pixel text-sm border-2 border-black transition-all whitespace-nowrap snap-center ${
                            selectedSeasonId === season.id && !showAllCards
                              ? "bg-[#ffd080] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              : "bg-[#ffe3b2] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                          }`}
                        >
                          {season.name} ({getSeasonCardCount(season.id)})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desktop seasons */}
                {!isMobile && (
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    <button
                      onClick={handleShowAllCards}
                      className={`px-3 py-2 font-pixel text-sm border-2 border-black transition-all ${
                        showAllCards
                          ? "bg-[#ffd080] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-[#ffe3b2] hover:bg-[#ffd080] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      }`}
                    >
                      All Seasons ({cards.length})
                    </button>

                    {seasons.map((season) => (
                      <button
                        key={season.id}
                        onClick={() => handleSeasonChange(season.id)}
                        className={`px-3 py-2 font-pixel text-sm border-2 border-black transition-all ${
                          selectedSeasonId === season.id && !showAllCards
                            ? "bg-[#ffd080] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            : "bg-[#ffe3b2] hover:bg-[#ffd080] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        }`}
                      >
                        {season.name} ({getSeasonCardCount(season.id)})
                      </button>
                    ))}
                  </div>
                )}

                {/* Filter description - show on both mobile and desktop */}
                <div
                  className={`text-center font-pixel text-sm mb-3 ${isMobile ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]" : ""}`}
                >
                  {showAllCards ? (
                    <span>Showing all {cards.length} cards</span>
                  ) : selectedSeasonId !== null ? (
                    <span>
                      Showing {filteredCards.length} cards from {seasons.find((s) => s.id === selectedSeasonId)?.name}
                    </span>
                  ) : (
                    <span>Select a season to filter your cards</span>
                  )}
                </div>
              </div>

              {/* Current filter indicator - only shown when options are hidden on desktop */}
              {!isMobile && !showSeasonOptions && (
                <div className="flex justify-center mb-4">
                  <div className="text-center font-pixel text-sm border-2 border-black bg-[#ffd080] py-2 px-4 inline-block">
                    {getCurrentFilterDescription()}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable cards area */}
            <div ref={contentRef} className={`flex-1 overflow-y-auto mt-2 ${isMobile ? "pr-0" : "pr-2"}`}>
              {isLoadingCards ? (
                <div
                  className={`text-center font-pixel text-2xl p-8 ${isMobile ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : ""}`}
                >
                  LOADING CARDS...
                </div>
              ) : sortedCards.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4 pb-4">
                  {sortedCards.map((card) => (
                    <div key={card.id} onClick={() => handleCardSelect(card)} className="cursor-pointer">
                      <TeacherCard
                        id={card.id}
                        name={card.teacherName}
                        quote={card.quote}
                        subject={card.subject}
                        level={card.level}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`text-center font-pixel text-2xl p-8 ${isMobile ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : ""}`}
                >
                  {cards.length > 0 ? "NO CARDS FROM THIS SEASON IN YOUR DECK" : "NO CARDS IN YOUR DECK"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Detail Modal */}
        {selectedCard && <CardDetailView card={selectedCard} onClose={closeCardDetail} onCardSold={handleCardSold} />}
      </div>
    </PageBackground>
  )
}
