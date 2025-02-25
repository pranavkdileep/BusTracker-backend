import {Request, Response } from "express";
import fs from "fs";
const routes = [
    {
        busId: "123",
        route: '123.json',
    }
]

export const getBusRoutesHandler = async (req: Request, res: Response) => {
    const { busId } = req.body;
    const route = routes.find(route => route.busId === busId);
    if (!route) {
        res.status(404).send({ message: "Route not found" });
    }
    const filepath = 'raw/' + route?.route;
    if (!fs.existsSync(filepath)) {
        res.status(404).send({ message: "Route not found" });
    }
    const data = fs.readFileSync(filepath, 'utf-8');
    res.send(data);
}

export function streamBusLocation(busId: string | string[] | undefined, send: (data: any) => void) {
    let i = 0;
    const locations = fs.readFileSync('raw/123.json', 'utf-8');
    const parsedLocations = locations.split('},{')
    console.log(parsedLocations);
    setInterval(() => {
        const location = parsedLocations[i].replace('{', '').replace('}', '').replace('[', '').replace(']', '');
        i++;
        send(JSON.stringify({ busId, location }));
        console.log('sent: ', location);
    }, 1000);
}
//http://207.211.188.157:4578/api ws://localhost:3000/busLocation?busId=123