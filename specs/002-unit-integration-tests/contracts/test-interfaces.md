# Test Interfaces: 単体テスト・結合テスト

**Feature**: 002-unit-integration-tests
**Date**: 2025-11-11

## Overview

このドキュメントは、テストで使用するインターフェース、型定義、およびテストヘルパー関数の仕様を定義します。実装は`backend/tests/unit/helpers/`に配置されます。

## Type Definitions

### User Type

```typescript
/**
 * ユーザーエンティティの型定義
 * Prismaから生成された型と互換性があります
 */
interface User {
  /** ユーザーの一意識別子（UUID v4） */
  id: string;

  /** ユーザーの表示名（最大50文字） */
  name: string;

  /** WebSocket接続ID（接続中のみ設定、切断時はnull） */
  socketId: string | null;

  /** オンライン状態（接続中はtrue、切断時はfalse） */
  isOnline: boolean;

  /** 最終アクティブ日時 */
  lastActiveAt: Date;

  /** ユーザー作成日時 */
  createdAt: Date;

  /** 最終更新日時（自動更新） */
  updatedAt: Date;
}
```

### Message Type

```typescript
/**
 * メッセージエンティティの型定義
 * Prismaから生成された型と互換性があります
 */
interface Message {
  /** メッセージの一意識別子（UUID v4） */
  id: string;

  /** 送信者のユーザーID（システムメッセージの場合はnull） */
  userId: string | null;

  /** 送信時のユーザー名（スナップショット、最大50文字） */
  userName: string;

  /** メッセージ本文（最大1000文字） */
  content: string;

  /** メッセージタイプ（"USER" または "SYSTEM"） */
  type: MessageType;

  /** メッセージ送信日時 */
  createdAt: Date;
}
```

### MessageType Enum

```typescript
/**
 * メッセージタイプ
 */
enum MessageType {
  /** ユーザーが送信したメッセージ */
  USER = 'USER',

  /** システムが生成したメッセージ */
  SYSTEM = 'SYSTEM'
}
```

## Test Factory Functions

### createTestUser

```typescript
/**
 * テスト用のUserオブジェクトを生成します
 * デフォルト値を持ち、オーバーライドで一部のフィールドをカスタマイズ可能
 *
 * @param overrides - 上書きしたいフィールド（省略可能）
 * @returns テスト用のUserオブジェクト
 *
 * @example
 * // デフォルト値でユーザーを作成
 * const user = createTestUser();
 *
 * @example
 * // オンライン状態のユーザーを作成
 * const onlineUser = createTestUser({
 *   isOnline: true,
 *   socketId: 'test-socket-123'
 * });
 *
 * @example
 * // 特定の名前とIDでユーザーを作成
 * const customUser = createTestUser({
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   name: '山田太郎'
 * });
 */
function createTestUser(overrides?: Partial<User>): User;
```

**Default Values**:
- `id`: ランダムなUUID v4
- `name`: "Test User"
- `socketId`: null
- `isOnline`: false
- `lastActiveAt`: 現在時刻
- `createdAt`: 現在時刻
- `updatedAt`: 現在時刻

### createTestMessage

```typescript
/**
 * テスト用のMessageオブジェクトを生成します
 * デフォルト値を持ち、オーバーライドで一部のフィールドをカスタマイズ可能
 *
 * @param overrides - 上書きしたいフィールド（省略可能）
 * @returns テスト用のMessageオブジェクト
 *
 * @example
 * // デフォルト値でメッセージを作成
 * const message = createTestMessage();
 *
 * @example
 * // システムメッセージを作成
 * const systemMessage = createTestMessage({
 *   userId: null,
 *   userName: 'システム',
 *   content: '山田太郎さんが参加しました',
 *   type: MessageType.SYSTEM
 * });
 *
 * @example
 * // 特定のユーザーに関連付けたメッセージを作成
 * const user = createTestUser();
 * const userMessage = createTestMessage({
 *   userId: user.id,
 *   userName: user.name,
 *   content: 'こんにちは！'
 * });
 */
function createTestMessage(overrides?: Partial<Message>): Message;
```

**Default Values**:
- `id`: ランダムなUUID v4
- `userId`: ランダムなUUID v4
- `userName`: "Test User"
- `content`: "Test message"
- `type`: MessageType.USER
- `createdAt`: 現在時刻

### createTestUserWithMessages

