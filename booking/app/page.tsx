"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import {
  CalendarIcon,
  MapPin,
  X,
  ArrowRight,
  Bus,
  Clock,
  CalendarPlus2Icon as CalendarIcon2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AsyncLocationSelect } from "@/components/async-location-select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { generateBookingId, getJourneys, PassengerDetails } from "@/lib/actions"

interface Journey {
  id: string
  busName: string
  departureTime: string
  stops: string[]
  price: string
  duration: string
  amenities: string[]
  seatsAvailable: number
  busType: string
}
interface BookingDetails {
  bookingId: string;
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  parentNumber: string;
  busId: string;
  busName: string;
  busType: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: string;
  journey: Journey;
}

// This would come from an API in a real app
const allLocations = [
  { value: "thrissur", label: "Thrissur" },
  { value: "ollur", label: "Ollur" },
  { value: "pudukkad", label: "Pudukkad" },
  { value: "chalakudi", label: "Chalakudi" },
  { value: "thodupuzha", label: "Thodupuzha" },
  { value: "kochi", label: "Kochi" },
  { value: "ernakulam", label: "Ernakulam" },
  { value: "palakkad", label: "Palakkad" },
  { value: "kozhikode", label: "Kozhikode" },
  { value: "malappuram", label: "Malappuram" },
]

