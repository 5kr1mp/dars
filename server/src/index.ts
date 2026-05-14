import express from 'express';
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import 'dotenv/config';
import abuseTypeRoute from './routes/abuseTypeRoutes.js'
import barangayRoute from './routes/barangayRoutes.js'
import authRoute from './routes/authRoutes.js'
import dispatchRoute from './routes/dispatchRoutes.js'
import offenderRoute from './routes/offenderRoutes.js';
import responderRoute from './routes/responderRoutes.js'
import victimRoute from './routes/victimRoutes.js';
import reportRoute from './routes/reportRoutes.js'
import staffRoute from './routes/staffRoutes.js'
import auditLogRoute from './routes/auditLogRoutes.js'
import { initReportSockets } from './sockets/reportSockets.js';
import { sendSuccess } from './utils/response.js';
 
const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    sendSuccess(res,200,"API is running",null)
})
app.use('/api/offender',offenderRoute);
app.use('/api/abuse-type',abuseTypeRoute);
app.use('/api/barangay',barangayRoute);
app.use('/api/auth',authRoute);
app.use('/api/dispatch',dispatchRoute);
app.use('/api/responder',responderRoute);
app.use('/api/victim',victimRoute);
app.use('/api/reports',reportRoute);
app.use('/api/staff',staffRoute)
app.use('/api/audit-log',auditLogRoute)

initReportSockets(io);

const port = 8000;
httpServer.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
});