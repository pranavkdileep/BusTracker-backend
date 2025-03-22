"use server"
import { connection } from "./db";
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

export async function searchLocations(keyword: string) {
    const { rows } = await connection.query(`SELECT DISTINCT stop
FROM routes, unnest(busstops) AS stop
WHERE stop ILIKE '${keyword}%'
LIMIT 20;`);

    const locations = rows.map((row: {stop:string}) => ({
        value: row.stop,
        label: row.stop,
    }));
    console.log(locations);
    return locations;
}

export async function getJourneys(source: string, destination: string,date : string) : Promise<Journey[]> {
    try {
      const query = `
              SELECT 
                  j.id AS id,
                  b.name AS "busName",
                  j.departuretime AS "departureTime",
                  r.busstops AS stops,
                  b.type AS "busType",
                  b.amenities AS amenities,
                  j.seatsavailable AS "seatsAvailable",
                  j.price AS price,
                  j.duration AS duration
              FROM journeys j
              JOIN routes r ON j.routeid = r.id
              JOIN buses b ON j.busid = b.id
              WHERE 
                  $1 = ANY(r.busstops) AND
                  $2 = ANY(r.busstops) AND
                  j.departuretime LIKE '${date}%' AND
                  array_position(r.busstops, $1) < array_position(r.busstops, $2);
          `
      const result = await connection.query(query, [source, destination])
  
      // Add random values for missing fields
      const journeys: Journey[] = await Promise.all(result.rows.map(async (row) => ({
        id: row.id as string,
        busName: row.busName as string,
        departureTime: row.departureTime as string,
        stops: row.stops as string[],
        price: `₹${row.price}`,
        duration: `${row.duration}hr`,
        amenities: row.amenities as string[],
        seatsAvailable: row.seatsAvailable as number,
        busType: row.busType as string,
    })));
    console.log(journeys);
      return journeys
    } catch (error) {
      console.error("Error getting journeys:", error)
      return []
    }
  }

  export async function generateBookingId(journeyId: string, passenger: PassengerDetails) {
    const randomId = Math.floor(Math.random() * 10000)
    const id = `BK-${randomId}`
    const sql = "INSERT INTO bookings (id, journeyid, passenger,timestamp) VALUES ($1, $2, $3,$4)"
    const result = await connection.query(sql, [id, journeyId, passenger, new Date().toISOString()])
    console.log(result);
    return id
  }
  
  // Helper function to generate random amenities
 async function getRandomAmenities() {
    const allAmenities = ["WiFi", "USB Charging", "AC", "Water Bottle", "Snacks", "Blanket", "TV", "Reclining Seats"]
    const numAmenities = Math.floor(Math.random() * 5) + 1
    const shuffled = [...allAmenities].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, numAmenities)
  }
  
  // Helper function to get random bus type
async  function getRandomBusType() {
    const busTypes = ["Standard", "Luxury", "Premium", "Sleeper", "Semi-Sleeper"]
    return busTypes[Math.floor(Math.random() * busTypes.length)]
  }
  
