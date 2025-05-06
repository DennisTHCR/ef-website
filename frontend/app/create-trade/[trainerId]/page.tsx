"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "@/components/header"
import TeacherCard from "@/components/teacher-card"
import { useAuth } from "@/contexts/auth-context"
import { getUserCards, getCardByType, getTrainerCards, createTradeOffer } from "@/utils/api-service"
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

export default function TradeWithTrainerPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const trainerId = params?.trainerId as string

  const [userCards, setUserCards] = useState<CardWithDetails[]>([])
  const [trainerCards, setTrainerCards] = useState<CardWithDetails[]>([])
  const [selectedUserCard, setSelectedUserCard] = useState<string | null>(null)
  const [selectedTrainerCard, setSelectedTrainerCard] = useState<string | null>(null)
  const [isLoadingCards, setIsLoadingCards] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cardHeights, setCardHeights] = useState<{ [key: string]: number }>({})
  const [maxCardHeight, setMaxCardHeight] = useState<number | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch cards when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && trainerId) {
      fetchCards()
    }
  }, [isAuthenticated, isLoading, trainerId])

  // Calculate max card height
  useEffect(() => {
    if (Object.keys(cardHeights).length > 0) {
      const maxHeight = Math.max(...Object.values(cardHeights))
      setMaxCardHeight(maxHeight)
    }
  }, [cardHeights])

  async function fetchCards() {
    setIsLoadingCards(true)
    try {
      // Get the user's dealt cards
      const userCardsData = await getUserCards()
      const userDealtCards: DealtCard[] = userCardsData.cards || []

      // Get the trainer's dealt cards
      const trainerCardsData = await getTrainerCards(trainerId)
      const trainerDealtCards: DealtCard[] = trainerCardsData.cards || []

      // Fetch details for each user card
      const userCardsWithDetails: CardWithDetails[] = []
      for (const card of userDealtCards) {
        try {
          const cardDetails = await getCardByType(card.type)
          userCardsWithDetails.push({
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

      // Fetch details for each trainer card
      const trainerCardsWithDetails: CardWithDetails[] = []
      for (const card of trainerDealtCards) {
        try {
          const cardDetails = await getCardByType(card.type)
          trainerCardsWithDetails.push({
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

      setUserCards(userCardsWithDetails)
      setTrainerCards(trainerCardsWithDetails)
    } catch (error) {
      console.error("Failed to fetch cards:", error)
      toast.error("Failed to load cards. Please try again.")
    } finally {
      setIsLoadingCards(false)
    }
  }

  async function handleSubmitTrade() {
    if (!selectedUserCard || !selectedTrainerCard) {
      toast.error("Please select cards to trade")
      return
    }

    setIsSubmitting(true)
    try {
      await createTradeOffer(selectedUserCard, selectedTrainerCard)
      toast.success("Trade offer created successfully!")
      router.push("/trade-offers")
    } catch (error) {
      console.error("Failed to create trade offer:", error)
      toast.error("Failed to create trade offer. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCardHeightChange = (cardId: string, height: number) => {
    setCardHeights((prev) => ({
      ...prev,
      [cardId]: height,
    }))
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  return (
    <main className="min-h-screen bg-[#fffcb2] flex flex-col">
      <Header />

      <div className="flex-1 p-4">
        <h1 className="text-4xl font-bold font-pixel text-center mb-8">CREATE TRADE OFFER</h1>

        {isLoadingCards ? (
          <div className="text-center font-pixel text-2xl p-8">LOADING CARDS...</div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* User's section */}
            <div className="border-2 border-black p-4">
              <h2 className="text-2xl font-bold font-pixel mb-4">YOUR CARDS</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-pixel mb-2">YOUR DECK</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {userCards.map((card) => (
                      <TeacherCard
                        key={card.id}
                        id={card.id}
                        name={card.teacherName}
                        quote={card.quote}
                        subject={card.subject}
                        onSelect={() => setSelectedUserCard(card.id)}
                        isSelected={selectedUserCard === card.id}
                        cardHeight={maxCardHeight || undefined}
                        onHeightChange={(height) => handleCardHeightChange(card.id, height)}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full md:w-[320px] flex items-center justify-center">
                  <div className="bg-[#f7e8d4] rounded-3xl p-3 border-2 border-black w-[320px] h-[420px] flex items-center justify-center">
                    {selectedUserCard ? (
                      <div className="font-pixel text-center">
                        <div className="text-xl mb-2">OFFERING</div>
                        {userCards.find((card) => card.id === selectedUserCard)?.teacherName}
                      </div>
                    ) : (
                      <div className="font-pixel text-center">SELECT A CARD TO OFFER</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Trainer's section */}
            <div className="border-2 border-black p-4">
              <h2 className="text-2xl font-bold font-pixel mb-4">TRAINER'S CARDS</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-pixel mb-2">TRAINER'S DECK</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {trainerCards.map((card) => (
                      <TeacherCard
                        key={card.id}
                        id={card.id}
                        name={card.teacherName}
                        quote={card.quote}
                        subject={card.subject}
                        onSelect={() => setSelectedTrainerCard(card.id)}
                        isSelected={selectedTrainerCard === card.id}
                        cardHeight={maxCardHeight || undefined}
                        onHeightChange={(height) => handleCardHeightChange(card.id, height)}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full md:w-[320px] flex items-center justify-center">
                  <div className="bg-[#f7e8d4] rounded-3xl p-3 border-2 border-black w-[320px] h-[420px] flex items-center justify-center">
                    {selectedTrainerCard ? (
                      <div className="font-pixel text-center">
                        <div className="text-xl mb-2">REQUESTING</div>
                        {trainerCards.find((card) => card.id === selectedTrainerCard)?.teacherName}
                      </div>
                    ) : (
                      <div className="font-pixel text-center">SELECT A CARD TO REQUEST</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleSubmitTrade}
                disabled={!selectedUserCard || !selectedTrainerCard || isSubmitting}
                className="px-6 py-3 bg-[#f7e8d4] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-pixel text-xl disabled:opacity-50"
              >
                {isSubmitting ? "CREATING OFFER..." : "CREATE TRADE OFFER"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
