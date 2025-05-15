"use client"

import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"
import { usePathname } from "next/navigation"
import NavMenu from "./nav-menu"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { getCurrentSeason } from "@/utils/api-service"

export default function Header() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const { isAuthenticated, logout } = useAuth()
  const [seasonName, setSeasonName] = useState("")

  useEffect(() => {
    const fetchSeasonName = async () => {
      try {
        const data = await getCurrentSeason()
        if (data && data.season) {
          setSeasonName(data.season.name)
        }
      } catch (error) {
        console.error("Error fetching current season:", error)
      }
    }

    fetchSeasonName()
  }, [])

  return (
    <header className="flex justify-between items-center p-3 border-b-2 border-black bg-[#fffcb2]">
      <Link href="/" className="font-bold tracking-tight font-pixel max-w-[80%]">
        <div className="flex flex-col sm:flex-row sm:items-baseline">
          <span className="text-2xl md:text-4xl lg:text-5xl block">QUOTEMON</span>
          <div className="flex flex-row sm:ml-2">
            <span className="text-2xl md:text-4xl lg:text-5xl">KSW:</span>
            <span className="text-2xl md:text-4xl lg:text-5xl ml-2">SEASON</span>
          </div>
          <span className="text-2xl md:text-4xl lg:text-5xl block sm:ml-4">BUN</span>
        </div>
      </Link>

      {isHomePage ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated && (
            <>
              <Link
                href="/ai-info"
                className="py-2 px-3 bg-[#e0f0ff] border-2 border-black hidden md:flex items-center justify-center hover:bg-[#c0e0ff] transition-colors"
                aria-label="AI Information"
              >
                <Info size={16} />
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-[#f7e8d4] border-2 border-black font-pixel text-sm md:text-base hidden md:block"
              >
                LOGOUT
              </button>
            </>
          )}

          <NavMenu />
        </div>
      ) : (
        <Link href="/" className="p-2 flex-shrink-0">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      )}
    </header>
  )
}
