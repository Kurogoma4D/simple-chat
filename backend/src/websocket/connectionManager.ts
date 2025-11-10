import WebSocket from 'ws';

export interface ClientConnection {
  ws: WebSocket;
  userId: string;
  userName: string;
}

export class ConnectionManager {
  private connections: Map<string, ClientConnection> = new Map();

  add(socketId: string, connection: ClientConnection): void {
    this.connections.set(socketId, connection);
    console.log(`[ConnectionManager] Added connection: ${socketId} (${connection.userName})`);
  }

  remove(socketId: string): ClientConnection | undefined {
    const connection = this.connections.get(socketId);
    if (connection) {
      this.connections.delete(socketId);
      console.log(`[ConnectionManager] Removed connection: ${socketId}`);
    }
    return connection;
  }

  get(socketId: string): ClientConnection | undefined {
    return this.connections.get(socketId);
  }

  getByUserId(userId: string): ClientConnection | undefined {
    for (const connection of this.connections.values()) {
      if (connection.userId === userId) {
        return connection;
      }
    }
    return undefined;
  }

  getAll(): ClientConnection[] {
    return Array.from(this.connections.values());
  }

  getCount(): number {
    return this.connections.size;
  }
}

export const connectionManager = new ConnectionManager();
