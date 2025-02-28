import express,{json} from 'express';
import router, { logWebsoket } from './router'; 
import http from 'http';
import { WebSocketServer } from 'ws';
import { adminRouter } from './adminrouter';
import { expressjwt } from 'express-jwt';
import { conductorRouter } from './conductorroutes';

const app = express()
const server = http.createServer(app);
const port = 3000
export const SECRET_KEY = 'your-secret-key';

const authMedileware = expressjwt({
  secret: SECRET_KEY,
  algorithms: ['HS256'],
});

 
app.use(json());
app.use('/api', router);
app.use('/api/admin',adminRouter)

app.use('/api/conductor',authMedileware,conductorRouter);

app.use((err:any, req:any, res:any,next:any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const wss = new WebSocketServer({server,path:'/busLocation'});
logWebsoket(wss);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});