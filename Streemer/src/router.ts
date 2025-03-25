import { Router, Request, Response } from "express";
import { getBusRoutesHandler, streamBusLocation } from "./handlers";
import { Server } from "ws";
import { parse } from "url";

const router = Router();



router.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});



router.post('/getBusRoutes',getBusRoutesHandler);

export const logWebsoket =  (wss : Server) => {
    wss.on('connection', function connection(ws,req) {
      const bookId = parse(req.url!,true).query.bookId;
      console.log('connected to: %s', bookId);
        ws.on('message', function incoming(message) {
          console.log('received: %s', message);
        });
        streamBusLocation(bookId,(data)=>{
            ws.send(data);
        });
        
      });
    wss.on('error',function(err){
        console.log(err);
    });
}

export default router;


