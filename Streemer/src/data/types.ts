export interface Bus{
    id:string;
    name:string;
    currentLocation:string;
    state: 'moving' | 'stopped';
    speed:number;
}
export interface BookingId{
    id:string
    busId:string
}
export interface Conductor{
    id:string;
    name:string;
    busId:string;
    password:string;
}
export interface Journey{
    id:string;
    busId:string;
    conductorId:string;
    routfile:string;
}

export interface Chat {
    id?: string;
    senderType: 'user' | 'conductor';
    senderBookingId?: string;
    senderConductorId?: string;
    receiverType: 'user' | 'all';
    receiverBookingId?: string;
    receiverConductorId?: string;
    busId?: string;
    messageText: string;
    sentAt: Date;
}

export interface ChatResponse{
    id:string;
    messageText:string;
    sentAt:Date;
    direction:'send' | 'received';
    from : 'user' | 'conductor';
    bookingId?:string;
    conductorId?:string;
}