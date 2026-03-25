import env from './config/dotenv.js';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import app from './app.js';
import { initializeSocket } from './socket/socketServer.js';
import { startCronJobs } from './utils/cronJobs.js';

const PORT = Number(env.PORT) || 5000;

async function bootstrap() {
  try {
    await connectDB(env.MONGO_URI);
    const httpServer = createServer(app);
    initializeSocket(httpServer);
    startCronJobs();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

bootstrap();
