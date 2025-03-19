import { connection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


type Routes = {
    name: string;
    completed: boolean;
};

type BusInfo = {
    busId: string;
    busName: string;
    state: string;
    routes: Routes[];
};

export async function POST(req: NextRequest) {
  try {
    const { conductorId } = await req.json();
    const sql = `
    SELECT
    b.id AS busId,
    b.name AS busName,
    j.status AS state,
    r.busstops AS routes,
    j.noofstopsdone AS noofstopsdone
    FROM buses b
    JOIN journeys j ON b.id = j.busid
    JOIN routes r ON j.routeid = r.id
    WHERE b.id = (SELECT busid FROM conductors WHERE id = $1)
    `
    const res = await connection.query(sql, [conductorId]);
    if (res.rowCount === 0) {
        return { error: "No bus found", success: false };
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
    const busData: BusInfo = {
        busId: resjson.busid,
        busName: resjson.busname,
        state: resjson.state,
        routes: routeArray
    };
    return NextResponse.json({ busData });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success : false,message : "error" }, { status: 500 })
  }
}