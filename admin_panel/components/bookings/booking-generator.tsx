"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { generateBookingId, getJourneys, type Journey, type BookingId } from "@/lib/actions"

const formSchema = z.object({
  journeyId: z.string().min(1, "Journey is required"),
  passenger: z.object({
    name: z.string().min(1, "Name is required"),
    age: z.coerce.number().min(1, "Age must be at least 1"),
    gender: z.enum(["male", "female"], {
      required_error: "Gender is required",
    }),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.string().email("Invalid email address"),
    startBusStand: z.string().min(1, "Start bus stand is required"),
    droppingBusStand: z.string().min(1, "Dropping bus stand is required"),
    parentPhoneNumber: z.string().optional(),
  }),
})

type FormValues = z.infer<typeof formSchema>

export function BookingGenerator() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [generatedBooking, setGeneratedBooking] = useState<BookingId | null>(null)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      journeyId: "",
      passenger: {
        name: "",
        age: undefined as unknown as number,
        gender: undefined as unknown as "male" | "female",
        phoneNumber: "",
        email: "",
        startBusStand: "",
        droppingBusStand: "",
        parentPhoneNumber: "",
      },
    },
  })

  useEffect(() => {
    async function loadJourneys() {
      try {
        const data = await getJourneys()
        setJourneys(data)
      } catch (error) {
        console.error("Failed to load journeys:", error)
        toast({
          title: "Error loading journeys",
          description: "There was a problem loading the journey data.",
          variant: "destructive",
        })
        setJourneys([])
      }
    }

    loadJourneys()
  }, [toast])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const booking = await generateBookingId(values.journeyId, values.passenger)
      setGeneratedBooking(booking)
      toast({
        title: "Booking ID generated",
        description: `Booking ID ${booking.id} has been generated successfully.`,
      })
    } catch (error) {
      console.error("Failed to generate booking ID:", error)
      toast({
        title: "Failed to generate booking ID",
        description: "There was an error generating the booking ID. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Generate Booking ID</CardTitle>
        <CardDescription>Create a new booking with passenger details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="journey" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="journey">Journey Details</TabsTrigger>
                <TabsTrigger value="passenger">Passenger Details</TabsTrigger>
              </TabsList>

              <TabsContent value="journey" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="journeyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Journey</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a journey" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {journeys.map((journey) => (
                            <SelectItem key={journey.id} value={journey.id}>
                              {journey.name} ({journey.startLocation} → {journey.endLocation})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="passenger" className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="passenger.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passenger.age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="passenger.gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="passenger.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passenger.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="passenger.startBusStand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Bus Stand</FormLabel>
                        <FormControl>
                          <Input placeholder="Central Station" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passenger.droppingBusStand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dropping Bus Stand</FormLabel>
                        <FormControl>
                          <Input placeholder="Airport Terminal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="passenger.parentPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 987-6543" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Booking ID"}
            </Button>
          </form>
        </Form>

        {generatedBooking && (
          <div className="mt-6 p-4 border rounded-md bg-muted">
            <h3 className="font-semibold mb-4 text-lg">Generated Booking ID</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Booking Details</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">ID:</div>
                    <div>{generatedBooking.id}</div>
                    <div className="font-medium">Journey ID:</div>
                    <div>{generatedBooking.journeyId}</div>
                    <div className="font-medium">Generated at:</div>
                    <div>{new Date(generatedBooking.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Passenger Details</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Name:</div>
                    <div>{generatedBooking.passenger.name}</div>
                    <div className="font-medium">Age:</div>
                    <div>{generatedBooking.passenger.age}</div>
                    <div className="font-medium">Gender:</div>
                    <div>{generatedBooking.passenger.gender}</div>
                    <div className="font-medium">Phone:</div>
                    <div>{generatedBooking.passenger.phoneNumber}</div>
                    <div className="font-medium">Email:</div>
                    <div>{generatedBooking.passenger.email}</div>
                    <div className="font-medium">Start Bus Stand:</div>
                    <div>{generatedBooking.passenger.startBusStand}</div>
                    <div className="font-medium">Dropping Bus Stand:</div>
                    <div>{generatedBooking.passenger.droppingBusStand}</div>
                    {generatedBooking.passenger.parentPhoneNumber && (
                      <>
                        <div className="font-medium">Parent Phone:</div>
                        <div>{generatedBooking.passenger.parentPhoneNumber}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

