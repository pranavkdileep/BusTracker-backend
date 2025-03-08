import { BookingGenerator } from "@/components/bookings/booking-generator"
import { BookingHistory } from "@/components/bookings/booking-history"

export default function BookingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold">Booking IDs</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <BookingGenerator />
        <BookingHistory />
      </div>
    </div>
  )
}

