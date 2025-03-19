import { connection } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
    try{
        const {conductorId,newNoOfStops} = await req.json()
        const sql = `UPDATE journeys SET noofstopsdone = $1 WHERE busid = (SELECT busid FROM conductors WHERE id = $2)`
        const res = await connection.query(sql,[newNoOfStops,conductorId])
        if(res.rowCount === 0){
            return { error: "No bus found", success: false }
        }
        return NextResponse.json({ success : true })
    }catch(error){
        console.error(error)
        return NextResponse.json({ success : false,message : "error" }, { status: 500 })
    }
}