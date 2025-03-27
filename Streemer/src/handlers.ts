import {Request, Response } from "express";
import { connection } from "./db";
import fs from "fs";
const routes = [
    {
        busId: "123",
        route: '123.json',
    }
]

export const getBusRoutesHandler = async (req: Request, res: Response) => {
    const { busId } = req.body;
    const route = routes.find(route => route.busId === busId);
    if (!route) {
        res.status(404).send({ message: "Route not found" });
    }
    const filepath = 'raw/' + route?.route;
    if (!fs.existsSync(filepath)) {
        res.status(404).send({ message: "Route not found" });
    }
    const data = fs.readFileSync(filepath, 'utf-8');
    res.send(data);
}

export async function streamBusLocation(bookId?: string | string[] | undefined, send?: (data: any) => void) {
    // If no send function provided, this is a no-op
    if (!send) {
        return () => {}; // Return empty cleanup function
    }

    const sql = `SELECT 
      b.currentLocation
      FROM buses b
      JOIN journeys j ON b.id = j.busid
      JOIN bookings bk ON j.id = bk.journeyid
      WHERE bk.id = '${bookId}';`

    const intervalId = setInterval(async () => {
        try {
            let location = await connection.query(sql);
            location = location.rows[0].currentlocation;
            send(JSON.stringify({ bookId, location }));
            console.log('sent: ', location);
        } catch (error) {
            console.error('Error streaming location:', error);
        }
    }, 1000);

    // Return a cleanup function
    return () => {
        console.log(`Cleaning up interval for bookId: ${bookId}`);
        clearInterval(intervalId);
    };
}
//http://207.211.188.157:4578/api ws://localhost:3000/busLocation?busId=123

export function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
