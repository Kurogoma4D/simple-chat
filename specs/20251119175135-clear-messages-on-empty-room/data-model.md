# Data Model: Clear Messages on Empty Room

## Overview

この機能は既存のデータモデルを変更せず、既存のUser及びMessageエンティティを活用します。

## Existing Entities (No Changes)

### User

既存のUserモデルを使用します。オンライン状態の判定に`isOnline`属性を活用します。

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
```

**Relevant Fields for This Feature**:
- `isOnline`: ルームが空かどうかを判定するために使用（`isOnline = true`のユーザーが0人の場合、ルームは空）

### Message

既存のMessageモデルを使用します。メッセージ削除の対象エンティティです。

```prisma
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

**Operations for This Feature**:
- Delete all messages: `prisma.message.deleteMany({})`

## Data Flow

### Delete All Messages Flow

```text
1. User disconnects
   ↓
2. disconnectHandler handles disconnect
   ↓
3. UserService.leave(userId) - Update user.isOnline to false
   ↓
4. Check online user count
   ↓
5. If count === 0:
   ↓
6. MessageService.clearAllMessages() - Delete all messages
   ↓
7. Log deletion result
```

### State Transitions

#### User State
```text
Online (isOnline: true) → Offline (isOnline: false)
```

#### Message State
```text
Exists → Deleted (when room becomes empty)
```

## Validation Rules

### Pre-deletion Checks
- **Online user count must be zero**: メッセージ削除は、オンラインユーザー数が0の場合のみ実行
- **No transaction required**: メッセージ削除は単一操作のため、トランザクション不要

### Post-deletion Validation
- **Message count should be zero**: 削除後、メッセージテーブルは空である
- **User state unchanged**: メッセージ削除の成否に関わらず、ユーザーのオフライン状態は維持される

## Constraints

### Database Constraints
- 既存の外部キー制約を維持: `Message.userId → User.id (onDelete: SetNull)`
- メッセージ削除時、外部キー制約は影響しない（全削除のため）

### Application Constraints
- メッセージ削除はユーザー退出処理をブロックしてはならない
- メッセージ削除エラー時でも、ユーザー退出処理は成功しなければならない

## Schema Changes

**None** - 既存のPrismaスキーマに変更はありません。

## Migration Plan

**Not Applicable** - スキーマ変更がないため、マイグレーションは不要です。
