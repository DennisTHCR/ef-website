"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import TeacherCard from "@/components/teacher-card"
import Leaderboard from "@/components/leaderboard"
import { getBattleCards, voteOnBattle } from "@/utils/api-service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface BattleCard {
  type: string
  teacherName: string
  subject: string
  quote: string
}

export default function Home() {
  const [cards, setCards] = useState<{ card1: BattleCard | null; card2: BattleCard | null }>({
    card1: null,
    card2: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [cardHeights, setCardHeights] = useState<{ [key: string]: number }>({})
  const [maxCardHeight, setMaxCardHeight] = useState<number | null>(null)

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch battle cards when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchBattleCards()
    }
  }, [isAuthenticated, authLoading])

  // Calculate max card height
  useEffect(() => {
    if (Object.keys(cardHeights).length > 0) {
      const maxHeight = Math.max(...Object.values(cardHeights))
      setMaxCardHeight(maxHeight)
    }
  }, [cardHeights])

  async function fetchBattleCards() {
    setIsLoading(true)
    try {
      const data = await getBattleCards()
      setCards({
        card1: data.card1,
        card2: data.card2,
      })
      // Reset card heights when new cards are loaded
      setCardHeights({})
      setMaxCardHeight(null)
    } catch (error) {
      console.error("Failed to fetch battle cards:", error)
      toast.error("Failed to load teacher cards. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVote(winnerId: string) {
    if (!cards.card1 || !cards.card2) return

    setIsVoting(true)
    try {
      await voteOnBattle(cards.card1.type, cards.card2.type, winnerId)
      toast.success("Vote recorded successfully!")

      // Fetch new cards for the next battle
      fetchBattleCards()
    } catch (error) {
      console.error("Failed to vote:", error)
      toast.error("Failed to record your vote. Please try again.")
    } finally {
      setIsVoting(false)
    }
  }

  const handleCardHeightChange = (cardId: string, height: number) => {
    setCardHeights((prev) => ({
      ...prev,
      [cardId]: height,
    }))
  }

  // Don't render anything while checking authentication or redirecting
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return null
  }

  return (
    <main className="min-h-screen bg-[#fffcb2] flex flex-col">
      <Header />

      <div className="flex h-full min-h-full flex-col md:flex-row flex-1">
        {/* Main Content */}
        <div className="flex-1 p-4 h-full min-h-full flex flex-col md:flex-row flex-wrap justify-evenly items-stretch gap-6 content-evenly">
          {isLoading ? (
            <div className="font-pixel text-2xl">LOADING TEACHERS...</div>
          ) : (
            <>
              {cards.card1 && (
                <TeacherCard
                  id={cards.card1.type}
                  name={cards.card1.teacherName}
                  quote={cards.card1.quote}
                  subject={cards.card1.subject}
                  onVote={isVoting ? undefined : handleVote}
                  cardHeight={maxCardHeight || undefined}
                  onHeightChange={(height) => handleCardHeightChange(cards.card1.type, height)}
                />
              )}
              {cards.card2 && (
                <TeacherCard
                  id={cards.card2.type}
                  name={cards.card2.teacherName}
                  quote={cards.card2.quote}
                  subject={cards.card2.subject}
                  onVote={isVoting ? undefined : handleVote}
                  cardHeight={maxCardHeight || undefined}
                  onHeightChange={(height) => handleCardHeightChange(cards.card2.type, height)}
                />
              )}
            </>
          )}
        </div>

        {/* Leaderboard Sidebar - only visible on very wide screens */}
        <div className="hidden 2xl:block border-l-2 border-black w-[32rem]">
          <Leaderboard />
        </div>
      </div>
    </main>
  )
}
