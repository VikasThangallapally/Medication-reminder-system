import env from './config/dotenv.js';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import app from './app.js';
import { initializeSocket } from './socket/socketServer.js';
import { startCronJobs } from './utils/cronJobs.js';
import { seedMedicineInfoIfNeeded } from './utils/seedMedicineInfo.js';

const PORT = Number(env.PORT) || 5000;

async function bootstrap() {
  try {
    await connectDB(env.MONGO_URI);
    await seedMedicineInfoIfNeeded();
    const httpServer = createServer(app);
    initializeSocket(httpServer);
    startCronJobs();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error?.message || error);
    if (error?.stack) {
      console.error(error.stack);
    }
    console.error('Startup env check:', {
      hasMongoUri: Boolean(env.MONGO_URI),
      hasJwtSecret: Boolean(env.JWT_SECRET),
      clientUrl: env.CLIENT_URL || null,
    });
    process.exit(1);
  }
}

bootstrap();
