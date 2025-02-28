import { Router } from "express";
import { BookingId, Bus, Chat, ChatTemplate, Conductor, Journey } from "./data/types";

export const adminRouter = Router();

const bus:Bus[] = [];
const bookingId:BookingId[] = [];
const conductor:Conductor[] = [];
const journey:Journey[] = [];
const chat:Chat[] = [];

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
  const newBookingId:BookingId = req.body;
  bookingId.push(newBookingId);
  res.send(newBookingId);
});

//create conductor
adminRouter.post("/conductor", (req, res) => {
  const newConductor:Conductor = req.body;
  conductor.push(newConductor);
  res.send(newConductor);
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
    const newChat = req.body;
    chat.push(newChat);
    res.send(newChat);
});

//retrive chat for booking id sended and received in order of time //retrive chat for conductor id sended and received in order of time
adminRouter.post("/getChat", (req, res) => {
    if(req.body.bookingId){
        const bookingId = req.body.bookingId;
        const chatData = chat.filter((c) => c.senderBookingId === bookingId || c.receiverBookingId === bookingId || c.receiverType === 'all');
        const chatTemplate:ChatTemplate[] = chatData.map((c) => {
            return {
                id: c.id,
                messageText: c.messageText,
                direction: c.senderBookingId === bookingId ? 'send' : 'receive',
                sentAt: c.sentAt
            }
        });
        res.send(chatTemplate);
    }
    if(req.body.conductorId){
        const conductorId = req.body.conductorId;
        const chatData = chat.filter((c) => c.senderConductorId === conductorId || c.receiverConductorId === conductorId);
        const chatTemplate:ChatTemplate[] = chatData.map((c) => {
            return {
                id: c.id,
                messageText: c.messageText,
                direction: c.senderConductorId === conductorId ? 'send' : 'receive',
                sentAt: c.sentAt
            }
        });
        res.send(chatTemplate);
    }
});