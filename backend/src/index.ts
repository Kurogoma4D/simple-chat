import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { setupWebSocketServer } from './websocket/server';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.WS_PORT || 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Setup WebSocket server
const wss = setupWebSocketServer(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`[Server] HTTP server running on port ${PORT}`);
  console.log(`[Server] WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  wss.close(() => {
    httpServer.close(() => {
      console.log('[Server] Server closed');
      process.exit(0);
    });
  });
});

export { app, httpServer, wss };
