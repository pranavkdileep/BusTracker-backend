"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SignJWT, jwtVerify } from "jose"
import { connection } from "./db"

// Types
export type Bus = {
  id: string
  name: string
  currentLocation: string
  state: string
  speed: number
}

export type Conductor = {
  id: string
  name: string
  busId: string
  password: string
}

export type Journey = {
  id: string
  name: string
  busId: string
  startLocation: string
  endLocation: string
  departureTime: string
  estimatedArrival: string
}

export type PassengerDetails = {
  name: string
  age: number
  gender: string
  phoneNumber: string
  email: string
  startBusStand: string
  droppingBusStand: string
  parentPhoneNumber?: string
}

export type BookingId = {
  id: string
  journeyId: string
  passenger: PassengerDetails
  timestamp: string
}

export type User = {
  username: string
  role: "admin"
}

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_jwt_secret_key_change_in_production")

// Authentication Actions
export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // In a real app, you would validate against a database
  const sql = "SELECT * FROM adminusers WHERE username = $1 AND password = $2"
  const result = await connection.query(sql, [username, password])
  if (result.rows.length > 0) {
    const user = { username, role: "admin" }

    // Create JWT token
    const token = await new SignJWT({ ...user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET)

    // Set HTTP-only cookie
    ;(await
      // Set HTTP-only cookie
      cookies()).set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return { success: true }
  }

  return { success: false, error: "Invalid credentials" }
}

export async function logout() {
  (await cookies()).delete("auth-token")
  redirect("/")
}

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get("auth-token")?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as unknown as User
  } catch (error) {
    return null
  }
}

// Authorization middleware for server actions
async function authorize() {
  const user = await getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

// Bus Actions
export async function createBus(bus: Bus): Promise<Bus> {
  await authorize()

  // In a real app, you would make a database call
  // For demo purposes, we'll just return the bus with a simulated delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return bus
}

export async function getBuses(): Promise<Bus[]> {
  await authorize()

  // Simulated data for demonstration
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    { id: "bus1", name: "Bus 100", currentLocation: "Station A", state: "idle", speed: 0 },
    { id: "bus2", name: "Bus 101", currentLocation: "Station B", state: "moving", speed: 60 },
    { id: "bus3", name: "Bus 102", currentLocation: "Highway 1", state: "moving", speed: 75 },
  ]
}

export async function deleteBus(id: string): Promise<void> {
  await authorize()

  // Simulated deletion
  await new Promise((resolve) => setTimeout(resolve, 500))
}

// Conductor Actions
export async function createConductor(conductor: Conductor): Promise<Conductor> {
  await authorize()

  // Simulated creation
  await new Promise((resolve) => setTimeout(resolve, 500))

  return conductor
}

export async function getConductors(): Promise<Conductor[]> {
  await authorize()

  // Simulated data
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    { id: "conductor1", name: "John Doe", busId: "bus1", password: "********" },
    { id: "conductor2", name: "Jane Smith", busId: "bus2", password: "********" },
  ]
}

export async function deleteConductor(id: string): Promise<void> {
  await authorize()

  // Simulated deletion
  await new Promise((resolve) => setTimeout(resolve, 500))
}

// Journey Actions
export async function createJourney(journey: Omit<Journey, "id">): Promise<Journey> {
  await authorize()

  // Simulated creation
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    ...journey,
    id: `journey${Math.floor(Math.random() * 1000)}`,
  }
}

export async function getJourneys(): Promise<Journey[]> {
  await authorize()

  // Simulated data
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "journey1",
      name: "Morning Express",
      busId: "bus1",
      startLocation: "Central Station",
      endLocation: "Airport",
      departureTime: "2023-06-15T08:00:00Z",
      estimatedArrival: "2023-06-15T09:30:00Z",
    },
    {
      id: "journey2",
      name: "Evening Return",
      busId: "bus2",
      startLocation: "Airport",
      endLocation: "Central Station",
      departureTime: "2023-06-15T18:00:00Z",
      estimatedArrival: "2023-06-15T19:30:00Z",
    },
  ]
}

export async function deleteJourney(id: string): Promise<void> {
  await authorize()

  // Simulated deletion
  await new Promise((resolve) => setTimeout(resolve, 500))
}

// Booking Actions
export async function generateBookingId(journeyId: string, passenger: PassengerDetails): Promise<BookingId> {
  await authorize()

  // Simulated booking generation
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id: `BK-${Math.floor(Math.random() * 10000)}`,
    journeyId,
    passenger,
    timestamp: new Date().toISOString(),
  }
}

export async function getBookings(): Promise<BookingId[]> {
  await authorize()

  // Simulated data
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "BK-12345",
      journeyId: "journey1",
      timestamp: "2023-06-15T10:30:00Z",
      passenger: {
        name: "John Doe",
        age: 35,
        gender: "male",
        phoneNumber: "+1 (555) 123-4567",
        email: "john.doe@example.com",
        startBusStand: "Central Station",
        droppingBusStand: "Airport Terminal",
      },
    },
    {
      id: "BK-12346",
      journeyId: "journey2",
      timestamp: "2023-06-15T11:45:00Z",
      passenger: {
        name: "Jane Smith",
        age: 28,
        gender: "female",
        phoneNumber: "+1 (555) 987-6543",
        email: "jane.smith@example.com",
        startBusStand: "Downtown",
        droppingBusStand: "University Campus",
      },
    },
    {
      id: "BK-12347",
      journeyId: "journey1",
      timestamp: "2023-06-15T13:15:00Z",
      passenger: {
        name: "Michael Johnson",
        age: 42,
        gender: "male",
        phoneNumber: "+1 (555) 456-7890",
        email: "michael.j@example.com",
        startBusStand: "Shopping Mall",
        droppingBusStand: "Central Station",
      },
    },
    {
      id: "BK-12348",
      journeyId: "journey2",
      timestamp: "2023-06-15T14:30:00Z",
      passenger: {
        name: "Sarah Williams",
        age: 17,
        gender: "female",
        phoneNumber: "+1 (555) 234-5678",
        email: "sarah.w@example.com",
        startBusStand: "High School",
        droppingBusStand: "Sports Complex",
        parentPhoneNumber: "+1 (555) 876-5432",
      },
    },
    {
      id: "BK-12349",
      journeyId: "journey1",
      timestamp: "2023-06-15T16:00:00Z",
      passenger: {
        name: "Robert Brown",
        age: 31,
        gender: "male",
        phoneNumber: "+1 (555) 345-6789",
        email: "robert.b@example.com",
        startBusStand: "Business Park",
        droppingBusStand: "Residential Area",
      },
    },
  ]
}

