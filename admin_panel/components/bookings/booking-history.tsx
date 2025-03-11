"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { getBookings, type BookingId } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

export function BookingHistory() {
  const [bookings, setBookings] = useState<BookingId[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadBookings() {
      setLoading(true)
      try {
        const data = await getBookings()
        setBookings(data)
      } catch (error) {
        console.error("Failed to load bookings:", error)
        toast({
          title: "Error loading bookings",
          description: "There was a problem loading the booking data.",
          variant: "destructive",
        })
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [toast])

  if (loading) {
    return <div className="flex justify-center p-8">Loading bookings...</div>
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Booking IDs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Journey ID</TableHead>
              <TableHead>Passenger</TableHead>
              <TableHead>Generated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{booking.journeyid}</TableCell>
                <TableCell>{booking.passenger.name}</TableCell>
                <TableCell>{new Date(booking.timestamp).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Info className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Booking Details: {booking.id}</DialogTitle>
                        <DialogDescription>
                          Generated on {new Date(booking.timestamp).toLocaleString()}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <h4 className="font-medium mb-2">Journey Information</h4>
                          <p className="text-sm">Journey ID: {booking.journeyid}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Passenger Information</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="font-medium">Name:</div>
                            <div>{booking.passenger.name}</div>
                            <div className="font-medium">Age:</div>
                            <div>{booking.passenger.age}</div>
                            <div className="font-medium">Gender:</div>
                            <div>{booking.passenger.gender}</div>
                            <div className="font-medium">Phone:</div>
                            <div>{booking.passenger.phoneNumber}</div>
                            <div className="font-medium">Email:</div>
                            <div>{booking.passenger.email}</div>
                            <div className="font-medium">Start Bus Stand:</div>
                            <div>{booking.passenger.startBusStand}</div>
                            <div className="font-medium">Dropping Bus Stand:</div>
                            <div>{booking.passenger.droppingBusStand}</div>
                            {booking.passenger.parentPhoneNumber && (
                              <>
                                <div className="font-medium">Parent Phone:</div>
                                <div>{booking.passenger.parentPhoneNumber}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

