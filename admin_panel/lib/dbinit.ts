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