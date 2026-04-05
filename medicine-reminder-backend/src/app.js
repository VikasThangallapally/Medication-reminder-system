import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import caregiverRoutes from './routes/caregiverRoutes.js';
import credentialRoutes from './routes/credentialRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import medicineInfoRoutes from './routes/medicineInfoRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Medicine Reminder backend is live',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/medicine-info', medicineInfoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reminders', reminderRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
