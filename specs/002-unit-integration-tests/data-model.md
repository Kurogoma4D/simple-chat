# Data Model: 単体テスト・結合テスト

**Feature**: 002-unit-integration-tests
**Date**: 2025-11-11
**Spec**: [spec.md](./spec.md)

## Overview

このドキュメントは、テスト対象のデータモデル（UserとMessage）の詳細定義を記述します。実装は既存のPrismaスキーマ（`backend/prisma/schema.prisma`）に基づいており、テストではこれらのモデルの整合性、バリデーション、関連性を検証します。

## Entities

### User

**Description**: チャットルームに参加するユーザーを表すエンティティ。アカウント登録不要で、名前のみで参加できる。WebSocket接続の状態とセッション情報を管理する。

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (UUID) | Primary Key, Auto-generated | ユーザーの一意識別子 |
| name | String | Required, Max length: 50 | ユーザーの表示名 |
| socketId | String | Optional, Nullable | WebSocket接続ID（接続中のみ設定） |
| isOnline | Boolean | Default: false, Indexed | オンライン状態（接続中はtrue） |
| lastActiveAt | DateTime | Default: now() | 最終アクティブ日時 |
| createdAt | DateTime | Default: now() | ユーザー作成日時 |
| updatedAt | DateTime | Auto-updated | 最終更新日時 |

**Relationships**:
- `messages`: 1対多の関連でMessageエンティティと接続（User → Message）
- ユーザーが削除された場合、関連するメッセージのuserIdはnullに設定される（onDelete: SetNull）

**Validation Rules** (テストで検証):
- name: 空文字禁止、50文字以下
- socketId: WebSocket接続IDの形式（実装依存）
- isOnline: Boolean値のみ
- id: UUID v4形式

**State Transitions**:
```text
[New User]
  → name入力
  → User作成 (isOnline=false, socketId=null)
  → WebSocket接続
  → isOnline=true, socketId設定
  → WebSocket切断
  → isOnline=false, socketId=null
  → 再接続時はlastActiveAt更新
```

**Indexes**:
- `isOnline`: オンラインユーザーの高速検索のため

**Test Focus**:
- 有効なユーザーデータでの作成
- 無効なデータ（空の名前、不正なUUID）でのエラー
- オンライン状態の遷移
- socketIdの設定/クリア
- lastActiveAtの自動更新
- createdAt/updatedAtのタイムスタンプ管理

---

### Message

**Description**: チャットルームで送受信されるメッセージを表すエンティティ。ユーザーメッセージとシステムメッセージの2種類がある。送信時のユーザー名はスナップショットとして保存される。

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (UUID) | Primary Key, Auto-generated | メッセージの一意識別子 |
| userId | String (UUID) | Optional, Foreign Key → User.id | 送信者のユーザーID（システムメッセージの場合はnull） |
| userName | String | Required | 送信時のユーザー名（スナップショット） |
| content | String | Required, Max length: 1000 | メッセージ本文 |
| type | MessageType | Required, Enum | メッセージタイプ（USER / SYSTEM） |
| createdAt | DateTime | Default: now(), Indexed (DESC) | メッセージ送信日時 |

**Relationships**:
- `user`: 多対1の関連でUserエンティティと接続（Message → User）
- userIdがnullの場合はシステムメッセージ（ユーザー参加/退出通知など）
- ユーザーが削除された場合、userIdはnullに設定されるが、userNameは保持される

**Validation Rules** (テストで検証):
- userId: UUID v4形式（設定されている場合）、またはnull
- userName: 空文字禁止、50文字以下
- content: 空文字禁止、1000文字以下
- type: "USER" または "SYSTEM" のみ
- id: UUID v4形式

**Message Types**:
- `USER`: 通常のユーザーメッセージ（userIdが設定されている）
- `SYSTEM`: システムメッセージ（userIdがnull、例: "〇〇さんが参加しました"）

**Indexes**:
- `createdAt (DESC)`: メッセージ履歴の降順検索のため（最新メッセージを高速取得）

**Test Focus**:
- ユーザーメッセージの作成（userId設定）
- システムメッセージの作成（userId=null）
- 無効なデータ（空のcontent、不正なtype）でのエラー
- userIdとuserNameの一貫性
- createdAtの自動設定
- 時系列順の検索

---

### MessageType (Enum)

**Values**:
- `USER`: ユーザーが送信したメッセージ
- `SYSTEM`: システムが生成したメッセージ

**Usage**: Messageエンティティのtypeフィールドで使用

---

## Data Relationships

```text
User (1) ----< (N) Message
  id             userId (nullable)
  name           userName (snapshot)

Relationship Type: One-to-Many
Cascade: onDelete SetNull (ユーザー削除時、メッセージは保持、userIdのみnull化)
```

