"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bus, Users, Map, Calendar, TicketIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoutButton } from "@/components/auth/logout-button"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Map className="h-5 w-5" />,
  },
  {
    title: "Buses",
    href: "/dashboard/buses",
    icon: <Bus className="h-5 w-5" />,
  },
  {
    title: "Conductors",
    href: "/dashboard/conductors",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Journeys",
    href: "/dashboard/journeys",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Booking IDs",
    href: "/dashboard/bookings",
    icon: <TicketIcon className="h-5 w-5" />,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-muted/40 lg:block lg:w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Bus className="h-6 w-6" />
            <span>Bus Tracker</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground",
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

