import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import barangayRoute from './routes/barangayRoutes.js';
import authRoute from './routes/authRoutes.js';

const app = express()

app.use(cors())

app.use('/barangay',barangayRoute);
app.use('/auth',authRoute);

app.listen(3000, async () => {
    console.log("listening on http://localhost:3000")
})

