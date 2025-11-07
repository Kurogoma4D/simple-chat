# Research: リアルタイムチャットルーム

**Feature**: 001-chat-room | **Date**: 2025-11-07

## Overview

このドキュメントはリアルタイムチャットルーム機能の技術的な調査結果をまとめたものです。WebSocket通信、セッション管理、データ永続化に関する技術選択とベストプラクティスを記録します。

## Technology Decisions

### 1. WebSocket Library Selection

**Decision**: `ws` library for backend WebSocket server

**Rationale**:
- Node.jsで最も広く使用されているWebSocketライブラリ
- Express.jsと簡単に統合可能
- 軽量で高パフォーマンス
- TypeScript型定義が充実している
- 20人までの同時接続には十分な性能

**Alternatives Considered**:
- Socket.IO: より高レベルなAPIだが、本プロジェクトの要件にはオーバースペック。フォールバック機能（long polling）は初期バージョンでは不要
- uWebSockets.js: より高性能だが、C++バインディングが必要でDockerイメージサイズが増加する懸念

**Implementation Pattern**:
```typescript
import { WebSocketServer } from 'ws';
import { Server } from 'http';

// Express serverと統合
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws, req) => {
  // Connection handling
});
```

### 2. Frontend WebSocket Client

**Decision**: Native WebSocket API

**Rationale**:
- ブラウザネイティブのWebSocket APIで十分
- 追加の依存関係不要
- TypeScriptで型安全に使用可能
- React hooksでラップして再利用可能

**Implementation Pattern**:
```typescript
// Custom hook for WebSocket connection
function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    setWs(socket);
    return () => socket.close();
  }, [url]);

  return ws;
}
```

### 3. Session Management Strategy

**Decision**: In-memory session store with database persistence

**Rationale**:
- アクティブなWebSocket接続はメモリ上で管理（高速アクセス）
- ユーザー情報はデータベースに永続化（再接続時の復元）
- 20人までの規模ではRedisは不要
- シンプルで保守が容易

**Implementation Approach**:
```typescript
// In-memory active connections
const activeSessions = new Map<string, {
  ws: WebSocket;
  userId: string;
  userName: string;
}>();

// Database persistence via Prisma
await prisma.user.update({
  where: { id: userId },
  data: {
    isOnline: true,
    socketId: connectionId,
    lastActiveAt: new Date()
  }
});
```

### 4. Message Persistence Pattern

**Decision**: Immediate database write on message receive

**Rationale**:
- メッセージの信頼性を保証（WebSocketが切断されても失われない）
- 履歴機能の要件を満たす
- Prismaの非同期APIで書き込みとブロードキャストを並行実行
- 100件の履歴表示は十分高速（適切なインデックスで<50ms）

**Implementation Flow**:
1. WebSocketでメッセージ受信
2. データベースに保存（await）
3. 保存完了後、全接続クライアントにブロードキャスト
4. エラー時は送信者にエラー通知

### 5. Testing Strategy

**Decision**: Jest for unit/integration, Playwright for E2E

**Rationale**:
- Jest: TypeScriptエコシステムでの標準
- Backend service layerの単体テスト
- WebSocket integration tests with mock clients
- Playwright: Next.jsとの相性が良い、WebSocket E2Eテストをサポート

**Test Coverage**:
- Unit: Service層のビジネスロジック
- Integration: WebSocketメッセージフロー
- E2E: ユーザーシナリオ（参加、送信、切断）

## Best Practices

### WebSocket Connection Handling

**Reconnection Strategy**:
- フロントエンドで自動再接続を実装
- Exponential backoff（初回1秒、最大30秒）
- 最大5回のリトライ後、ユーザーに通知

**Heartbeat/Ping-Pong**:
```typescript
// Backend: 30秒ごとにping送信
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Client: pong応答
ws.on('pong', () => {
  ws.isAlive = true;
});
```

### Message Validation

**Input Sanitization**:
- 名前: 1-50文字、空白のみ禁止
- メッセージ: 1-1000文字、空白のみ禁止
- XSS対策: フロントエンドでエスケープ（React default behavior）
- SQL Injection対策: Prismaのパラメータ化クエリ（自動対策）

### Error Handling

