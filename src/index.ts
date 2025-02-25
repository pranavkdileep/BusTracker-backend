import express,{json} from 'express';
import router, { logWebsoket } from './router'; 
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express()
const server = http.createServer(app);
const port = 3000
app.use(json());
app.use('/api', router);

const wss = new WebSocketServer({server,path:'/busLocation'});
logWebsoket(wss);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});