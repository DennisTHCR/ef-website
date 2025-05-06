"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { usePathname } from "next/navigation"
import NavMenu from "./nav-menu"
import { useAuth } from "@/contexts/auth-context"

export default function Header() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="flex justify-between items-center p-4 border-b-2 border-black bg-[#fffcb2]">
      <Link href="/" className="text-4xl md:text-5xl font-bold tracking-tight font-pixel">
        TEACHEMONE
      </Link>

      {isHomePage ? (
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button
              onClick={logout}
              className="px-4 py-2 bg-[#f7e8d4] border-2 border-black font-pixel text-sm hidden md:block"
            >
              LOGOUT
            </button>
          )}
          <NavMenu />
        </div>
      ) : (
        <Link href="/" className="p-2">
          <ArrowLeft className="w-8 h-8" />
        </Link>
      )}
    </header>
  )
}