**WebSocket Error Categories**:
1. Connection errors: 再接続試行
2. Message format errors: クライアントにエラー通知
3. Database errors: ログ記録 + 管理者通知
4. Authentication errors: 接続切断

### Performance Optimization

**Database Queries**:
```sql
-- Index for message history retrieval
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Index for user online status
CREATE INDEX idx_users_is_online ON users(is_online);
```

**Message Batching** (future optimization):
- 現在の要件（20人、<1秒配信）では不要
- 将来的にスケールする場合、100ms窓でメッセージをバッチ処理

## Security Considerations

### Rate Limiting

**Decision**: Simple in-memory rate limiter

**Implementation**:
- 1ユーザーあたり10メッセージ/分
- 超過時は警告メッセージ + 一時的な送信ブロック（30秒）

**Rationale**: 20人規模ではRedis-based rate limiterは不要

### Connection Validation

**Handshake Flow**:
1. Client sends name via WebSocket message
2. Server validates name format
3. Server creates/updates User record
4. Server responds with userId and session token
5. Client stores session info for reconnection

### Data Privacy

**PII Handling**:
- ユーザー名は公開情報として扱う
- 将来的な拡張（プロフィール、メール）は別テーブルで管理
- メッセージ削除機能は今回スコープ外

## Integration Patterns

### Frontend-Backend Communication

**Message Protocol**:
```typescript
// Shared types (shared/types/websocket.ts)
type ClientMessage =
  | { type: 'join'; name: string }
  | { type: 'message'; content: string }
  | { type: 'heartbeat' };

type ServerMessage =
  | { type: 'welcome'; userId: string; history: Message[] }
  | { type: 'message'; message: Message }
  | { type: 'user-joined'; user: User }
  | { type: 'user-left'; userId: string }
  | { type: 'error'; message: string };
```

### Docker Networking

**Service Communication**:
- Frontend → Backend: `http://backend:3001` (internal network)
- Frontend → WebSocket: `ws://backend:3001/ws` (client browser direct)
- Backend → Database: `postgresql://db:5432` (internal network)

**Port Mapping**:
- Frontend: 3000 (host) → 3000 (container)
- Backend: 3001 (host) → 3001 (container)
- Database: 5432 (host) → 5432 (container) [dev only]

### Environment Configuration

**Backend (.env)**:
```
DATABASE_URL=postgresql://user:pass@db:5432/chatdb
WS_PORT=3001
NODE_ENV=production
SESSION_TIMEOUT=1800000  # 30 minutes
```

**Frontend (.env)**:
```
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Migration Strategy

### Database Schema Evolution

**Initial Schema** (Prisma):
```prisma
model User {
  id           String    @id @default(uuid())
  name         String
  socketId     String?
  isOnline     Boolean   @default(false)
  lastActiveAt DateTime  @default(now())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  messages     Message[]

  @@index([isOnline])
}

model Message {
  id        String   @id @default(uuid())
  userId    String?
  userName  String
  content   String
  type      MessageType
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id])

  @@index([createdAt])
}

enum MessageType {
  USER
  SYSTEM
}
```

**Migration Plan**:
1. Initial migration: Create tables with indexes
2. Seed data: None required (users join dynamically)
3. Future migrations: Use Prisma migrate for schema changes

## Monitoring and Debugging

### Logging Strategy

**Log Levels**:
- ERROR: WebSocket errors, database errors
- WARN: Rate limit violations, invalid messages
- INFO: User join/leave, message count stats
- DEBUG: Message payload details (dev only)

**Structured Logging**:
```typescript
logger.info('User joined', {
  userId,
  userName,
  socketId,
  timestamp: new Date()
});
```

### Metrics to Track

**Application Metrics**:
- Active connections count
- Messages per minute
- Average message delivery time
- Database query latency

**Infrastructure Metrics**:
- Container CPU/memory usage
- WebSocket connection failures
- Database connection pool utilization

## Outstanding Questions

**RESOLVED**: Testing framework choice → Jest + Playwright

**Future Considerations**:
1. Horizontal scaling strategy (out of scope for 20 users)
2. Message retention policy (currently indefinite)
3. User profile features (future enhancement)
4. Admin moderation tools (not in initial scope)

## References

- [ws library documentation](https://github.com/websockets/ws)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Next.js WebSocket Integration](https://nextjs.org/docs)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
