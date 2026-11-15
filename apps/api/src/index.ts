import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import medicationRoutes from './routes/medicationRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import chatbotRoutes from './routes/chatbotRoutes';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Root & Health check endpoints
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    service: 'ElderCare Connect Backend API',
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/medications', '/api/exercises', '/api/chatbot', '/api/health'],
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'ElderCare Connect Backend API',
    database: 'PostgreSQL ACID Engine',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`ElderCare backend API server running on port ${PORT}`);
});

export default app;
