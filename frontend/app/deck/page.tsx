"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { getUserCards, getCardByType, getAllSeasons } from "@/utils/api-service"
import TeacherCard from "@/components/teacher-card"
import { toast } from "sonner"

interface DealtCard {
  id: string
  type: string
  level: number
  season: {
    id: number
  }
}

interface CardDetails {
  type: string
  teacherName: string
  subject: string
  quote: string
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
  const { isAuthenticated, isLoading } = useAuth()
  const [cards, setCards] = useState<CardWithDetails[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(true)
  const [seasons, setSeasons] = useState<Season[]>([])
  const router = useRouter()

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
      setSeasons(allSeasons)

      // Get the user's dealt cards
      const data = await getUserCards()
      const dealtCards: DealtCard[] = data.cards || []

      // Fetch details for each card by type
      const cardsWithDetails: CardWithDetails[] = []

      for (const card of dealtCards) {
        try {
          // Get card details
          const cardDetails = (await getCardByType(card.type)).card

          // Find season from the already fetched seasons
          const season = allSeasons.find((s) => s.id === cardDetails.season.id) || {
            id: cardDetails.season.id,
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

      setCards(cardsWithDetails)
    } catch (error) {
      console.error("Failed to fetch user cards:", error)
      toast.error("Failed to load your cards. Please try again.")
    } finally {
      setIsLoadingCards(false)
    }
  }

  // Group cards by season
  const groupCardsBySeason = () => {
    const groupedCards: Record<string, CardWithDetails[]> = {}

    // Group cards by season
    cards.forEach((card) => {
      const seasonName = card.season?.name || "Unknown Season"
      if (!groupedCards[seasonName]) {
        groupedCards[seasonName] = []
      }
      groupedCards[seasonName].push(card)
    })

    // Sort cards within each season by teacher name
    Object.keys(groupedCards).forEach((seasonName) => {
      groupedCards[seasonName].sort((a, b) => {
        // First sort by teacher name
        const teacherCompare = a.teacherName.localeCompare(b.teacherName)
        if (teacherCompare !== 0) return teacherCompare

        // If same teacher, sort by type
        return a.type.localeCompare(b.type)
      })
    })

    return groupedCards
  }

  // Get seasons in descending order by ID (highest ID first)
  const getSortedSeasonNames = () => {
    const seasonMap = new Map<string, number>()

    cards.forEach((card) => {
      const seasonName = card.season?.name || "Unknown Season"
      const seasonId = card.season?.id || 0
      seasonMap.set(seasonName, seasonId)
    })

    return Array.from(seasonMap.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by ID in descending order
      .map((entry) => entry[0])
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  const groupedCards = groupCardsBySeason()
  const sortedSeasonNames = getSortedSeasonNames()

  return (
    <main className="min-h-screen bg-[#fffdd0] flex flex-col">
      <Header />

      <div className="flex-1 p-4">
        <h1 className="text-4xl font-bold font-pixel text-center mb-8">YOUR DECK</h1>

        {isLoadingCards ? (
          <div className="text-center font-pixel text-2xl p-8">LOADING CARDS...</div>
        ) : cards.length > 0 ? (
          <div className="space-y-12">
            {/* Display seasons in descending order by ID */}
            {sortedSeasonNames.map((seasonName) => (
              <div key={seasonName} className="space-y-4">
                <h2 className="text-3xl font-bold font-pixel text-center border-b-2 border-black pb-2">{seasonName}</h2>

                {/* Display all cards in this season, sorted by teacher */}
                <div className="flex flex-wrap justify-center gap-4">
                  {groupedCards[seasonName].map((card) => (
                    <TeacherCard
                      key={card.id}
                      id={card.id}
                      name={card.teacherName}
                      quote={card.quote}
                      subject={card.subject}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center font-pixel text-2xl p-8">NO CARDS IN YOUR DECK</div>
        )}
      </div>
    </main>
  )
}

