import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import barangayRoute from './routes/barangayRoutes.js';
import authRoute from './routes/authRoutes.js';
import reportRoute from './routes/reportRoutes.js';

const app = express()

app.use(cors())
app.use(express.json())

app.use('/barangay',barangayRoute);
app.use('/auth',authRoute);
app.use('/reports',reportRoute);

app.listen(3000, async () => {
    console.log("listening on http://localhost:3000")
})

