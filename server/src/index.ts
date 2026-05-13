import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import abuseTypeRoute from './routes/abuseTypeRoutes.js';
import barangayRoute from './routes/barangayRoutes.js';
import authRoute from './routes/authRoutes.js';
import dispatchRoute from './routes/dispatchRoutes.js';
import offenderRoute from './routes/offenderRoutes.js';
import responderRoute from './routes/responderRoutes.js';
import victimRoute from './routes/victimRoutes.js';
import reportRoute from './routes/reportRoutes.js';
import { initReportSockets } from './sockets/reportSockets.js';
 
const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

app.use('/offender',offenderRoute);
app.use('/abuse-type',abuseTypeRoute);
app.use('/barangay',barangayRoute);
app.use('/auth',authRoute);
app.use('/dispatch',dispatchRoute);
app.use('/responder',responderRoute);
app.use('/victim',victimRoute);
app.use('/reports',reportRoute);

initReportSockets(io);

httpServer.listen(3000, () => {
    console.log('listening on http://localhost:3000');
});