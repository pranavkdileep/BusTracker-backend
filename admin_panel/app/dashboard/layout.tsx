import type React from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { getUser } from "@/lib/actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side authentication check
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}