```typescript
/**
 * ユーザーと関連するメッセージのセットを生成します
 * 統合テストで複雑なデータ構造をセットアップする際に便利
 *
 * @param userOverrides - ユーザーの上書きフィールド（省略可能）
 * @param messageCount - 生成するメッセージの数（デフォルト: 3）
 * @param messageOverrides - すべてのメッセージに共通の上書きフィールド（省略可能）
 * @returns ユーザーとメッセージの配列を含むオブジェクト
 *
 * @example
 * // ユーザーと3件のメッセージを作成
 * const { user, messages } = createTestUserWithMessages();
 *
 * @example
 * // オンラインユーザーと5件のメッセージを作成
 * const { user, messages } = createTestUserWithMessages(
 *   { isOnline: true, socketId: 'socket-123' },
 *   5
 * );
 */
function createTestUserWithMessages(
  userOverrides?: Partial<User>,
  messageCount?: number,
  messageOverrides?: Partial<Message>
): { user: User; messages: Message[] };
```

## Test Validation Functions

### isValidUUID

```typescript
/**
 * 文字列が有効なUUID v4形式かを検証します
 *
 * @param value - 検証する文字列
 * @returns UUID v4形式の場合true
 *
 * @example
 * isValidUUID('550e8400-e29b-41d4-a716-446655440000'); // true
 * isValidUUID('invalid-uuid'); // false
 */
function isValidUUID(value: string): boolean;
```

### isValidUserName

```typescript
/**
 * ユーザー名が有効かを検証します
 * ルール: 空文字禁止、50文字以下
 *
 * @param name - 検証するユーザー名
 * @returns 有効な場合true
 *
 * @example
 * isValidUserName('山田太郎'); // true
 * isValidUserName(''); // false
 * isValidUserName('a'.repeat(51)); // false
 */
function isValidUserName(name: string): boolean;
```

### isValidMessageContent

```typescript
/**
 * メッセージ内容が有効かを検証します
 * ルール: 空文字禁止、1000文字以下
 *
 * @param content - 検証するメッセージ内容
 * @returns 有効な場合true
 *
 * @example
 * isValidMessageContent('こんにちは'); // true
 * isValidMessageContent(''); // false
 * isValidMessageContent('a'.repeat(1001)); // false
 */
function isValidMessageContent(content: string): boolean;
```

## Test Database Setup Functions

### setupTestDatabase

```typescript
/**
 * テスト用データベースをセットアップします
 * - Prismaクライアントを初期化
 * - マイグレーションを実行
 *
 * @returns 初期化されたPrismaクライアント
 *
 * @example
 * const prisma = await setupTestDatabase();
 */
async function setupTestDatabase(): Promise<PrismaClient>;
```

### teardownTestDatabase

```typescript
/**
 * テスト用データベースをクリーンアップします
 * - データベース接続を切断
 *
 * @param prisma - Prismaクライアントインスタンス
 *
 * @example
 * await teardownTestDatabase(prisma);
 */
async function teardownTestDatabase(prisma: PrismaClient): Promise<void>;
```

### clearTestData

```typescript
/**
 * テストデータをクリアします（すべてのテーブル）
 * トランザクションロールバックが使えない場合の代替手段
 *
 * @param prisma - Prismaクライアントインスタンス
 *
 * @example
 * await clearTestData(prisma);
 */
async function clearTestData(prisma: PrismaClient): Promise<void>;
```

## Test WebSocket Setup Functions

### setupTestWebSocketServer

```typescript
/**
 * テスト用WebSocketサーバーをセットアップします
 * - Expressサーバーを起動
 * - WebSocketサーバーをアタッチ
 *
 * @param port - リスニングポート（デフォルト: ランダムポート）
 * @returns サーバーインスタンスとポート番号
 *
 * @example
 * const { server, port } = await setupTestWebSocketServer();
 */
async function setupTestWebSocketServer(
  port?: number
): Promise<{ server: Server; port: number }>;
```

### teardownTestWebSocketServer

```typescript
/**
 * テスト用WebSocketサーバーをシャットダウンします
 * - すべてのクライアント接続をクローズ
 * - サーバーを停止
 *
 * @param server - サーバーインスタンス
 *
 * @example
 * await teardownTestWebSocketServer(server);
 */
async function teardownTestWebSocketServer(server: Server): Promise<void>;
```

