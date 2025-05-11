"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(username, password)
      toast.success("Login successful!")
      router.push("/")
    } catch (error) {
      toast.error("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdd0] flex flex-col items-center justify-center p-4">
      <div className="bg-[#f7e8d4] rounded-3xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
        <h1 className="text-4xl font-bold font-pixel text-center mb-6">TEACHEMONE</h1>
        <h2 className="text-2xl font-bold font-pixel text-center mb-8">LOGIN</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-xl font-pixel mb-2">
              USERNAME
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border-2 border-black font-pixel bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xl font-pixel mb-2">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-black font-pixel bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-[#ffe3b2] border-2 border-black font-pixel text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffd080] disabled:opacity-50"
          >
            {isLoading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-pixel">
            DON'T HAVE AN ACCOUNT?{" "}
            <Link href="/register" className="underline">
              REGISTER
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
