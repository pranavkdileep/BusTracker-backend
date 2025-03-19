import { connection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server"

type Passenger = {
    bookingId: string;
    fullname: string;
    email: string;
    phone: string;
    gender: string;
    source: string;
    destination: string;
};

export async function POST(req: NextRequest) {
    try{
        const { conductorId } = await req.json();
        const sql = `
        SELECT
        b.id AS bookingId,
        b.passenger->>'name' AS fullname,
        b.passenger->>'email' AS email,
        b.passenger->>'phoneNumber' AS phone,
        b.passenger->>'gender' AS gender,
        b.passenger->>'startBusStand' AS source,
        b.passenger->>'droppingBusStand' AS destination
        FROM bookings b
        JOIN journeys j ON b.journeyid = j.id
        JOIN buses bs ON j.busid = bs.id
        JOIN conductors c ON bs.id = c.busid
        WHERE c.id = $1
        `
        const res = await connection.query(sql, [conductorId]);
        if (res.rowCount === 0) {
            return { error: "No booking found", success: false };
        }
        let passengerData: Passenger[] = res.rows.map((passenger: any) => {
            return {
                bookingId: passenger.bookingid,
                fullname: passenger.fullname,
                email: passenger.email,
                phone: passenger.phone,
                gender: passenger.gender,
                source: passenger.source,
                destination: passenger.destination
            };
        });
        return NextResponse.json({ passengerData });
    }catch(error){
        console.error(error)
        return NextResponse.json({ success : false,message : "error" }, { status: 500 })
    }
}