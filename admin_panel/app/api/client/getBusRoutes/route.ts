import { NextRequest,NextResponse } from "next/server";
import { connection } from "@/lib/db";
import axios from "axios";


export async function POST(req:NextRequest){
    const { bookingId } = await req.json();
    const sql = "SELECT routefileurl FROM routes WHERE id = (SELECT routeid FROM journeys WHERE id = (SELECT journeyid FROM bookings WHERE id = $1))";
    const res = await connection.query(sql,[bookingId]);
    if(res.rowCount === 0){
        return NextResponse.json({error:"No route found for this booking",success:false},{status:400});
    }
    const route = res.rows[0].routefileurl;
    const routeData = await axios.get(route);
    return NextResponse.json(routeData.data);
}