export default function BookingSystem() {
  const [source, setSource] = useState<string | null>(null)
  const [destination, setDestination] = useState<string | null>(null)
  const [date, setDate] = useState<Date>()
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [showJourneys, setShowJourneys] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    parentPhone: "",
  })
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("search")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGetJourneys = async () => {
    if (source && destination && date) {
      setIsLoading(true)
      const formattedDate = format(date, "yyyy-MM-dd")
      const journeys = await getJourneys(source, destination, formattedDate)
      setJourneys(journeys)

      // Simulate API call
      setTimeout(() => {
        setShowJourneys(true)
        setIsLoading(false)
        setActiveTab("results")
      }, 1500)
    }
  }

  const handleGenerateBooking = () => {
    if (!selectedJourney) {
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(async () => {
      const journeyId = selectedJourney.id
      const passengerDetails : PassengerDetails ={
        name: formData.fullName || "Pranav Dileep",
        age: parseInt(formData.age) || 23,
        gender: formData.gender || "Male",
        phoneNumber: formData.phone || "0999999999",
        email: formData.email || "pranav@gmail.com",
        startBusStand: source || "Thrissur",
        droppingBusStand: destination || "Kochi",
        parentPhoneNumber: formData.parentPhone || "743643743",
      }
      const bookingId = await generateBookingId(journeyId, passengerDetails)

      setBookingDetails({
        bookingId,
        fullName: formData.fullName || "Pranav Dileep",
        age: formData.age || "23",
        gender: formData.gender || "Male",
        phone: formData.phone || "0999999999",
        email: formData.email || "pranav@gmail.com",
        parentNumber: formData.parentPhone || "743643743",
        busId: selectedJourney.id,
        busName: selectedJourney.busName,
        busType: selectedJourney.busType,
        from: passengerDetails.startBusStand,
        to: passengerDetails.droppingBusStand,
        date: date ? format(date, "dd/MM/yyyy") : "15/2/2025",
        time: selectedJourney.departureTime,
        price: selectedJourney.price,
        journey: selectedJourney,
      })

      setIsLoading(false)
      setShowBookingModal(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#3f7d58]">Bus Booking System</h1>
          
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="results" disabled={!showJourneys}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Find Your Journey</CardTitle>
                <CardDescription>Enter your travel details to find available buses.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="source" className="font-medium">
                      From
                    </Label>
                    <AsyncLocationSelect
                      id="source"
                      value={source}
                      onChange={setSource}
                      placeholder="Enter city or town"
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="hidden md:flex h-10 w-10 rounded-full bg-gray-100 items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination" className="font-medium">
                      To
                    </Label>
                    <AsyncLocationSelect
                      id="destination"
                      value={destination}
                      onChange={setDestination}
                      placeholder="Enter city or town"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="font-medium">
                      Travel Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white border-gray-200",
                            !date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "EEEE, MMMM d, yyyy") : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Passengers</Label>
                    <Select defaultValue="1">
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Number of passengers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Passenger</SelectItem>
                        <SelectItem value="2">2 Passengers</SelectItem>
                        <SelectItem value="3">3 Passengers</SelectItem>
                        <SelectItem value="4">4 Passengers</SelectItem>
                        <SelectItem value="5">5 Passengers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleGetJourneys}
                  className="w-full md:w-auto bg-[#3f7d58] hover:bg-[#346a4a]"
                  disabled={!source || !destination || !date || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search Buses"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            {showJourneys && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-[#3f7d58]" />
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">
                        {source }
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-gray-400" />

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-[#3f7d58]" />
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-medium">
                        {destination }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CalendarIcon2 className="h-5 w-5 text-[#3f7d58]" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{date ? format(date, "EEE, MMM d") : "Date"}</p>
                    </div>
                  </div>

                  <Button variant="outline" className="ml-auto" onClick={() => setActiveTab("search")}>
                    Modify Search
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Available Buses ({journeys.length})</h2>
                    <Select defaultValue="price">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="departure">Departure Time</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {journeys.map((journey, index) => (
                    <Card
                      key={index}
                      className={cn(
                        "overflow-hidden transition-all",
                        selectedJourney?.id === journey.id ? "ring-2 ring-[#3f7d58]" : "hover:border-[#3f7d58]/50",
                      )}
                    >
                      <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="p-4 md:col-span-3">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{journey.busName}</h3>
                                <p className="text-sm text-gray-500">
                                  {journey.id} • {journey.busType}
                                </p>
                              </div>
                              <div className="flex items-center mt-2 md:mt-0">
                                <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 hover:bg-green-50">
                                  {journey.seatsAvailable} seats left
                                </Badge>
                                <Badge variant="secondary">{journey.price}</Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">Departure</p>
                                  <p className="text-sm text-gray-500">
                                    {journey.departureTime}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">Duration</p>
                                  <p className="text-sm text-gray-500">{journey.duration}</p>
                                </div>
                              </div>

                              <div className="flex items-center">
                                <Bus className="h-4 w-4 text-gray-500 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">Bus Type</p>
                                  <p className="text-sm text-gray-500">{journey.busType}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {journey.amenities.map((amenity, i) => (
                                <Badge key={i} variant="outline" className="bg-gray-50">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Route: </span>
                              {journey.stops.join(" → ")}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 flex flex-col justify-between">
                            <div>
                              <p className="text-2xl font-bold text-[#3f7d58]">{journey.price}</p>
                              <p className="text-sm text-gray-500">per passenger</p>
                            </div>

                            <Button
                              className={cn(
                                "mt-4 w-full",
                                selectedJourney?.id === journey.id
                                  ? "bg-[#3f7d58] hover:bg-[#346a4a]"
                                  : "bg-white text-[#3f7d58] border-[#3f7d58] hover:bg-[#3f7d58] hover:text-white",
                              )}
                              variant={selectedJourney?.id === journey.id ? "default" : "outline"}
                              onClick={() => {
                                setSelectedJourney(journey)
                                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
                              }}
                            >
                              {selectedJourney?.id === journey.id ? "Selected" : "Select"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedJourney && (
                  <Card className="mt-8">
                    <CardHeader>
                      <CardTitle>Passenger Details</CardTitle>
                      <CardDescription>
                        Fill in the details for your journey from{" "}
                        {source ? allLocations.find((loc) => loc.value === source)?.label : "Source"} to{" "}
                        {destination ? allLocations.find((loc) => loc.value === destination)?.label : "Destination"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="fullName" className="font-medium">
                              Full Name
                            </Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              className="mt-1"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="age" className="font-medium">
                                Age
                              </Label>
                              <Input
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                placeholder="Age"
                                type="number"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor="gender" className="font-medium">
                                Gender
                              </Label>
                              <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                              >
                                <SelectTrigger id="gender" className="mt-1">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="phone" className="font-medium">
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="email" className="font-medium">
                              Email
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email address"
                              className="mt-1"
                              type="email"
                            />
                          </div>

                          <div>
                            <Label htmlFor="parentPhone" className="font-medium">
                              Emergency Contact
                            </Label>
                            <Input
                              id="parentPhone"
                              name="parentPhone"
                              value={formData.parentPhone}
                              onChange={handleInputChange}
                              placeholder="Emergency contact number"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                      <div>
                        <p className="text-sm text-gray-500">Selected Bus</p>
                        <p className="font-medium">
                          {selectedJourney.busName} ({selectedJourney.id})
                        </p>
                      </div>
                      <Button
                        onClick={handleGenerateBooking}
                        className="bg-[#3f7d58] hover:bg-[#346a4a]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Booking Details Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <span className="text-[#3f7d58] mr-2">Booking Confirmed</span>
              <Badge variant="outline" className="ml-2">
                {bookingDetails?.bookingId}
              </Badge>
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          {bookingDetails && (
            <div className="grid gap-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-green-700">
                  Your booking has been confirmed. A confirmation has been sent to your email.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Passenger Details</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {bookingDetails.fullName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Age:</span> {bookingDetails.age}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Gender:</span> {bookingDetails.gender}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {bookingDetails.phone}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {bookingDetails.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Emergency Contact:</span> {bookingDetails.parentNumber}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Journey Details</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Bus:</span> {bookingDetails.busName} ({bookingDetails.busType})
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Bus ID:</span> {bookingDetails.busId}
                    </p>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">From</p>
                        <p className="text-sm">{bookingDetails.from}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">To</p>
                        <p className="text-sm">{bookingDetails.to}</p>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm">{bookingDetails.date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm">{bookingDetails.time}</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> {bookingDetails.price}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="outline">Download Ticket</Button>
                <Button className="bg-[#3f7d58] hover:bg-[#346a4a]">Print Ticket</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

