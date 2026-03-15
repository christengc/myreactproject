// Entry point for Node.js backend
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mailRoutes from './routes/mail.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use('/api', mailRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
