"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { getTopTrainers } from "@/utils/api-service"
import { toast } from "sonner"

interface Trainer {
  id: string
  username: string
  rating: number
}

export default function CreateTradePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(true)
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch top trainers
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchTopTrainers()
    }
  }, [isAuthenticated, isLoading])

  async function fetchTopTrainers() {
    setIsLoadingTrainers(true)
    try {
      const data = await getTopTrainers(20)
      // Filter out the current user
      const filteredTrainers = (data.trainers || []).filter((trainer: Trainer) => trainer.id !== user?.id)
      setTrainers(filteredTrainers)
    } catch (error) {
      console.error("Failed to fetch top trainers:", error)
      toast.error("Failed to load trainers. Please try again.")
    } finally {
      setIsLoadingTrainers(false)
    }
  }

  function handleCreateTrade(trainerId: string) {
    router.push(`/create-trade/${trainerId}`)
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  return (
    <main className="min-h-screen bg-[#fffcb2] flex flex-col">
      <Header />

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        <div className="bg-[#fffcb2] border-2 border-black">
          <div className="p-4 border-b-2 border-black">
            <h2 className="text-4xl font-bold font-pixel text-center">SELECT TRAINER</h2>
          </div>

          {isLoadingTrainers ? (
            <div className="p-4 text-xl font-bold font-pixel text-center">LOADING TRAINERS...</div>
          ) : trainers.length > 0 ? (
            <div className="divide-y-2 divide-black">
              {trainers.map((trainer) => (
                <div key={trainer.id} className="p-4 flex justify-between items-center">
                  <div className="font-pixel text-xl">{trainer.username}</div>
                  <button
                    onClick={() => handleCreateTrade(trainer.id)}
                    className="px-4 py-2 bg-[#f7e8d4] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-pixel"
                  >
                    TRADE
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-xl font-bold font-pixel text-center">NO TRAINERS FOUND</div>
          )}
        </div>
      </div>
    </main>
  )
}
