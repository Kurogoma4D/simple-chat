# Quickstart: Clear Messages on Empty Room

## Overview

この機能は、チャットルームから全ユーザーが退出したときに、メッセージ履歴を自動的にクリアします。

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (開発時のみ)
- PostgreSQL（Docker経由で提供）

## Development Setup

### 1. Start Development Environment

```bash
# Docker環境を起動
docker compose up

# または、テスト用DBを含めて起動
docker compose --profile test up
```

### 2. Run Tests

```bash
# ユニットテスト
cd backend
npm test

# 統合テスト
npm run test:integration

# 特定のテストファイルを実行
npm test -- MessageService.test.ts
```

### 3. Manual Testing

#### Scenario 1: 全員退出時のメッセージクリア

```bash
# 1. ブラウザで http://localhost:3000 を開く
# 2. 複数のタブで異なるユーザー名で入室
# 3. 各ユーザーでメッセージを送信
# 4. 全てのタブを閉じる（全員退出）
# 5. 新しいタブで入室
# 6. メッセージ履歴が空であることを確認
```

#### Scenario 2: 一部ユーザー退出時は削除されない

```bash
# 1. 複数のタブで入室
# 2. メッセージを送信
# 3. 一部のタブのみを閉じる
# 4. 残っているタブでメッセージ履歴が保持されていることを確認
```

## Implementation Flow

### 1. MessageService拡張

```typescript
// backend/src/services/MessageService.ts

export class MessageService {
  // 既存メソッド...

  /**
   * 全メッセージを削除
   */
  async clearAllMessages(): Promise<number> {
    const result = await prisma.message.deleteMany({});
    return result.count;
  }
}
```

### 2. disconnectHandler更新

```typescript
// backend/src/websocket/handlers/disconnectHandler.ts

export async function handleDisconnect(socketId: string): Promise<void> {
  // 既存の処理...

  // ルームが空の場合、メッセージをクリア（非同期）
  void clearMessagesIfRoomEmpty();
}

async function clearMessagesIfRoomEmpty(): Promise<void> {
  try {
    const userService = new UserService();
    const activeUsers = await userService.getActiveUsers();

    if (activeUsers.length === 0) {
      const messageService = new MessageService();
      const deletedCount = await messageService.clearAllMessages();
      console.log(`[MessageClear] Cleared ${deletedCount} messages`);
    }
  } catch (error) {
    console.error('[MessageClear] Failed to clear messages:', error);
  }
}
```

### 3. テスト実装

#### ユニットテスト

```typescript
// backend/tests/unit/services/MessageService.test.ts

describe('MessageService.clearAllMessages', () => {
  it('should delete all messages', async () => {
    // テストコード...
  });
});
```

#### 統合テスト

```typescript
// backend/tests/integration/websocket/message-clear.test.ts

describe('Message clear on empty room', () => {
  it('should clear messages when all users disconnect', async () => {
    // テストコード...
  });
});
```

## Debugging

### ログ確認

```bash
# Dockerログを確認
docker compose logs -f backend

# メッセージクリアログを検索
docker compose logs backend | grep MessageClear
```

### データベース確認

```bash
# Prisma Studioを起動
cd backend
npm run prisma:studio

# または、直接DBに接続
docker compose exec db psql -U postgres -d chatdb
```

```sql
-- メッセージ数を確認
SELECT COUNT(*) FROM "Message";

-- オンラインユーザー数を確認
SELECT COUNT(*) FROM "User" WHERE "isOnline" = true;
```

## Troubleshooting

### メッセージが削除されない

**Symptom**: 全員退出後もメッセージが残っている

**Check**:
1. ログを確認: `docker compose logs backend | grep MessageClear`
2. オンラインユーザー数を確認: `SELECT COUNT(*) FROM "User" WHERE "isOnline" = true;`
3. エラーログを確認

**Solution**:
- ユーザーのオフライン更新が正しく動作しているか確認
- メッセージ削除処理のエラーログを確認

### パフォーマンス問題

**Symptom**: メッセージ削除に時間がかかる

**Check**:
1. メッセージ件数: `SELECT COUNT(*) FROM "Message";`
2. 削除処理時間をログで確認

**Solution**:
- 10,000件以上のメッセージがある場合でも10秒以内に完了すべき
- それ以上かかる場合は、PostgreSQLのパフォーマンス設定を確認

## Performance Expectations

- **メッセージ削除**: 5秒以内（通常ケース）
- **10,000件の削除**: 10秒以内
- **ユーザー退出処理**: メッセージ削除の影響を受けず、常に5秒以内

## Next Steps

1. ユニットテストを実装: `MessageService.clearAllMessages()`
2. 統合テストを実装: 全員退出シナリオ
3. disconnectHandlerにメッセージクリア処理を追加
4. 手動テストで動作確認
5. パフォーマンステスト（10,000件のメッセージ削除）

## References

- [Feature Spec](./spec.md)
- [Implementation Plan](./plan.md)
- [Research](./research.md)
- [Data Model](./data-model.md)
