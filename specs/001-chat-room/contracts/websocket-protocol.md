# WebSocket Protocol Contract

**Feature**: 001-chat-room | **Version**: 1.0.0 | **Date**: 2025-11-07

## Overview

このドキュメントはクライアントとサーバー間のWebSocket通信プロトコルを定義します。すべてのメッセージはJSON形式で送受信され、TypeScript型定義により厳密に型付けされます。

## Connection Flow

### 1. WebSocket Connection Establishment

```
Client                          Server
  |                               |
  |--- WS Connect ws://host/ws -->|
  |                               |
  |<-- Connection Accepted -------|
  |                               |
```

**Endpoint**: `ws://localhost:3001/ws` (development)

**Protocol**: WebSocket (ws://) or Secure WebSocket (wss://)

### 2. Handshake and Authentication

```
Client                          Server
  |                               |
  |--- JOIN message -------------->|
  |    { type: "join",            |
  |      name: "ユーザー名" }      |
  |                               |
  |                               |--- Validate name
  |                               |--- Create/Update User
  |                               |--- Load message history
  |                               |
  |<-- WELCOME message ----------|
  |    { type: "welcome",         |
  |      userId: "...",           |
  |      history: [...] }         |
  |                               |
  |                               |--- Broadcast USER_JOINED
  |<-- USER_JOINED message -------|
  |    (to all other clients)     |
```

### 3. Message Exchange

```
Client                          Server
  |                               |
  |--- MESSAGE message ----------->|
  |    { type: "message",         |
  |      content: "Hello" }       |
  |                               |
  |                               |--- Save to database
  |                               |--- Broadcast to all
  |                               |
  |<-- MESSAGE broadcast ---------|
  |    { type: "message",         |
  |      message: {...} }         |
  |                               |
```

### 4. Disconnection

```
Client                          Server
  |                               |
  |--- Close connection ---------->|
  |                               |
  |                               |--- Update user offline
  |                               |--- Broadcast USER_LEFT
  |                               |
  |<-- USER_LEFT message ---------|
  |    (to all other clients)     |
```

## Message Types

### Client → Server Messages

#### 1. JOIN

ユーザーがチャットルームに参加します。

**Type Definition**:
```typescript
interface JoinMessage {
  type: 'join';
  name: string;
}
```

**Fields**:
- `type`: Must be `"join"`
- `name`: User name (1-50 characters, not blank)

**Example**:
```json
{
  "type": "join",
  "name": "太郎"
}
```

**Server Response**: WELCOME message

**Error Cases**:
- Invalid name format → ERROR message
- Name validation failure → ERROR message

---

#### 2. MESSAGE

ユーザーがメッセージを送信します。

**Type Definition**:
```typescript
interface SendMessageMessage {
  type: 'message';
  content: string;
}
```

**Fields**:
- `type`: Must be `"message"`
- `content`: Message content (1-1000 characters, not blank)

**Example**:
```json
{
  "type": "message",
  "content": "こんにちは、みなさん!"
}
```

**Server Response**: MESSAGE broadcast to all clients

**Error Cases**:
- User not joined → ERROR message
- Invalid content format → ERROR message
- Rate limit exceeded → ERROR message

---

#### 3. HEARTBEAT

クライアントがアクティブであることをサーバーに通知します。

**Type Definition**:
```typescript
interface HeartbeatMessage {
  type: 'heartbeat';
}
```

**Fields**:
- `type`: Must be `"heartbeat"`

**Example**:
```json
{
  "type": "heartbeat"
}
```

**Server Response**: None (updates lastActiveAt internally)

**Frequency**: Every 30 seconds recommended

---

### Server → Client Messages

#### 1. WELCOME

新しいユーザーの参加を確認し、必要な情報を提供します。

**Type Definition**:
```typescript
interface WelcomeMessage {
  type: 'welcome';
  userId: string;
  history: Message[];
}

interface Message {
  id: string;
  userId: string | null;
  userName: string;
  content: string;
  type: 'USER' | 'SYSTEM';
  createdAt: string; // ISO 8601
}
```

**Fields**:
- `type`: Always `"welcome"`
- `userId`: Assigned user ID (UUID)
- `history`: Array of latest 100 messages in chronological order

**Example**:
```json
{
  "type": "welcome",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "history": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "userId": null,
      "userName": "花子",
      "content": "花子さんが参加しました",
      "type": "SYSTEM",
      "createdAt": "2025-11-07T10:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "userId": "550e8400-e29b-41d4-a716-446655440003",
      "userName": "花子",
      "content": "こんにちは!",
      "type": "USER",
      "createdAt": "2025-11-07T10:00:05.000Z"
    }
  ]
}
```

---

#### 2. MESSAGE

新しいメッセージがチャットルームで送信されたことを全クライアントに通知します。

**Type Definition**:
```typescript
interface MessageBroadcast {
  type: 'message';
  message: Message;
}
```

**Fields**:
- `type`: Always `"message"`
- `message`: Complete message object

**Example**:
```json
{
  "type": "message",
  "message": {
    "id": "660e8400-e29b-41d4-a716-446655440004",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "太郎",
    "content": "おはようございます!",
    "type": "USER",
    "createdAt": "2025-11-07T10:05:00.000Z"
  }
}
```

**Broadcast Target**: All connected clients (including sender)

---

#### 3. USER_JOINED

新しいユーザーがチャットルームに参加したことを既存ユーザーに通知します。

**Type Definition**:
```typescript
interface UserJoinedMessage {
  type: 'user-joined';
  user: User;
  systemMessage: Message;
}

interface User {
  id: string;
  name: string;
  isOnline: boolean;
}
```

**Fields**:
- `type`: Always `"user-joined"`
- `user`: Joined user information
- `systemMessage`: System message announcing the join

**Example**:
```json
{
  "type": "user-joined",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "太郎",
    "isOnline": true
  },
  "systemMessage": {
    "id": "660e8400-e29b-41d4-a716-446655440005",
    "userId": null,
    "userName": "太郎",
    "content": "太郎さんが参加しました",
    "type": "SYSTEM",
    "createdAt": "2025-11-07T10:05:00.000Z"
  }
}
```

**Broadcast Target**: All connected clients except the joining user

---

#### 4. USER_LEFT

ユーザーがチャットルームを退出したことを通知します。

**Type Definition**:
```typescript
interface UserLeftMessage {
  type: 'user-left';
  userId: string;
  systemMessage: Message;
}
```

**Fields**:
- `type`: Always `"user-left"`
- `userId`: ID of the user who left
- `systemMessage`: System message announcing the departure

**Example**:
```json
{
  "type": "user-left",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "systemMessage": {
    "id": "660e8400-e29b-41d4-a716-446655440006",
    "userId": null,
    "userName": "太郎",
    "content": "太郎さんが退出しました",
    "type": "SYSTEM",
    "createdAt": "2025-11-07T10:10:00.000Z"
  }
}
```

**Broadcast Target**: All remaining connected clients

---

#### 5. ACTIVE_USERS

現在オンラインのユーザーリストを提供します（定期更新または要求時）。

**Type Definition**:
```typescript
interface ActiveUsersMessage {
  type: 'active-users';
  users: User[];
}
```

**Fields**:
- `type`: Always `"active-users"`
- `users`: Array of currently online users

**Example**:
```json
{
  "type": "active-users",
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "太郎",
      "isOnline": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "花子",
      "isOnline": true
    }
  ]
}
```

**Trigger**:
- On user join/leave
- On client request (future feature)

---

#### 6. ERROR

エラーが発生したことをクライアントに通知します。

**Type Definition**:
```typescript
interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
}
```

**Fields**:
- `type`: Always `"error"`
- `code`: Error code for programmatic handling
- `message`: Human-readable error message

**Example**:
```json
{
  "type": "error",
  "code": "INVALID_NAME",
  "message": "ユーザー名は1文字以上50文字以下で入力してください"
}
```

**Error Codes**:

| Code | Description | Action |
|------|-------------|--------|
| `INVALID_NAME` | Name validation failed | Show error, allow retry |
| `INVALID_MESSAGE` | Message content validation failed | Show error, allow retry |
| `NOT_JOINED` | User must join before sending messages | Redirect to join screen |
| `RATE_LIMIT` | Too many messages sent | Show warning, block temporarily |
| `INTERNAL_ERROR` | Server internal error | Show generic error, retry later |

**Broadcast Target**: Only the client that caused the error

---

## Type Definitions (Shared)

### Complete TypeScript Definitions

```typescript
// shared/types/websocket.ts

// ========================================
// Client → Server Messages
// ========================================

export type ClientMessage =
  | JoinMessage
  | SendMessageMessage
  | HeartbeatMessage;

export interface JoinMessage {
  type: 'join';
  name: string;
}

export interface SendMessageMessage {
  type: 'message';
  content: string;
}

export interface HeartbeatMessage {
  type: 'heartbeat';
}

// ========================================
// Server → Client Messages
// ========================================

export type ServerMessage =
  | WelcomeMessage
  | MessageBroadcast
  | UserJoinedMessage
  | UserLeftMessage
  | ActiveUsersMessage
  | ErrorMessage;

export interface WelcomeMessage {
  type: 'welcome';
  userId: string;
  history: Message[];
}

export interface MessageBroadcast {
  type: 'message';
  message: Message;
}

export interface UserJoinedMessage {
  type: 'user-joined';
  user: User;
  systemMessage: Message;
}

export interface UserLeftMessage {
  type: 'user-left';
  userId: string;
  systemMessage: Message;
}

export interface ActiveUsersMessage {
  type: 'active-users';
  users: User[];
}

export interface ErrorMessage {
  type: 'error';
  code: ErrorCode;
  message: string;
}

// ========================================
// Domain Types
// ========================================

export interface Message {
  id: string;
  userId: string | null;
  userName: string;
  content: string;
  type: MessageType;
  createdAt: string; // ISO 8601
}

export interface User {
  id: string;
  name: string;
  isOnline: boolean;
}

export type MessageType = 'USER' | 'SYSTEM';

export type ErrorCode =
  | 'INVALID_NAME'
  | 'INVALID_MESSAGE'
  | 'NOT_JOINED'
  | 'RATE_LIMIT'
  | 'INTERNAL_ERROR';
```

## Message Validation

### Client-Side Validation

クライアントは送信前に以下を検証すべきです（UX向上のため）:

```typescript
function validateName(name: string): boolean {
  return name.length >= 1 &&
         name.length <= 50 &&
         name.trim().length > 0;
}

function validateMessageContent(content: string): boolean {
  return content.length >= 1 &&
         content.length <= 1000 &&
         content.trim().length > 0;
}
```

### Server-Side Validation

サーバーは必ずすべての入力を検証します（セキュリティのため）:

```typescript
// Same validation rules as client
// Plus additional security checks:
// - Rate limiting
// - Authentication state
// - Connection state
```

## Error Handling

### Connection Errors

**Client Handling**:
```typescript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Attempt reconnection with exponential backoff
};

ws.onclose = (event) => {
  if (event.code === 1000) {
    // Normal closure
  } else {
    // Abnormal closure, attempt reconnection
    scheduleReconnect();
  }
};
```

**Reconnection Strategy**:
1. Initial retry: 1 second
2. Exponential backoff: 2s, 4s, 8s, 16s, 30s (max)
3. Maximum 5 retries
4. After 5 failures, show error to user

### Message Errors

**Server Error Response**:
```typescript
function sendError(ws: WebSocket, code: ErrorCode, message: string) {
  const errorMsg: ErrorMessage = {
    type: 'error',
    code,
    message
  };
  ws.send(JSON.stringify(errorMsg));
}
```

**Client Error Handling**:
```typescript
if (message.type === 'error') {
  switch (message.code) {
    case 'INVALID_NAME':
      showNameError(message.message);
      break;
    case 'INVALID_MESSAGE':
      showMessageError(message.message);
      break;
    case 'RATE_LIMIT':
      disableSendingTemporarily();
      break;
    default:
      showGenericError(message.message);
  }
}
```

## Security Considerations

### Input Sanitization

**Server-Side**:
- すべての文字列入力をバリデーション
- SQL Injection防止: Prismaのパラメータ化クエリ
- XSS防止: データベースには生のテキストを保存、フロントエンドで表示時にエスケープ

**Client-Side**:
- React default behavior: 自動でHTMLエスケープ
- `dangerouslySetInnerHTML`は使用しない

### Rate Limiting

**Implementation**:
```typescript
const userMessageCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = userMessageCounts.get(userId);

  if (!record || now > record.resetAt) {
    // Reset window (1 minute)
    userMessageCounts.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (record.count >= 10) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}
```

**Limits**:
- 10 messages per minute per user
- Excess messages rejected with RATE_LIMIT error

### Authentication

**Current Implementation** (MVP):
- No authentication required
- Users identified by WebSocket connection + session

**Future Enhancement**:
- JWT-based authentication
- Secure session tokens
- User account management

## Performance Optimization

### Message Compression

**Future Enhancement**:
- Enable WebSocket compression (permessage-deflate)
- Reduces bandwidth for text-heavy messages
- Trade-off: CPU usage for compression/decompression

### Binary Protocol

**Current**: JSON text messages
**Future Consideration**: Binary protocol (e.g., MessagePack, Protocol Buffers)
- Pros: Smaller payload, faster parsing
- Cons: Less debuggable, more complex

### Message Batching

**Not Implemented** (not needed for 20 users)
**Future Scale**: Batch messages within 100ms window for high-traffic scenarios

## Testing

### Contract Testing

**Unit Tests**:
```typescript
describe('Message Validation', () => {
  test('valid JOIN message', () => {
    const msg: JoinMessage = { type: 'join', name: '太郎' };
    expect(validateClientMessage(msg)).toBe(true);
  });

  test('invalid name in JOIN message', () => {
    const msg: JoinMessage = { type: 'join', name: '' };
    expect(validateClientMessage(msg)).toBe(false);
  });
});
```

**Integration Tests**:
```typescript
describe('WebSocket Protocol', () => {
  test('complete join flow', async () => {
    const client = new WebSocket('ws://localhost:3001/ws');

    // Send JOIN
    client.send(JSON.stringify({ type: 'join', name: '太郎' }));

    // Expect WELCOME
    const welcome = await waitForMessage(client);
    expect(welcome.type).toBe('welcome');
    expect(welcome.userId).toBeDefined();
  });
});
```

### Mock Server

**Development Tool**:
```typescript
// Mock WebSocket server for frontend development
class MockWebSocketServer {
  simulateJoin(name: string) {
    this.send({
      type: 'welcome',
      userId: 'mock-user-id',
      history: []
    });
  }

  simulateMessage(content: string) {
    this.send({
      type: 'message',
      message: {
        id: 'mock-msg-id',
        userId: 'mock-user-id',
        userName: 'テストユーザー',
        content,
        type: 'USER',
        createdAt: new Date().toISOString()
      }
    });
  }
}
```

## Version History

**v1.0.0** (2025-11-07):
- Initial protocol definition
- JOIN, MESSAGE, HEARTBEAT client messages
- WELCOME, MESSAGE, USER_JOINED, USER_LEFT, ACTIVE_USERS, ERROR server messages
- Type-safe TypeScript definitions

**Future Versions**:
- v1.1.0: Add message editing support
- v1.2.0: Add typing indicators
- v2.0.0: Add multiple room support (breaking change)

## References

- [WebSocket Protocol RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
