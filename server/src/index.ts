import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { getConn } from './config/db.js';

import barangayRoute from './routes/barangayRoutes.js';

const app = express()

app.use(cors())


app.use('/barangay',barangayRoute);

app.listen(3000, async () => {
    console.log("listening on http://localhost:3000")
})

