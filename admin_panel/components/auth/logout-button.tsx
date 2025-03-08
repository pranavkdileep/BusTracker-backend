"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { logout } from "@/lib/actions"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })

      // Refresh the page to trigger middleware redirect
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoading}>
      <LogOut className="h-4 w-4 mr-2" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  )
}

