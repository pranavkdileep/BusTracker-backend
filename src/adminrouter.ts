import { Router } from "express";
import { BookingId, Bus, Chat, ChatResponse, Conductor, Journey } from "./data/types";
import { generateUID } from "./handlers";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from ".";

export const adminRouter = Router();

export const bus:Bus[] = [];
export const bookingId:BookingId[] = [];
export const conductor:Conductor[] = [];
export const journey:Journey[] = [];
export const chat:Chat[] = [];

adminRouter.get("/", (req, res) => {
  res.send("Admin Home");
});

//create bus
adminRouter.post("/bus", (req, res) => {
  const newBus:Bus = req.body;
  bus.push(newBus);
  res.send(newBus);
});

//create bookingId
adminRouter.post("/bookingId", (req, res) => {
  const busId = req.body.busId;
  const Id = generateUID();
  const newBookingId:BookingId = {id:Id, busId:busId};
  bookingId.push(newBookingId);
  res.send(bookingId);
});

//create conductor
adminRouter.post("/conductor", (req, res) => {
  const newConductor:Conductor = req.body;
  conductor.push(newConductor);
  res.send(newConductor);
});
//login conductor
adminRouter.post("/conductor/login", (req, res) => {
  const {conductorId,password} = req.body;
  const foundConductor = conductor.find((c) => c.id === conductorId);
  if(!foundConductor){
    res.status(400).json({ error: 'Invalid conductor ID',success:false });
  }
  if(foundConductor!.password !== password){
    res.status(400).json({ error: 'Invalid password',success:false });
  }
  const token = jwt.sign({conductorId:foundConductor?.id, busId:foundConductor?.busId}, SECRET_KEY,{ expiresIn: '1h' });
  res.send({success:true,token});

});

//create journey
adminRouter.post("/journey", (req, res) => {
  const newJourney:Journey = req.body;
  journey.push(newJourney);
  res.send(newJourney);
});

//get busId from bookingId
adminRouter.get("/bus/:bookingId", (req, res) => {
  const bookId = req.params.bookingId;
  const busId = bookingId.find((b) => b.id === bookId);
  res.send(busId);
});

//chat
adminRouter.post("/chat", (req, res) => {
  let data:Chat = req.body;
  data.id = generateUID();
  data.sentAt = new Date();
  if(data.senderType === 'user'){
    const foundBooking = bookingId.find((b) => b.id === data.senderBookingId);
    if(!foundBooking){
       res.status(400).json({ error: 'Invalid booking ID' });
    }

    const foundConductor = conductor.find((c) => c.busId === foundBooking!.busId);
    if(!foundConductor){
      console.log(`busId: ${foundBooking!.busId} and cunductorlist ${conductor}`);
       res.status(400).json({ error: 'No conductor found for this bus' });
    }

    data.receiverConductorId = foundConductor!.id;
    data.busId = foundBooking!.busId;
  }else{
    let busId = conductor.find((c) => c.id === data.senderConductorId);
    data.busId = busId!.busId;
  }
  chat.push(data);
  res.send(data);
});

//retrive chat for booking id sended and received in order of time //retrive chat for conductor id sended and received in order of time
adminRouter.post("/getChat", (req, res) => {
    if(req.body.bookId){
        const bookId = req.body.bookId;
        const busId = bookingId.find((b) => b.id === bookId);
        let Responsedata:ChatResponse[] = [];
        const chatData = chat.filter((c) => {
            return c.senderBookingId === bookId || c.receiverBookingId === bookId || (c.senderType === 'conductor' && c.busId === busId?.busId && c.receiverType === 'all');
        });
        chatData.forEach((c) => {
            let chatResponse:ChatResponse = {
                id:c.id!,
                messageText:c.messageText,
                sentAt:c.sentAt,
                direction:c.senderType === 'user' ? 'send' : 'received',
                from:c.senderType,
            };
            Responsedata.push(chatResponse);
        });
        res.send(Responsedata);
    }
    if(req.body.conductorId){
        const conductorId = req.body.conductorId;
        let Responsedata:ChatResponse[] = [];
        const chatData = chat.filter((c) => {
            return c.senderConductorId === conductorId || c.receiverConductorId === conductorId;
        });
        chatData.forEach((c) => {
            let chatResponse:ChatResponse = {
                id:c.id!,
                messageText:c.messageText,
                sentAt:c.sentAt,
                direction:c.senderType === 'conductor' ? 'send' : 'received',
                from:c.senderType,
                bookingId:c.senderBookingId,
            };
            Responsedata.push(chatResponse);
        });
        res.send(Responsedata);
    }
});