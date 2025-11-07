# Data Model: リアルタイムチャットルーム

**Feature**: 001-chat-room | **Date**: 2025-11-07

## Overview

このドキュメントはチャットルーム機能のデータモデルを定義します。2つの主要エンティティ（User、Message）とそれらの関係性、バリデーションルール、状態遷移を記述します。

## Entity Definitions

### User

ユーザーエンティティはチャットルームに参加するユーザーを表します。

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | UUID | Yes | ユーザーの一意識別子 | UUID v4 format |
| name | String | Yes | ユーザー名 | 1-50文字、空白のみ禁止 |
| socketId | String | No | WebSocket接続ID | 接続中のみ設定 |
| isOnline | Boolean | Yes | オンライン状態 | true/false, default: false |
| lastActiveAt | DateTime | Yes | 最終アクティブ日時 | ISO 8601 format |
| createdAt | DateTime | Yes | 作成日時 | ISO 8601 format, auto-set |
| updatedAt | DateTime | Yes | 更新日時 | ISO 8601 format, auto-update |

**Indexes**:
- Primary: `id` (UUID)
- Secondary: `isOnline` (for active user queries)

**Relationships**:
- One-to-Many with Message: 1人のユーザーは複数のメッセージを送信できる

**Business Rules**:
1. 同じ名前の複数ユーザーを許可（内部的にはidで区別）
2. `socketId`はWebSocket接続確立時に設定、切断時にnullに更新
3. `isOnline`はWebSocket接続状態と連動（接続時true、切断時false）
4. `lastActiveAt`はメッセージ送信時、および定期的なheartbeatで更新

### Message

メッセージエンティティはチャットルームで送受信されるメッセージを表します。

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | UUID | Yes | メッセージの一意識別子 | UUID v4 format |
| userId | UUID | No | 送信者のユーザーID | User.idへの外部キー、システムメッセージはnull |
| userName | String | Yes | 送信者名（スナップショット） | 1-50文字 |
| content | String | Yes | メッセージ内容 | 1-1000文字 |
| type | Enum | Yes | メッセージタイプ | USER or SYSTEM |
| createdAt | DateTime | Yes | 作成日時 | ISO 8601 format, auto-set |

**Indexes**:
- Primary: `id` (UUID)
- Secondary: `createdAt DESC` (for history retrieval)

**Relationships**:
- Many-to-One with User: 複数のメッセージは1人のユーザーに紐付く（userIdがnullでない場合）

**Business Rules**:
1. ユーザーメッセージ（type=USER）: `userId`は必須、実際に送信したユーザーのID
2. システムメッセージ（type=SYSTEM）: `userId`はnull、`userName`には対象ユーザー名を設定
3. `userName`はスナップショット（送信時のユーザー名を保存、後でユーザーが名前変更しても影響を受けない）
4. メッセージは削除不可（初期バージョン）、永続的に保存

### MessageType Enum

**Values**:
- `USER`: ユーザーが送信した通常のメッセージ
- `SYSTEM`: システムが自動生成したメッセージ（入室、退室通知）

## Entity Relationships

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ name            │
│ socketId        │
│ isOnline        │
│ lastActiveAt    │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │ 1
         │
         │ has many
         │
         │ N
┌────────┴────────┐
│    Message      │
│─────────────────│
│ id (PK)         │
│ userId (FK)     │◄── nullable for SYSTEM messages
│ userName        │
│ content         │
│ type            │
│ createdAt       │
└─────────────────┘
```

**Relationship Notes**:
- User → Message: Optional relationship (userがnullの場合あり)
- Cascade behavior: Userを削除した場合、関連Messageの`userId`をnullに設定（現在のスコープでは削除機能なし）

## State Transitions

### User State Lifecycle

```
┌─────────┐
│ Created │ (isOnline: false, socketId: null)
└────┬────┘
     │
     │ WebSocket connection established
     │
     ▼
┌─────────┐
│ Online  │ (isOnline: true, socketId: set)
└────┬────┘
     │
     │ WebSocket connection closed
     │
     ▼
┌─────────┐
│ Offline │ (isOnline: false, socketId: null)
└────┬────┘
     │
     │ Reconnection (within 30 minutes)
     │
     └───► Back to Online

     │ Session expired (30 minutes)
     │
     └───► User record remains but considered inactive
