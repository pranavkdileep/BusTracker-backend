"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SignJWT, jwtVerify } from "jose"
import { connection } from "./db"

// Types
export type Bus = {
  id: string
  name: string
  currentLocation?: string
  state: string
  speed: number
}

export type Route = {
  id: string
  name: string
  source: string
  destination: string
  busstops: string[]
  routefileurl: string
}

export type Conductor = {
  id: string
  name: string
  busid: string
  password: string
}

export type Journey = {
  id: string
  name: string
  busid: string
  routeid: string
  departuretime: string
  estimatedarrival: string
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
  journeyid: string
  passenger: PassengerDetails
  timestamp: string
}

export type User = {
  username: string
  role: "admin"
}

export type Chat = {
  id?: string
  sendertype: "user" | "conductor"
  senderbookingid?: string
  senderconductorid?: string
  receivertype: "user" | "all"
  receiverbookingid?: string
  receiverconductorid?: string
  busid?: string
  messagetext: string
  sentat: Date
}

export type ChatResponse = {
  id:string;
  messageText:string;
  sentAt:Date;
  direction:'send' | 'received';
  from : 'user' | 'conductor';
  bookingId?:string;
  conductorId?:string;
}

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_jwt_secret_key_change_in_production")

// Authentication Actions
export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

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
  console.log("Creating bus", bus)
  const sql = "INSERT INTO buses (id, name, state, speed) VALUES ($1, $2, $3, $4)"
  const res = await connection.query(sql, [bus.id, bus.name, bus.state, bus.speed])

  return res.rows[0]
}

export async function getBuses(): Promise<Bus[]> {
  await authorize()
  const sql = "SELECT * FROM buses"
  const result = await connection.query(sql)
  return result.rows
}

export async function deleteBus(id: string): Promise<void> {
  await authorize()
  const conductorSql = "UPDATE conductors SET busid = NULL WHERE busid = $1"
  await connection.query(conductorSql, [id])
  const sql = "DELETE FROM buses WHERE id = $1"
  await connection.query(sql, [id])
}

// Conductor Actions
export async function createConductor(conductor: Conductor): Promise<Conductor> {
  await authorize()
  const sql = "INSERT INTO conductors (id, name, busId, password) VALUES ($1, $2, $3, $4)"
  const res = await connection.query(sql, [conductor.id, conductor.name, conductor.busid, conductor.password])

  return conductor
}

export async function getConductors(): Promise<Conductor[]> {
  await authorize()
  const sql = "SELECT * FROM conductors"
  const result = await connection.query(sql)
  return result.rows
}

export async function updateConductor(conductor: Conductor): Promise<void> {
  await authorize()
  const sql = "UPDATE conductors SET name = $1, busId = $2, password = $3 WHERE id = $4"
  await connection.query(sql, [conductor.name, conductor.busid, conductor.password, conductor.id])
}

export async function deleteConductor(id: string): Promise<void> {
  await authorize()
  const sql = "DELETE FROM conductors WHERE id = $1"
  await connection.query(sql, [id])
}

export async function createRoute(route: Route): Promise<Route> {
  await authorize()
  const sql = "INSERT INTO routes (id, name, source, destination, busstops, routefileurl) VALUES ($1, $2, $3, $4, $5, $6)"
  const res = await connection.query(sql, [route.id, route.name, route.source, route.destination, route.busstops, route.routefileurl])
  return route
}
export async function getRoutes(): Promise<Route[]> {
  await authorize()
  const sql = "SELECT * FROM routes"
  const result = await connection.query(sql)
  return result.rows
}
export async function deleteRoute(id: string): Promise<void> {
  await authorize()
  const sql = "DELETE FROM routes WHERE id = $1"
  await connection.query(sql, [id])
}

// Journey Actions
export async function createJourney(journey: Omit<Journey, "id">): Promise<Journey> {
  await authorize()
  const randomId = Math.floor(Math.random() * 10000)
  const sql = "INSERT INTO journeys (id, name, busid, routeid, departuretime, estimatedarrival) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
  const res = await connection.query(sql, [randomId,journey.name, journey.busid, journey.routeid, journey.departuretime, journey.estimatedarrival])
  return res.rows[0]
}

export async function getJourneys(): Promise<Journey[]> {
  await authorize()
  const sql = "SELECT * FROM journeys"
  const result = await connection.query(sql)
  return result.rows
}

export async function deleteJourney(id: string): Promise<void> {
  await authorize()
  const sql = "DELETE FROM journeys WHERE id = $1"
  await connection.query(sql, [id])
}

// Booking Actions
export async function generateBookingId(journeyId: string, passenger: PassengerDetails): Promise<BookingId> {
  await authorize()
  const randomId = Math.floor(Math.random() * 10000)
  const id = `BK-${randomId}`
  const sql = "INSERT INTO bookings (id, journeyid, passenger,timestamp) VALUES ($1, $2, $3,$4)"
  const result = await connection.query(sql, [id, journeyId, passenger, new Date().toISOString()])
  return {
    id,
    journeyid: journeyId,
    passenger,
    timestamp: new Date().toISOString(),
  }
}

export async function getBookings(): Promise<BookingId[]> {
  await authorize()
  const sql = "SELECT * FROM bookings"
  const result = await connection.query(sql)
  return result.rows
}

// client actions

