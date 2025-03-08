const API_BASE_URL = "http://207.211.188.157:4578/api/admin"

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

// Update the PassengerDetails type to include start and dropping stands
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

// Bus API functions
export async function createBus(bus: Bus): Promise<Bus> {
  const response = await fetch(`${API_BASE_URL}/bus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bus),
  })

  if (!response.ok) {
    throw new Error(`Failed to create bus: ${response.statusText}`)
  }

  return response.json()
}

export async function getBuses(): Promise<Bus[]> {
  const response = await fetch(`${API_BASE_URL}/buses`, {
    cache: "no-store",
  })

  if (!response.ok) {
    // Return empty array if API is not available
    console.error(`Failed to fetch buses: ${response.statusText}`)
    return []
  }

  return response.json()
}

export async function deleteBus(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/bus/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete bus: ${response.statusText}`)
  }
}

// Conductor API functions
export async function createConductor(conductor: Conductor): Promise<Conductor> {
  const response = await fetch(`${API_BASE_URL}/conductor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conductor),
  })

  if (!response.ok) {
    throw new Error(`Failed to create conductor: ${response.statusText}`)
  }

  return response.json()
}

export async function getConductors(): Promise<Conductor[]> {
  const response = await fetch(`${API_BASE_URL}/conductors`, {
    cache: "no-store",
  })

  if (!response.ok) {
    // Return empty array if API is not available
    console.error(`Failed to fetch conductors: ${response.statusText}`)
    return []
  }

  return response.json()
}

export async function deleteConductor(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/conductor/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete conductor: ${response.statusText}`)
  }
}

// Journey API functions
export async function createJourney(journey: Omit<Journey, "id">): Promise<Journey> {
  const response = await fetch(`${API_BASE_URL}/journey`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(journey),
  })

  if (!response.ok) {
    throw new Error(`Failed to create journey: ${response.statusText}`)
  }

  return response.json()
}

export async function getJourneys(): Promise<Journey[]> {
  const response = await fetch(`${API_BASE_URL}/journeys`, {
    cache: "no-store",
  })

  if (!response.ok) {
    // Return empty array if API is not available
    console.error(`Failed to fetch journeys: ${response.statusText}`)
    return []
  }

  return response.json()
}

export async function deleteJourney(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/journey/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete journey: ${response.statusText}`)
  }
}

// Booking ID API functions
export async function generateBookingId(journeyId: string, passenger: PassengerDetails): Promise<BookingId> {
  const response = await fetch(`${API_BASE_URL}/bookingId`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      journeyId,
      passenger,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to generate booking ID: ${response.statusText}`)
  }

  return response.json()
}

