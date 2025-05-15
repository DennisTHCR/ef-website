"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import TeacherCard from "@/components/teacher-card"
import Leaderboard from "@/components/leaderboard"
import PageBackground from "@/components/page-background"
import { getBattleCards, getTopRankedCards, getUserProfile, voteOnBattle } from "@/utils/api-service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface BattleCard {
  type: string
  teacherName: string
  subject: string
  quote: string
  rating: number
}

interface LeaderboardCard {
  type: string
  teacherName: string
  subject: string
}

interface UserProfile {
  votes: number
  maxVotes: number
}

export default function Home() {
  const [cards, setCards] = useState<{ card1: BattleCard | null; card2: BattleCard | null }>({
    card1: null,
    card2: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [topCards, setTopCards] = useState<LeaderboardCard[]>()
  const [isLeaderLoading, setIsLeaderLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [cardHeights, setCardHeights] = useState<{ [key: string]: number }>({})
  const [maxCardHeight, setMaxCardHeight] = useState<number | null>(null)
  const [remainingVotes, setRemainingVotes] = useState<number | null>(null)

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
      fetchRemainingVotes()
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
      const data = await getTopRankedCards(10)
      setTopCards(data.leaderboard || [])
      setIsLeaderLoading(false)
    } catch (error) {
      console.error("Failed to fetch top cards:", error)
    }

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

      // Refetch the remaining votes after voting
      fetchRemainingVotes()
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

  async function fetchRemainingVotes() {
    try {
      // Fetch profile data from the auth/profile endpoint
      const profileData: UserProfile = (await getUserProfile()).user;

      // Calculate remaining votes
      const remaining = profileData.maxVotes - profileData.votes
      setRemainingVotes(remaining)
    } catch (error) {
      console.error("Failed to fetch remaining votes:", error)
      toast.error("Failed to load vote count. Please refresh the page.")
    }
  }

  // Don't render anything while checking authentication or redirecting
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return null
  }

  return (
    <PageBackground>
      {/* Main container div that takes up 100vh and 100vw */}
      <div className="h-screen w-screen max-h-screen max-w-screen overflow-hidden flex flex-col">
        {/* Header in a separate div */}
        <Header className="flex-shrink-0" />

        {/* Votes counter */}
        <div className="flex justify-center items-center py-2 bg-black/10 backdrop-blur-sm">
          <div className="font-pixel text-lg flex items-center gap-2">
            <span>VOTES REMAINING:</span>
            <span className="bg-white/80 px-3 py-1 rounded-md text-xl min-w-[3rem] text-center">
              {remainingVotes !== null ? remainingVotes : "..."}
            </span>
          </div>
        </div>

        {/* Content div with game on left and leaderboard on right */}
        <div className="flex flex-1 min-h-0">
          {/* Game area (left side) */}
          <div className="flex-1 p-4 flex flex-col md:flex-row flex-wrap justify-evenly items-stretch gap-6 content-evenly overflow-auto min-h-0 min-w-0">
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
                    rating={cards.card1.rating}
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
                    rating={cards.card2.rating}
                  />
                )}
              </>
            )}
          </div>

          {/* Leaderboard (right side) - only visible on very wide screens */}
          <div className="hidden 2xl:block border-l-2 border-black w-[32rem] min-h-0 flex-shrink-0 bg-[#fffdd0]/80 backdrop-blur-sm">
            <Leaderboard topCards={topCards || []} isLoading={isLeaderLoading} className="h-full" />
          </div>
        </div>
      </div>
    </PageBackground>
  )
}

