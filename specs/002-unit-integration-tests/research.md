# Research: 単体テスト・結合テスト

**Feature**: 002-unit-integration-tests
**Date**: 2025-11-11
**Status**: Complete

## Research Questions

### 1. テストフレームワークとツールの選定

**Question**: TypeScript + Node.js環境で最適なテストフレームワークは何か？

**Decision**: Jest 29.7+ with ts-jest 29.1+

**Rationale**:
- 既にbackend/package.jsonにJest 29.7とts-jest 29.1が設定済み
- TypeScriptとの統合が優れている（型チェック、カバレッジ計測）
- 豊富なマッチャーとモック機能
- 並行実行のサポート
- コミュニティサポートが充実
- Node.js LTS環境で安定動作

**Alternatives considered**:
- Vitest: 高速だが、既存のJest設定を移行するコストが不要
- Mocha + Chai: 柔軟性は高いが、設定が複雑でTypeScriptサポートが弱い
- AVA: 並行実行に特化しているが、エコシステムがJestより小さい

### 2. データベーステスト戦略

**Question**: Prismaを使用したデータベーステストのベストプラクティスは？

**Decision**: テスト用PostgreSQLインスタンス + Prismaトランザクション分離

**Rationale**:
- 実際のデータベースを使用することで、SQLクエリの正確性を検証
- Prismaのマイグレーション機能を活用してスキーマを同期
- 各テストをトランザクション内で実行し、ロールバックでクリーンアップ
- Docker Composeでテスト用データベースを簡単に起動可能
- CI/CD環境でも同じ構成を再現可能

**Alternatives considered**:
- インメモリSQLite: 高速だが、PostgreSQL固有の機能（UUID型、JSONBなど）をテストできない
- モックPrismaクライアント: テストは高速だが、実際のSQL動作を検証できない
- 共有データベース: セットアップが簡単だが、テストの分離が困難

**Implementation approach**:
- `beforeAll`: データベース接続、マイグレーション実行
- `beforeEach`: トランザクション開始
- `afterEach`: トランザクションロールバック
- `afterAll`: データベース切断

### 3. WebSocket統合テストのアプローチ

**Question**: WebSocketのリアルタイム通信をどのようにテストするか？

**Decision**: wsパッケージのテストクライアント + テスト用サーバーインスタンス

**Rationale**:
- 実際のWebSocket通信をエンドツーエンドでテスト
- 複数クライアントのシミュレーションが容易
- メッセージのブロードキャスト、接続・切断を包括的にテスト
- wsパッケージは既にプロダクションコードで使用中

**Alternatives considered**:
- socket.io-client: 機能は豊富だが、wsより重く、プロジェクトで未使用
- モックWebSocket: 高速だが、実際の接続処理をテストできない
- SuperTest + WebSocket: HTTP APIテストには最適だが、WebSocketの双方向通信に不向き

**Implementation approach**:
- テスト用にExpressサーバーとWebSocketサーバーを起動
- 複数のWebSocketクライアントを作成してシミュレーション
- メッセージ送受信のタイミングを`setTimeout`またはPromiseで制御
- 各テスト後にすべてのクライアント接続をクローズ

### 4. テストデータ管理

**Question**: テストデータをどのように生成・管理するか？

**Decision**: ファクトリ関数パターン + 型定義の共有

**Rationale**:
- ファクトリ関数でデフォルト値を持つテストデータを簡単に生成
- 型安全性を維持しながら、テストケースごとにカスタマイズ可能
- DRY原則に従い、重複コードを削減
- データモデルの変更に強い（ファクトリ関数のみ更新）

**Implementation approach**:
```typescript
// tests/unit/helpers/factories.ts
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
    type: 'user',
    createdAt: new Date(),
    ...overrides,
  };
}
```

**Alternatives considered**:
- 固定のJSON fixtures: 柔軟性が低く、メンテナンスが困難
- ランダムデータジェネレーター（faker.js）: 過剰な複雑性、決定論的テストが困難
- 各テストで手動作成: DRY違反、メンテナンスコストが高い

### 5. テストカバレッジ測定

**Question**: 95%のカバレッジ目標をどのように達成・測定するか？

