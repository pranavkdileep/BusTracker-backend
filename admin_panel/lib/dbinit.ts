import { connection } from "./db";

// create table adminuser if not exists
const createAdminUserTable = async () => {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS adminusers (
          username TEXT PRIMARY KEY,
          password TEXT
        )
      `);
}

const createBusTable = async () => {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS buses (
          id TEXT PRIMARY KEY,
          name TEXT,
          currentLocation TEXT,
          state TEXT,
          speed INTEGER
        )
      `);
}

const createConductorTable = async () => {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS conductors (
          id TEXT PRIMARY KEY,
          name TEXT,
          busId TEXT,
          password TEXT
        )
      `);
}
const createRouteTable = async () => {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS routes (
          id TEXT PRIMARY KEY,
          name TEXT,
          source TEXT,
          destination TEXT,
          busstops TEXT[],
          routefileurl TEXT
        )
      `);
}

const createJourneyTable = async () => {
  await connection.query(`
      CREATE TABLE IF NOT EXISTS journeys (
        id TEXT PRIMARY KEY,
        name TEXT,
        busid TEXT,
        routeid TEXT,
        departuretime TEXT,
        estimatedarrival TEXT
      )
    `);
}

const createBookingTable = async () => {
  await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        journeyid TEXT,
        passenger JSON,
        timestamp TEXT
      )
    `);
}

const createChatTable = async () => {
  await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sendertype VARCHAR(50) NOT NULL CHECK (senderType IN ('user', 'conductor')),
    senderbookingid VARCHAR(50),
    senderconductorid VARCHAR(50),
    receivertype VARCHAR(50) NOT NULL CHECK (receiverType IN ('user', 'all')),
    receiverbookingid VARCHAR(50),
    receiverconductorid VARCHAR(50),
    busid VARCHAR(50),
    messagetext TEXT NOT NULL,
    sentat TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `);
}
