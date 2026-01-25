import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from './src/config/database.js';
import { corsConfig, environment } from './src/config/index.js';
import { errorHandlingMiddleware } from './src/middleware/index.js';
import gameSessionRoutes from './src/controllers/gameSessionRoutes.js';
import socketManager from './src/websocket/socketManager.js';
import logger from './src/utils/logger.js';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';




const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: corsConfig,
  transports: ['websocket', 'polling'],
  pingInterval: environment.WS_PING_INTERVAL,
  pingTimeout: environment.WS_PING_TIMEOUT,
});

// ============== Swagger Configuration ==============
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(
  path.join(__dirname, 'src/docs/swagger.yaml')
);

const gameSessionsPaths = YAML.load(
  path.join(__dirname, 'src/docs/game-sessions.yaml')
);
// Merge paths
swaggerDocument.paths = {
  ...swaggerDocument.paths,
  ...gameSessionsPaths,
};


// ============== Middleware ==============
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============== Health Check ==============
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Game Service is running',
    timestamp: new Date(),
  });
});

// ============== Swagger Documentation ==============
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ============== API Routes ==============
app.use('/api/game-sessions', gameSessionRoutes);

// ============== WebSocket Setup ==============
socketManager.initializeSocket(io);

// ============== Error Handling ==============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

app.use(errorHandlingMiddleware);

// ============== Server Startup ==============
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start HTTP server
    httpServer.listen(environment.PORT, () => {
      logger.info(`Game Service started on port ${environment.PORT}`);
      logger.info(`Environment: ${environment.NODE_ENV}`);
      logger.info(`WebSocket configured with CORS origin: ${environment.CORS_ORIGIN}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ============== Graceful Shutdown ==============
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();

export { app, httpServer, io };
