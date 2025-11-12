/**
 * WebSocket setup functions for integration tests
 */

import http from 'http';
import WebSocket from 'ws';

export interface TestServer {
  server: http.Server;
  wss: WebSocket.Server;
  port: number;
}

/**
 * Setup test WebSocket server
 * - Start Express server
 * - Attach WebSocket server
 * @param port - Listening port (default: random port)
 * @returns Server instance and port number
 */
export async function setupTestWebSocketServer(port?: number): Promise<TestServer> {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    const wss = new WebSocket.Server({ server });

    // Handle WebSocket connections
    wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => {
        // Echo message to all connected clients (simple broadcast)
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });

      // Send welcome message
      ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to test server' }));
    });

    const actualPort = port || 0; // 0 = random port

    server.listen(actualPort, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to get server address'));
        return;
      }

      resolve({
        server,
        wss,
        port: address.port,
      });
    });

    server.on('error', reject);
  });
}

/**
 * Teardown test WebSocket server
 * - Close all client connections
 * - Stop server
 * @param testServer - Test server instance
 */
export async function teardownTestWebSocketServer(testServer: TestServer): Promise<void> {
  return new Promise((resolve, reject) => {
    // Close all WebSocket connections
    testServer.wss.clients.forEach((client) => {
      client.close();
    });

    // Close WebSocket server
    testServer.wss.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      // Close HTTP server
      testServer.server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

/**
 * Create test WebSocket client
 * @param port - Port to connect to
 * @param userName - Username to send on connection
 * @returns WebSocket client instance
 */
export async function createTestWebSocketClient(
  port: number,
  userName: string
): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);

    ws.on('open', () => {
      // Send username on connection
      ws.send(JSON.stringify({ type: 'join', userName }));
      resolve(ws);
    });

    ws.on('error', reject);

    // Timeout after 5 seconds
    setTimeout(() => {
      reject(new Error('WebSocket connection timeout'));
    }, 5000);
  });
}

/**
 * Wait for WebSocket message
 * @param client - WebSocket client
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @returns Received message data
 */
export async function waitForWebSocketMessage(
  client: WebSocket,
  timeout: number = 5000
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('WebSocket message timeout'));
    }, timeout);

    client.once('message', (data: WebSocket.Data) => {
      clearTimeout(timer);
      try {
        const message = JSON.parse(data.toString());
        resolve(message);
      } catch (err) {
        resolve(data.toString());
      }
    });

    client.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