```

**State Transition Rules**:
1. **Created → Online**: 名前入力後、WebSocket接続確立時
2. **Online → Offline**: WebSocket切断時（ブラウザクローズ、ネットワーク切断）
3. **Offline → Online**: 同じユーザーが再接続（名前で識別）
4. セッションタイムアウト後もUser recordは残る（lastActiveAtで判定可能）

### Message State Lifecycle

```
┌─────────┐
│ Created │ (Immutable after creation)
└─────────┘
```

**State Notes**:
- メッセージは作成後、変更・削除不可（初期バージョン）
- 将来的な拡張: 編集、削除フラグ、既読管理

## Validation Rules

### User Validation

**Name Validation**:
```typescript
function validateUserName(name: string): boolean {
  // 1-50文字
  if (name.length < 1 || name.length > 50) return false;

  // 空白のみ禁止
  if (name.trim().length === 0) return false;

  return true;
}
```

**Session Validation**:
- `socketId`: WebSocket接続確立時に生成されるランダム文字列
- セッションタイムアウト: `lastActiveAt`から30分経過で無効

### Message Validation

**Content Validation**:
```typescript
function validateMessageContent(content: string): boolean {
  // 1-1000文字
  if (content.length < 1 || content.length > 1000) return false;

  // 空白のみ禁止
  if (content.trim().length === 0) return false;

  return true;
}
```

**Type Validation**:
- `type`は"USER"または"SYSTEM"のみ
- `type=SYSTEM`の場合、`userId`はnullでなければならない

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  id        String      @id @default(uuid())
  userId    String?
  userName  String
  content   String
  type      MessageType
  createdAt DateTime    @default(now())
  user      User?       @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([createdAt(sort: Desc)])
}

enum MessageType {
  USER
  SYSTEM
}
```

## Query Patterns

### Common Queries

**1. Get Active Users**:
```typescript
const activeUsers = await prisma.user.findMany({
  where: { isOnline: true },
  orderBy: { name: 'asc' }
});
```

**2. Get Message History (latest 100)**:
```typescript
const messages = await prisma.message.findMany({
  take: 100,
  orderBy: { createdAt: 'desc' },
  include: {
    user: {
      select: { id: true, name: true }
    }
  }
});
// Reverse to chronological order
messages.reverse();
```

**3. Create User Message**:
```typescript
const message = await prisma.message.create({
  data: {
    userId: user.id,
    userName: user.name,
    content: messageContent,
    type: 'USER'
  },
  include: {
    user: true
  }
});
```

**4. Create System Message**:
```typescript
const systemMessage = await prisma.message.create({
  data: {
    userId: null,
    userName: user.name,
    content: `${user.name}さんが参加しました`,
    type: 'SYSTEM'
  }
});
```

**5. Update User Online Status**:
```typescript
await prisma.user.update({
  where: { id: userId },
  data: {
    isOnline: true,
    socketId: connectionId,
    lastActiveAt: new Date()
  }
});
```

**6. Find or Create User by Name**:
```typescript
const user = await prisma.user.upsert({
  where: { name: userName },
  update: {
    isOnline: true,
    socketId: connectionId,
    lastActiveAt: new Date()
  },
  create: {
    name: userName,
    isOnline: true,
    socketId: connectionId
  }
});
```

## Performance Considerations

### Index Strategy

**Primary Indexes**:
- `User.id`: Primary key, automatic
- `Message.id`: Primary key, automatic

**Secondary Indexes**:
- `User.isOnline`: For active user list queries (low cardinality, but frequently accessed)
- `Message.createdAt DESC`: For message history retrieval (range queries)

**Index Analysis**:
- 20 concurrent users: Minimal index overhead
- 100 message history: Index scan ~1-5ms
- Full table scans acceptable for this scale

### Query Optimization

**N+1 Prevention**:
```typescript
// ❌ Bad: N+1 query
const messages = await prisma.message.findMany();
for (const msg of messages) {
  const user = await prisma.user.findUnique({ where: { id: msg.userId } });
}

// ✅ Good: Include relation
const messages = await prisma.message.findMany({
  include: { user: true }
});
```

**Connection Pooling**:
- Prisma default pool size: 10 connections
- Sufficient for 20 concurrent users + background tasks

## Data Migration

### Initial Migration

```bash
# Generate migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy
```

### Seed Data

初期データは不要（ユーザーは動的に参加）

**Optional Test Data** (development):
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  await prisma.user.createMany({
    data: [
      { name: 'テストユーザー1', isOnline: false },
      { name: 'テストユーザー2', isOnline: false }
    ]
  });

  // Create welcome message
  await prisma.message.create({
    data: {
      userName: 'System',
      content: 'チャットルームへようこそ!',
      type: 'SYSTEM'
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Future Enhancements

### Planned Extensions

1. **Message Editing**:
   - Add `editedAt: DateTime?` field
   - Add `isEdited: Boolean` flag

2. **Message Deletion**:
   - Add `deletedAt: DateTime?` (soft delete)
   - Add `isDeleted: Boolean` flag

3. **User Profiles**:
   - New `UserProfile` table with avatar, bio, etc.
   - One-to-One relationship with User

4. **Read Receipts**:
   - New `MessageRead` join table
   - Track which users have read which messages

5. **Multiple Chat Rooms**:
   - New `Room` entity
   - User-Room many-to-many relationship
   - Message belongs to Room

### Schema Evolution Strategy

- Use Prisma migrations for all schema changes
- Maintain backward compatibility when possible
- Plan data migrations for breaking changes
- Version API contracts when schema changes affect endpoints

## References

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [UUID Best Practices](https://en.wikipedia.org/wiki/Universally_unique_identifier)
- [Database Indexing Strategies](https://use-the-index-luke.com/)
