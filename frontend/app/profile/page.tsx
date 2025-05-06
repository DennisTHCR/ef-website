"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, getTopTrainers } from "@/utils/api-service"

interface UserProfile {
  id: string
  username: string
  coins: number
  rating: number
  rank?: number
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch profile data
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      fetchProfileData()
    }
  }, [isAuthenticated, user, isLoading])

  async function fetchProfileData() {
    setIsLoadingProfile(true)
    try {
      // Get user profile
      const profileData = await getUserProfile()

      // Get top trainers to determine rank
      const trainersData = await getTopTrainers(100)
      const trainers = trainersData.trainers || []

      // Find user's rank
      const userRank = trainers.findIndex((trainer) => trainer.id === user?.id) + 1

      setProfile({
        ...profileData.user,
        rank: userRank > 0 ? userRank : undefined,
      })
    } catch (error) {
      console.error("Failed to fetch profile data:", error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  return (
    <main className="min-h-screen bg-[#fffcb2] flex flex-col">
      <Header />

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {isLoadingProfile ? (
          <div className="text-center font-pixel text-2xl p-8">LOADING PROFILE...</div>
        ) : profile ? (
          <div className="bg-[#fffcb2] border-2 border-black">
            <div className="p-4 border-b-2 border-black">
              <h2 className="text-4xl font-bold font-pixel text-center">PROFILE</h2>
            </div>

            <div className="divide-y-2 divide-black">
              <div className="p-4 text-xl font-bold font-pixel">NAME: {profile.username}</div>
              {profile.rank && (
                <div className="p-4 text-xl font-bold font-pixel">
                  RANK: {profile.rank}
                  {getOrdinalSuffix(profile.rank)}
                </div>
              )}
              <div className="p-4 text-xl font-bold font-pixel">RATING: {profile.rating}</div>
              <div className="p-4 text-xl font-bold font-pixel">COINS: {profile.coins}</div>
            </div>
          </div>
        ) : (
          <div className="text-center font-pixel text-2xl p-8">PROFILE NOT FOUND</div>
        )}
      </div>
    </main>
  )
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(n: number): string {
  const s = ["TH", "ST", "ND", "RD"]
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
