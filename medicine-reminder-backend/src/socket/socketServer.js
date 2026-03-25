import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import env from '../config/dotenv.js';

let ioInstance;

function getTokenFromHandshake(socket) {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) {
    return String(authToken).replace(/^Bearer\s+/i, '');
  }

  const headerToken = socket.handshake?.headers?.authorization;
  if (headerToken) {
    return String(headerToken).replace(/^Bearer\s+/i, '');
  }

  return null;
}

export function initializeSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.use((socket, next) => {
    const token = getTokenFromHandshake(socket);

    // Authentication is optional; if token is present and JWT secret exists, validate it.
    if (token && env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.data.userId = String(decoded.id || decoded.userId || '');
      } catch {
        return next(new Error('Unauthorized socket connection'));
      }
    }

    return next();
  });

  ioInstance.on('connection', (socket) => {
    if (socket.data.userId) {
      socket.join(`user:${socket.data.userId}`);
    }

    socket.on('disconnect', () => {
      // No-op hook for future cleanup if needed.
    });
  });

  return ioInstance;
}

export function emitMedicineReminder(event) {
  if (!ioInstance) {
    return;
  }

  if (event?.userId) {
    ioInstance.to(`user:${event.userId}`).emit('medicineReminder', event);
    return;
  }

  ioInstance.emit('medicineReminder', event);
}
