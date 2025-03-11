import { NextResponse,NextRequest } from "next/server";
import { connection } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(req:NextRequest){
    const {conductorId,password} = await req.json();
    const sql = `SELECT * FROM conductors WHERE id = $1`;
    const rows = await connection.query(sql,[conductorId]);
    if(rows.rows.length === 0){
        return NextResponse.json({ error: 'Invalid conductor ID',success:false },{status:401});
    }
    else{
        if(rows.rows[0].password !== password){
            return NextResponse.json({ error: 'Invalid password',success:false },{status:401});
        }
        const token = jwt.sign({conductorId:rows.rows[0].id, busId:rows.rows[0].busid}, SECRET_KEY!,{ expiresIn: '1h' });
        return NextResponse.json({success:true,token});
    }
}