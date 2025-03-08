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