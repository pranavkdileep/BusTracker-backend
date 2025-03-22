import { NextRequest, NextResponse } from "next/server";
import { connection } from "@/lib/db";

export async function POST(req: NextRequest) {
    const { conductor_id, password, location } = await req.json()
    if (conductor_id && password && location) {
        try {
            const sql = `UPDATE buses SET currentlocation = ${location} WHERE id = (SELECT busid FROM conductors WHERE id = ${conductor_id} AND password = ${password})`
            await connection.query(sql)
            return NextResponse.json({ success: true })
        } catch (e) {
            return NextResponse.json({ success: false, message: e })
        }
    }
    return NextResponse.json({ success: false, message: "Invalid request" })
}