**Key Points**:
- 1人のユーザーは複数のメッセージを送信できる
- 1つのメッセージは1人のユーザーに属する（システムメッセージを除く）
- userNameはスナップショット（メッセージ送信時の名前を保存）
  - ユーザーが名前を変更しても、過去のメッセージのuserNameは変わらない
- ユーザー削除後もメッセージは保持される（userNameで誰が送信したかは確認可能）

## Domain Rules

### User Domain Rules

1. **名前の一意性**: 同じ名前の複数ユーザーを許可（内部的にはUUIDで区別）
2. **オンライン状態**: WebSocket接続時のみtrue、切断時はfalse
3. **socketIdのライフサイクル**: 接続時に設定、切断時にnull化
4. **lastActiveAtの更新**: メッセージ送信、接続維持などのアクティビティで更新

### Message Domain Rules

1. **送信者情報の保持**: userNameは常にスナップショット（送信時の名前を保存）
2. **システムメッセージ**: userIdがnullの場合、typeは必ずSYSTEM
3. **ユーザーメッセージ**: userIdが設定されている場合、typeは必ずUSER
4. **時系列順**: createdAtで降順ソート（最新が最初）

## Test Data Examples

### Valid User

```typescript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "山田太郎",
  socketId: "abc123xyz",
  isOnline: true,
  lastActiveAt: new Date("2025-11-11T10:00:00Z"),
  createdAt: new Date("2025-11-11T09:00:00Z"),
  updatedAt: new Date("2025-11-11T10:00:00Z")
}
```

### Valid User Message

```typescript
{
  id: "660e8400-e29b-41d4-a716-446655440000",
  userId: "550e8400-e29b-41d4-a716-446655440000",
  userName: "山田太郎",
  content: "こんにちは！",
  type: "USER",
  createdAt: new Date("2025-11-11T10:01:00Z")
}
```

### Valid System Message

```typescript
{
  id: "770e8400-e29b-41d4-a716-446655440000",
  userId: null,
  userName: "システム",
  content: "山田太郎さんが参加しました",
  type: "SYSTEM",
  createdAt: new Date("2025-11-11T09:00:00Z")
}
```

### Invalid Examples (Should Fail Validation)

```typescript
// Invalid User: 空の名前
{
  name: "",
  // ... other fields
}

// Invalid User: 長すぎる名前
{
  name: "a".repeat(51),
  // ... other fields
}

// Invalid Message: 空のコンテンツ
{
  content: "",
  // ... other fields
}

// Invalid Message: 不正なtype
{
  type: "ADMIN", // USER or SYSTEM のみ許可
  // ... other fields
}

// Invalid Message: userIdとtypeの不整合
{
  userId: null,
  type: "USER", // userIdがnullの場合はSYSTEMであるべき
  // ... other fields
}
```

## Implementation Notes

### Prisma Client Usage

テストでは、実際のPrismaクライアントを使用します（モックではなく）。

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// User作成
const user = await prisma.user.create({
  data: {
    name: '山田太郎',
  },
});

// Message作成（Userに関連付け）
const message = await prisma.message.create({
  data: {
    userId: user.id,
    userName: user.name,
    content: 'こんにちは！',
    type: 'USER',
  },
});

// オンラインユーザーの検索
const onlineUsers = await prisma.user.findMany({
  where: { isOnline: true },
});

// 最新メッセージの取得
const recentMessages = await prisma.message.findMany({
  orderBy: { createdAt: 'desc' },
  take: 100,
});
```

### Test Data Factories

ファクトリ関数を使用してテストデータを生成します（research.mdで定義）。

```typescript
// tests/unit/helpers/factories.ts
import { randomUUID } from 'crypto';

export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: randomUUID(),
    name: 'Test User',
    socketId: null,
    isOnline: false,
    lastActiveAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestMessage(overrides?: Partial<Message>): Message {
  return {
    id: randomUUID(),
    userId: randomUUID(),
    userName: 'Test User',
    content: 'Test message',
    type: 'USER',
    createdAt: new Date(),
    ...overrides,
  };
}
```

## Database Schema Reference

実装はPrismaスキーマに基づきます: `backend/prisma/schema.prisma`

- UUID: `@default(uuid())` でPrismaが自動生成
- DateTime: `@default(now())` でPrismaが自動設定
- updatedAt: `@updatedAt` でPrismaが自動更新
- Indexes: 検索パフォーマンスのため
- Enum: MessageTypeはPrismaのenum型として定義

## Test Coverage Requirements

data-model層のテストカバレッジは95%以上を目標とします。

**カバレッジ対象**:
- すべてのフィールドの作成・読み取り
- すべてのバリデーションルール
- すべての関連（User-Message）
- すべての状態遷移（オンライン/オフライン）
- すべてのエッジケース（null、空文字、上限値）

**カバレッジ除外**:
- Prisma自動生成コード
- 型定義ファイル（*.d.ts）
