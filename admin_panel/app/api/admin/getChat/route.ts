import { NextRequest,NextResponse } from "next/server";
import { connection } from "@/lib/db";
import { Chat,ChatResponse } from "@/lib/actions";

export async function POST(req:NextRequest){
    const {conductorId,bookId} = await req.json();
    if(conductorId === undefined && bookId === undefined){
        return NextResponse.json({error:"Invalid request",success:false},{status:400});
    }
    else if(conductorId === '' || bookId === ''){
        return NextResponse.json({error:"Invalid request",success:false},{status:400});
    }
    else if(bookId){
        const sql = "SELECT * FROM messages WHERE receiverbookingid = $1 OR senderbookingid = $1 OR ( sendertype = 'conductor' AND receivertype = 'all' AND busid = (SELECT busid FROM journeys WHERE id = (SELECT journeyid FROM bookings WHERE id = $1)))";
        const res = await connection.query(sql,[bookId]);
        if(res.rowCount === 0){
            return NextResponse.json({error:"No chat found for this booking",success:false},{status:400});
        }
        const chatData:ChatResponse[] = res.rows.map((row) => {
            return {
                id:row.id,
                messageText:row.messagetext,
                sentAt:row.sentat,
                direction:row.sendertype === 'user' ? 'send' : 'received',
                from:row.sendertype,
            }
        });
        return NextResponse.json(chatData);
    }
    else if(conductorId){
        const sql = "SELECT * FROM messages WHERE receiverconductorid = $1 OR senderconductorid = $1";
        const res = await connection.query(sql,[conductorId]);
        if(res.rowCount === 0){
            return NextResponse.json({error:"No chat found for this conductor",success:false},{status:400});
        }
        const chatData:ChatResponse[] = res.rows.map((row) => {
            return {
                id:row.id,
                messageText:row.messagetext,
                sentAt:row.sentat,
                direction:row.sendertype === 'user' ? 'received' : 'send',
                from:row.sendertype,
                bookingId:row.senderbookingid
            }
        });
        return NextResponse.json(chatData);
    }
    return NextResponse.json({error:"Invalid request",success:false},{status:400});
}