import { NextRequest,NextResponse } from "next/server";
import { connection } from "@/lib/db";
import { Chat,ChatResponse } from "@/lib/actions";

export async function POST(req:NextRequest){
    const chat:Chat = await req.json();
    if(chat.sendertype === 'user'){
        //frind conductor and busid from journey
        const sql = "SELECT id,busid FROM conductors WHERE busid = (SELECT busid FROM journeys WHERE id = (SELECT journeyid FROM bookings WHERE id = $1))";
        const res = await connection.query(sql,[chat.senderbookingid]);
        if(res.rowCount === 0){
            return NextResponse.json({error:"No conductor found for this booking",success:false},{status:400});
        }
        const conductorid = res.rows[0].id;
        const busid = res.rows[0].busid;
        chat.receiverconductorid = conductorid;
        chat.busid = busid;
    }else{
        const sql = "SELECT busid FROM conductors WHERE id = $1";
        const res = await connection.query(sql,[chat.senderconductorid]);
        if(res.rowCount === 0){
            return NextResponse.json({error:"No conductor found with this id",success:false},{status:400});
        }
        chat.busid = res.rows[0].busid;
    }
    chat.id = gen_random_uuid();
    chat.sentat = new Date();
    const insertSql = "INSERT INTO messages (id,sendertype,senderbookingid,senderconductorid,receivertype,receiverbookingid,receiverconductorid,busid,messagetext,sentat) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)";
    await connection.query(insertSql,[chat.id,chat.sendertype,chat.senderbookingid,chat.senderconductorid,chat.receivertype,chat.receiverbookingid,chat.receiverconductorid,chat.busid,chat.messagetext,chat.sentat]);
    return NextResponse.json(chat);
}

function gen_random_uuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}