### createTestWebSocketClient

```typescript
/**
 * テスト用WebSocketクライアントを作成します
 *
 * @param port - 接続先ポート
 * @param userName - 接続時に送信するユーザー名
 * @returns WebSocketクライアントインスタンス
 *
 * @example
 * const client = await createTestWebSocketClient(port, '山田太郎');
 */
async function createTestWebSocketClient(
  port: number,
  userName: string
): Promise<WebSocket>;
```

### waitForWebSocketMessage

```typescript
/**
 * WebSocketメッセージの受信を待機します（タイムアウト付き）
 *
 * @param client - WebSocketクライアント
 * @param timeout - タイムアウト時間（ミリ秒、デフォルト: 5000）
 * @returns 受信したメッセージデータ
 *
 * @example
 * const message = await waitForWebSocketMessage(client);
 * expect(message).toHaveProperty('content', 'こんにちは');
 */
async function waitForWebSocketMessage(
  client: WebSocket,
  timeout?: number
): Promise<any>;
```

## Test Assertion Helpers

### expectUserToMatchSchema

```typescript
/**
 * Userオブジェクトがスキーマに適合しているかを検証します
 * すべてのフィールドの存在と型をチェック
 *
 * @param user - 検証するUserオブジェクト
 *
 * @example
 * expectUserToMatchSchema(user);
 */
function expectUserToMatchSchema(user: any): void;
```

### expectMessageToMatchSchema

```typescript
/**
 * Messageオブジェクトがスキーマに適合しているかを検証します
 * すべてのフィールドの存在と型をチェック
 *
 * @param message - 検証するMessageオブジェクト
 *
 * @example
 * expectMessageToMatchSchema(message);
 */
function expectMessageToMatchSchema(message: any): void;
```

## Usage Examples

### Unit Test Example

```typescript
import { createTestUser, createTestMessage, isValidUserName } from '../helpers/factories';

describe('User Model', () => {
  it('should create a user with valid data', () => {
    const user = createTestUser({
      name: '山田太郎',
      isOnline: true
    });

    expect(user.name).toBe('山田太郎');
    expect(user.isOnline).toBe(true);
    expect(isValidUserName(user.name)).toBe(true);
  });

  it('should reject empty user name', () => {
    expect(isValidUserName('')).toBe(false);
  });
});
```

### Integration Test Example (Database)

```typescript
import { setupTestDatabase, teardownTestDatabase, createTestUser } from '../setup/db-setup';

describe('User CRUD Operations', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase(prisma);
  });

  it('should persist user to database', async () => {
    const userData = createTestUser({ name: '山田太郎' });

    const user = await prisma.user.create({
      data: userData
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe('山田太郎');
  });
});
```

### Integration Test Example (WebSocket)

```typescript
import {
  setupTestWebSocketServer,
  teardownTestWebSocketServer,
  createTestWebSocketClient,
  waitForWebSocketMessage
} from '../setup/ws-setup';

describe('WebSocket Connection', () => {
  let server: Server;
  let port: number;

  beforeAll(async () => {
    ({ server, port } = await setupTestWebSocketServer());
  });

  afterAll(async () => {
    await teardownTestWebSocketServer(server);
  });

  it('should establish connection with user name', async () => {
    const client = await createTestWebSocketClient(port, '山田太郎');
    const message = await waitForWebSocketMessage(client);

    expect(message).toHaveProperty('type', 'welcome');
    expect(message).toHaveProperty('userName', '山田太郎');
  });
});
```

## Type Safety Notes

- すべての関数とインターフェースはTypeScriptの厳格モード（strict: true）で動作します
- `any`型の使用は禁止、必要に応じて`unknown`と型ガードを使用します
- ファクトリ関数のoverridesパラメータは`Partial<T>`型で型安全性を保証します
- Prisma生成型との互換性を維持します

## File Organization

```text
backend/tests/
├── unit/
│   └── helpers/
│       ├── factories.ts        # createTestUser, createTestMessage, etc.
│       ├── validators.ts       # isValidUserName, isValidMessageContent, etc.
│       └── types.ts            # User, Message, MessageType型定義
└── integration/
    └── setup/
        ├── db-setup.ts         # setupTestDatabase, teardownTestDatabase, etc.
        └── ws-setup.ts         # setupTestWebSocketServer, createTestWebSocketClient, etc.
```
