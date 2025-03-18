import { connection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Routes = {
    name: string;
    completed: boolean;
};

type BookingHome = {
    bookingId: string;
    fullname: string;
    email: string;
    phone: string;
    gender: string;
    busId: string;
    source: string;
    destination: string;
    conductor: string;
    timeD: string;
    timeA: string;
    status: string;
    routes: Routes[];
};


export async function POST(req: NextRequest) {
    const { bookingId } = await req.json();
    const sql = `SELECT 
  b.passenger->>'name' AS fullname,
  b.passenger->>'email' AS email,
  b.passenger->>'phoneNumber' AS phone,
  b.passenger->>'gender' AS gender,
  j.busid AS busId,
  b.passenger->>'startBusStand' AS source,
  b.passenger->>'droppingBusStand' AS destination,
  c.name AS conductor,
  j.departuretime AS timeD,
  j.estimatedarrival AS timeA,
  j.status AS status,
  r.busstops AS routes,
  j.noofstopsdone
FROM bookings b
JOIN journeys j ON b.journeyid = j.id
JOIN routes r ON j.routeid = r.id
JOIN buses bs ON j.busid = bs.id
JOIN conductors c ON bs.id = c.busid
WHERE b.id = $1`;
    const res = await connection.query(sql, [bookingId]);
    if (res.rowCount === 0) {
        return { error: "No booking found", success: false };
    }
    const resjson = res.rows[0];
    const routes = resjson.routes;
    const noofstopsdone = resjson.noofstopsdone;
    let routeArray: Routes[] = routes.map((route: any, index: number) => {
        return {
            name: route,
            completed: index < noofstopsdone
        };
    });
    const bookingData: BookingHome = {
        bookingId,
        fullname: resjson.fullname,
        email: resjson.email,
        phone: resjson.phone,
        gender: resjson.gender,
        busId: resjson.busId,
        source: resjson.source,
        destination: resjson.destination,
        conductor: resjson.conductor,
        timeD: resjson.timeD,
        timeA: resjson.timeA,
        status: resjson.status,
        routes: routeArray
    };
    return NextResponse.json(bookingData);
}