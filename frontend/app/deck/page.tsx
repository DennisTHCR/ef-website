"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { getUserCards, getCardByType } from "@/utils/api-service"
import TeacherCard from "@/components/teacher-card"
import { toast } from "sonner"

interface DealtCard {
  id: string
  type: string
  level: number
}

interface CardDetails {
  type: string
  teacherName: string
  subject: string
  quote: string
}

interface CardWithDetails {
  id: string
  type: string
  level: number
  teacherName: string
  subject: string
  quote: string
}

export default function DeckPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [cards, setCards] = useState<CardWithDetails[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(true)
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
      // Get the user's dealt cards
      const data = await getUserCards()
      const dealtCards: DealtCard[] = data.cards || []

      // Fetch details for each card by type
      const cardsWithDetails: CardWithDetails[] = []

      for (const card of dealtCards) {
        try {
          const cardDetails = await getCardByType(card.type)
          cardsWithDetails.push({
            id: card.id,
            type: card.type,
            level: card.level,
            teacherName: cardDetails.card.teacherName,
            subject: cardDetails.card.subject,
            quote: cardDetails.card.quote,
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

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  return (
    <main className="min-h-screen bg-[#fffdd0] flex flex-col">
      <Header />

      <div className="flex-1 p-4">
        <h1 className="text-4xl font-bold font-pixel text-center mb-8">YOUR DECK</h1>

        {isLoadingCards ? (
          <div className="text-center font-pixel text-2xl p-8">LOADING CARDS...</div>
        ) : cards.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6">
            {cards.map((card) => (
              <TeacherCard
                key={card.id}
                id={card.id}
                name={card.teacherName}
                quote={card.quote}
                subject={card.subject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center font-pixel text-2xl p-8">NO CARDS IN YOUR DECK</div>
        )}
      </div>
    </main>
  )
}
