"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"
import TeacherCard from "@/components/teacher-card"
import PageBackground from "@/components/page-background"
import { useAuth } from "@/contexts/auth-context"

interface NewCard {
  type: string
  teacherName: string
  subject: string
  quote: string
}

export default function NewCardsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [newCards, setNewCards] = useState<NewCard[]>([])
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Get new cards from localStorage (set after opening a pack)
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated && !isLoading) {
      const storedCards = localStorage.getItem("newCards")
      if (storedCards) {
        try {
          setNewCards(JSON.parse(storedCards))
          // Clear the stored cards after retrieving them
          localStorage.removeItem("newCards")
        } catch (error) {
          console.error("Failed to parse new cards:", error)
        }
      } else {
        // If no new cards in storage, redirect to home
        router.push("/")
      }
    }
  }, [router, isAuthenticated, isLoading])

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return null // Don't render anything while checking auth or redirecting
  }

  return (
    <PageBackground>
      <main className="min-h-screen flex flex-col">
        <Header />

        <div className="flex-1 p-4">
          <div className="bg-[#fffdd0]/90 backdrop-blur-sm p-6 rounded-lg border-2 border-black">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold font-pixel mb-4">NEW CARDS!</h1>
              <p className="font-pixel">You just unpacked these new teacher cards!</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {newCards.map((card, index) => (
                <TeacherCard
                  key={index}
                  id={card.type}
                  name={card.teacherName}
                  quote={card.quote}
                  subject={card.subject}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#f7e8d4] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-pixel"
              >
                BACK TO HOME
              </Link>
            </div>
          </div>
        </div>
      </main>
    </PageBackground>
  )
}
