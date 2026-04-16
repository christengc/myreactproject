// Entry point for Node.js backend

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mailRoutes from './routes/mail.js';
import healthRoutes from './routes/health.js';
import golfTrackingRoutes from './routes/golfTracking.js';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
app.use(morgan('combined'));
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://www.christenchristensen.dk', 'https://christenchristensen.dk']
}));

app.use(express.json({ limit: '5mb' }));
app.use('/api', mailRoutes);
app.use('/api', golfTrackingRoutes);
app.use('/',healthRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}/`);
});
