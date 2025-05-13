"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import PageBackground from "@/components/page-background"
import { register } from "@/utils/api-service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      // Register the user
      const data = await register(username, password)

      // Log in with the new credentials
      await login(username, password)

      toast.success("Registration successful!")
      router.push("/")
    } catch (error) {
      console.error("Registration failed:", error)
      toast.error("Registration failed. Please try a different username.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageBackground>
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-[#f7e8d4]/90 backdrop-blur-sm rounded-3xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
          <h1 className="text-4xl font-bold font-pixel text-center mb-6">TEACHEMONE</h1>
          <h2 className="text-2xl font-bold font-pixel text-center mb-8">REGISTER</h2>

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

            <div>
              <label htmlFor="confirmPassword" className="block text-xl font-pixel mb-2">
                CONFIRM PASSWORD
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border-2 border-black font-pixel bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 bg-[#ffe3b2] border-2 border-black font-pixel text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffd080] disabled:opacity-50"
            >
              {isLoading ? "REGISTERING..." : "REGISTER"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-pixel">
              ALREADY HAVE AN ACCOUNT?{" "}
              <Link href="/login" className="underline">
                LOGIN
              </Link>
            </p>
          </div>
        </div>
      </main>
    </PageBackground>
  )
}