**Decision**: Jestの組み込みカバレッジ機能（istanbul/c8）

**Rationale**:
- Jestに統合されており、追加設定不要
- ライン、ブランチ、関数、ステートメントカバレッジを測定
- HTMLレポート生成で視覚的に確認可能
- CI/CDでカバレッジ閾値を強制可能

**Implementation approach**:
```json
// jest.config.js
{
  "collectCoverage": true,
  "coverageDirectory": "coverage",
  "coverageThreshold": {
    "global": {
      "branches": 95,
      "functions": 95,
      "lines": 95,
      "statements": 95
    }
  },
  "collectCoverageFrom": [
    "src/models/**/*.ts",
    "!src/**/*.d.ts"
  ]
}
```

**Alternatives considered**:
- nyc (istanbul): Jestに統合済みなので追加パッケージ不要
- c8: V8のネイティブカバレッジだが、Jestとの統合が複雑

### 6. 並行テスト実行とデータ分離

**Question**: 並行実行時にテストデータの競合をどのように防ぐか？

**Decision**: ユニークなテストデータベーススキーマ + トランザクション分離

**Rationale**:
- Jestのテストスイート（ファイル）ごとに独立したトランザクション
- UUIDでデータをユニークに識別
- beforeEach/afterEachで確実にクリーンアップ
- 並行実行でもテストが干渉しない

**Implementation approach**:
- 各テストファイルで独立したPrismaクライアントインスタンスを使用
- トランザクション内でテストを実行
- `jest --maxWorkers=4`で並行度を制御

**Alternatives considered**:
- シリアル実行（--runInBand）: 安全だが、遅い
- テストごとに異なるデータベース: セットアップが複雑、リソース消費が大きい
- グローバルなデータクリーンアップ: タイミング問題でフレーキーなテストになりやすい

## Best Practices Summary

### Jest設定
- TypeScript設定: ts-jestプリセットを使用
- タイムアウト: WebSocketテストは10秒、他は5秒
- 並行実行: 4ワーカー（デフォルト: CPUコア数-1）
- モジュール解決: TypeScriptのpathエイリアスを反映

### テスト構造
- Arrange-Act-Assert（AAA）パターンを一貫して使用
- describeブロックで論理的にグループ化
- itブロックは1つの動作のみをテスト
- テスト名は「should + 動詞」形式で明確に

### モックとスタブ
- 外部サービスは基本的にモック化
- Prismaクライアントは実際のデータベースを使用（統合テストのため）
- 時間依存のテストはjest.useFakeTimersを使用

### エラーハンドリング
- expect().rejects.toThrow()でエラーを検証
- try-catchは避け、Jestのマッチャーを使用
- バリデーションエラーは明示的にテスト

## Dependencies Required

### 既存（確認済み）
- jest: ^29.7.0
- @types/jest: ^29.5.8
- ts-jest: ^29.1.1
- @prisma/client: ^6.0.0
- prisma: ^6.0.0
- ws: ^8.14.2
- @types/ws: ^8.5.8
- uuid: ^9.0.1
- @types/uuid: ^9.0.7

### 追加不要
すべての必要な依存関係は既にbackend/package.jsonに存在します。

## Performance Considerations

- **単体テスト**: インメモリ操作のみ、並行実行可能、1秒以内
- **データベーステスト**: トランザクション分離、クリーンアップが高速、5秒以内
- **WebSocketテスト**: 実際の接続だが、ローカル環境なので高速、10秒以内
- **全体**: 最大30秒以内（CI環境でも同等）

## Risk Mitigation

### リスク1: フレーキーなWebSocketテスト
- **対策**: Promiseベースの待機、明示的なタイムアウト、接続状態の確認

### リスク2: データベース接続リーク
- **対策**: afterAll/afterEachで確実に切断、リソース監視

### リスク3: 並行実行での競合
- **対策**: トランザクション分離、UUID使用、独立したテストデータ

## Next Steps

Phase 1で以下を実装します。
- data-model.md: User/Messageモデルの詳細定義
- contracts/: テスト対象のAPI仕様（必要に応じて）
- quickstart.md: テスト実行の手順書
