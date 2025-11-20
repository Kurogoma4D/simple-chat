# Research: Clear Messages on Empty Room

## Overview

全ユーザー退出時のメッセージ削除機能の実装方針を調査します。

## Research Questions & Findings

### Q1: 非同期処理パターン

**Decision**: Promise-based非同期処理（fire-and-forget）

**Rationale**:
- Node.jsのイベントループを活用し、ユーザー退出処理をブロックしない
- エラーハンドリングとログ記録を実装可能
- 既存のTypeScript/Node.js環境に追加ライブラリ不要

**Alternatives considered**:
- **Synchronous deletion**: ユーザー退出処理がブロックされるため却下
- **Message queue (Bull, BullMQ)**: 単一グローバルルームの単純な削除処理には過剰な複雑性
- **Worker threads**: Node.jsのworker_threadsは重い処理向けで、単純なDB削除には不要

**Implementation approach**:
```typescript
// disconnectHandler内でfire-and-forget
void clearAllMessages(); // Promiseを待たずに実行継続
```

### Q2: 競合状態の防止

**Decision**: オンラインユーザー数の確認をトランザクション的に実行

**Rationale**:
- 複数ユーザーのほぼ同時退出時に、メッセージ削除が複数回実行されないようにする
- Prismaの`findMany().length === 0`チェックは原子的ではないが、削除処理自体は冪等
- 最悪ケースでも複数回削除が試行されるだけで、データ不整合は発生しない

**Alternatives considered**:
- **Database lock**: PostgreSQLのFOR UPDATE - 過剰な複雑性
- **Redis lock**: 外部依存の追加 - 現時点では不要
- **Application-level flag**: メモリ上のフラグ - 複数プロセス時に機能しない

**Implementation approach**:
```typescript
// 1. ユーザーをオフラインに更新
// 2. オンラインユーザー数を確認
const onlineUsers = await prisma.user.count({ where: { isOnline: true } });
// 3. ゼロの場合のみメッセージ削除
if (onlineUsers === 0) {
  await prisma.message.deleteMany({});
}
```

### Q3: 削除処理中の新規入室

**Decision**: 削除処理中の入室は許可し、削除処理は継続

**Rationale**:
- メッセージ削除はfire-and-forgetで実行されるため、入室処理と並行実行される
- 削除完了前に入室した場合、入室直後にメッセージが消える可能性がある
- ユーザー体験上、入室直後に古いメッセージが一瞬表示されるのは許容範囲
- 削除処理の中断による複雑性を避ける

**Alternatives considered**:
- **Abort deletion on new join**: 削除処理の中断ロジックが複雑化
- **Lock room during deletion**: 入室を一時的にブロック - ユーザー体験の低下

**Implementation approach**:
削除処理の中断は実装せず、シンプルに削除を実行します。入室直後にメッセージが消えても、ユーザーは新しいメッセージから会話を開始できます。

### Q4: パフォーマンス最適化

**Decision**: 単純な`deleteMany({})`を使用、最適化は不要

**Rationale**:
- PostgreSQLの`DELETE FROM messages`は十分高速
- 10,000件のメッセージ削除は通常1秒未満で完了
- インデックスの削除・再作成は不要（全削除のため）
- バッチ削除は複雑性を増すだけで、パフォーマンス向上は限定的

**Alternatives considered**:
- **Batch deletion**: 1000件ずつ削除 - 複雑性が増すだけで効果は限定的
- **Truncate table**: PRIVILEGEの問題とAUTO_INCREMENTのリセット懸念
- **Background job**: 単純な削除には過剰

**Implementation approach**:
```typescript
await prisma.message.deleteMany({});
```

### Q5: エラーハンドリング

**Decision**: エラーログ記録 + ユーザー退出処理は継続

**Rationale**:
- メッセージ削除失敗はユーザー体験に直接影響しない
- ユーザー退出処理（オフライン状態への更新）が最優先
- ログに記録することで、後から問題を調査可能

**Alternatives considered**:
- **Retry logic**: 単純な削除処理に複雑なリトライは不要
- **Alert/notification**: 現時点では監視システムがないため不要
- **Rollback user disconnect**: ユーザー体験の低下

**Implementation approach**:
```typescript
try {
  await clearAllMessages();
} catch (error) {
  console.error('[MessageClear] Failed to clear messages:', error);
  // Continue - user disconnect should not fail
}
```

## Best Practices

### Prisma削除操作
- `deleteMany({})`は全レコード削除の標準的な方法
- トランザクションは不要（単一操作のため）
- カスケード削除は外部キー制約で自動処理

### Node.js非同期処理
- `void promise`パターンでfire-and-forget
- `try-catch`で例外を捕捉しログ記録
- `async/await`の一貫した使用

### エラーハンドリング
- ビジネスクリティカルな処理（ユーザー退出）を優先
- 副次的な処理（メッセージ削除）のエラーは記録のみ
- ユーザー影響を最小化

## Testing Strategy

### Unit Tests
- `MessageService.clearAllMessages()`メソッドのテスト
- モックPrismaクライアントを使用
- 正常系・異常系の両方をカバー

### Integration Tests
- 実際のデータベースを使用
- 全員退出シナリオのテスト
- メッセージ削除の確認
- エラー時の動作確認

### Performance Tests
- 10,000件のメッセージ削除時間を計測
- 目標: 10秒以内に完了

## Summary

非同期処理とシンプルなPrisma削除操作を組み合わせることで、既存の退出処理フローに最小限の変更で機能を統合します。競合状態やエラーハンドリングは、複雑なロックやリトライを導入せず、シンプルな実装で対応します。
