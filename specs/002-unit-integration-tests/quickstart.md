# Quickstart: 単体テスト・結合テスト

**Feature**: 002-unit-integration-tests
**Date**: 2025-11-11
**Branch**: `002-unit-integration-tests`

## Overview

このガイドは、UserとMessageデータモデルの単体テスト・結合テストを実行するための手順を説明します。開発者がローカル環境でテストを実行し、CI/CD環境でも同様に動作することを確認できます。

## Prerequisites

### Required Tools

- Node.js 20 LTS
- pnpm（パッケージマネージャー）
- Docker & Docker Compose（データベーステスト用）
- PostgreSQL（Dockerで提供）

### Environment Setup

1. **リポジトリのクローン**（既にクローン済みの場合はスキップ）

```bash
cd /Users/tsuzuki/works/simple-chat
```

2. **ブランチの切り替え**

```bash
git checkout 002-unit-integration-tests
```

3. **依存関係のインストール**

```bash
cd backend
pnpm install
```

4. **環境変数の設定**

テスト用の環境変数を`.env.test`ファイルに設定します。

```bash
# backend/.env.test
DATABASE_URL="postgresql://testuser:testpass@localhost:5433/simple_chat_test"
NODE_ENV=test
```

**注意**: テスト用データベースは本番用と異なるポート（5433）を使用します。

5. **テスト用データベースの起動**

Docker Composeでテスト用PostgreSQLを起動します。

```bash
# プロジェクトルートから
docker compose up -d db-test
```

または、テスト用の設定がない場合は、docker-compose.ymlに以下を追加してください。

```yaml
# docker-compose.yml
services:
  db-test:
    image: postgres:16
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: simple_chat_test
    ports:
      - "5433:5432"
    volumes:
      - test_postgres_data:/var/lib/postgresql/data

volumes:
  test_postgres_data:
```

6. **Prismaマイグレーションの実行**

テスト用データベースにスキーマを適用します。

```bash
cd backend
DATABASE_URL="postgresql://testuser:testpass@localhost:5433/simple_chat_test" pnpm prisma migrate deploy
```

## Running Tests

### Run All Tests

すべてのテスト（単体テスト + 統合テスト）を実行します。

```bash
cd backend
pnpm test
```

**Expected Output**:

```
PASS tests/unit/models/user.test.ts
PASS tests/unit/models/message.test.ts
PASS tests/integration/database/user-crud.test.ts
PASS tests/integration/database/message-crud.test.ts
PASS tests/integration/websocket/connection.test.ts
PASS tests/integration/websocket/broadcast.test.ts

Test Suites: 6 passed, 6 total
Tests:       50 passed, 50 total
Snapshots:   0 total
Time:        12.345 s
Ran all test suites.

Coverage summary:
  Lines:      96.5%
  Statements: 96.5%
  Functions:  95.8%
  Branches:   95.2%
```

### Run Unit Tests Only

単体テストのみを実行します（高速、データベース不要）。

```bash
cd backend
pnpm test tests/unit
```

**Expected Time**: < 1秒

### Run Integration Tests Only

統合テストのみを実行します（データベース + WebSocket）。

```bash
cd backend
pnpm test:integration
```

または

```bash
cd backend
pnpm test tests/integration
```

**Expected Time**: < 15秒

### Run with Coverage

カバレッジレポート付きでテストを実行します。

```bash
cd backend
pnpm test --coverage
```

カバレッジレポートは`backend/coverage/`ディレクトリに生成されます。

```bash
# HTMLレポートを開く（macOS）
open backend/coverage/lcov-report/index.html
```

### Watch Mode

ファイル変更を監視して自動的にテストを再実行します（開発中に便利）。

```bash
cd backend
pnpm test:watch
```

### Run Specific Test File

特定のテストファイルのみを実行します。

```bash
cd backend
pnpm test tests/unit/models/user.test.ts
```

### Run Tests Matching Pattern

テスト名にマッチするテストのみを実行します。

```bash
cd backend
pnpm test -t "should create user with valid data"
```

## Test Structure

```text
backend/tests/
├── unit/                       # 単体テスト（P1）
│   ├── models/
│   │   ├── user.test.ts       # Userモデルのテスト
│   │   └── message.test.ts    # Messageモデルのテスト
│   └── helpers/
│       ├── factories.ts       # テストデータ生成
│       ├── validators.ts      # バリデーション関数
│       └── types.ts           # 型定義
├── integration/                # 統合テスト（P2, P3）
│   ├── database/
│   │   ├── user-crud.test.ts  # User CRUD操作
│   │   └── message-crud.test.ts # Message CRUD操作
│   ├── websocket/
│   │   ├── connection.test.ts # WebSocket接続
│   │   └── broadcast.test.ts  # メッセージブロードキャスト
│   └── setup/
│       ├── db-setup.ts        # データベースセットアップ
│       └── ws-setup.ts        # WebSocketセットアップ
└── config/
    ├── jest.config.js         # Jest設定
    └── test-env.ts            # テスト環境設定
```

## Common Tasks

### Add New Test

新しいテストを追加する手順:

1. **テストファイルを作成**

```bash
# 単体テストの場合
touch backend/tests/unit/models/new-model.test.ts

# 統合テストの場合
touch backend/tests/integration/database/new-feature.test.ts
```

2. **テストを記述**

```typescript
// backend/tests/unit/models/new-model.test.ts
import { createTestUser } from '../../helpers/factories';

describe('New Model', () => {
  it('should do something', () => {
    const user = createTestUser();
    expect(user).toBeDefined();
  });
});
```

3. **テストを実行**

```bash
cd backend
pnpm test tests/unit/models/new-model.test.ts
```

### Update Test Data Factory

テストデータのファクトリ関数を更新する手順:

1. **ファクトリ関数を編集**

```bash
# エディタで開く
code backend/tests/unit/helpers/factories.ts
```

2. **変更を保存**

3. **テストを再実行して確認**

```bash
cd backend
pnpm test
```

### Debug Failing Test

テストが失敗した場合のデバッグ手順:

1. **詳細なエラーメッセージを確認**

```bash
cd backend
pnpm test --verbose
```

2. **特定のテストのみを実行**

```bash
cd backend
pnpm test -t "failing test name"
```

3. **console.logでデバッグ**

```typescript
it('should do something', () => {
  const user = createTestUser();
  console.log('User:', user); // デバッグ出力
  expect(user.name).toBe('Test User');
});
```

4. **Node.jsデバッガーを使用**

```bash
cd backend
node --inspect-brk node_modules/.bin/jest --runInBand
```

そして、Chrome DevToolsで`chrome://inspect`を開く。

## Troubleshooting

### Issue: Database Connection Error

**症状**:

```
Error: Can't reach database server at `localhost:5433`
```

**解決策**:

1. データベースが起動しているか確認

```bash
docker ps | grep postgres
```

2. データベースを起動

```bash
docker compose up -d db-test
```

3. 環境変数が正しいか確認

```bash
cat backend/.env.test
```

### Issue: Port Already in Use

**症状**:

```
Error: listen EADDRINUSE: address already in use :::5433
```

**解決策**:

1. 既存のプロセスを確認

```bash
lsof -i :5433
```

2. プロセスを停止

```bash
kill -9 <PID>
```

または、Dockerコンテナを停止

```bash
docker compose down
```

### Issue: Test Timeout

**症状**:

```
Error: Timeout - Async callback was not invoked within the 5000ms timeout
```

**解決策**:

1. タイムアウト時間を延長

```typescript
it('should do something', async () => {
  // テストコード
}, 10000); // 10秒に延長
```

2. Jest設定でグローバルタイムアウトを変更

```javascript
// jest.config.js
module.exports = {
  testTimeout: 10000, // 10秒
};
```

### Issue: Coverage Below Threshold

**症状**:

```
Error: Coverage for lines (90%) does not meet global threshold (95%)
```

**解決策**:

1. カバーされていない行を確認

```bash
cd backend
pnpm test --coverage
open coverage/lcov-report/index.html
```

2. 不足しているテストを追加

3. または、閾値を調整（一時的な措置）

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      lines: 90, // 95から90に変更
    }
  }
};
```

### Issue: Flaky WebSocket Tests

**症状**: WebSocketテストがランダムに失敗する

**解決策**:

1. 接続待機を追加

```typescript
await new Promise(resolve => setTimeout(resolve, 100));
```

2. イベントベースの待機を使用

```typescript
await new Promise((resolve) => {
  client.on('open', resolve);
});
```

3. リトライロジックを追加

```typescript
const waitForMessage = async (client: WebSocket, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await waitForWebSocketMessage(client);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: simple_chat_test
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: |
          cd backend
          pnpm install

      - name: Run migrations
        run: |
          cd backend
          DATABASE_URL="postgresql://testuser:testpass@localhost:5433/simple_chat_test" pnpm prisma migrate deploy

      - name: Run tests with coverage
        run: |
          cd backend
          pnpm test --coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
```

## Performance Benchmarks

### Target Performance

- **単体テスト**: < 1秒
- **データベース統合テスト**: < 5秒
- **WebSocket統合テスト**: < 10秒
- **全体**: < 30秒（ローカル環境）
- **全体**: < 60秒（CI環境）

### Actual Performance (Example)

```
Test Suites: 6 passed, 6 total
Tests:       50 passed, 50 total
Time:        12.345 s

Unit Tests:           0.8s
Database Tests:       4.2s
WebSocket Tests:      7.3s
```

## Next Steps

テストが正常に実行できたら、次は実装フェーズに進みます。

1. **実装計画の確認**: `specs/002-unit-integration-tests/plan.md`
2. **タスクリストの生成**: `/speckit.tasks` コマンドを実行
3. **実装の開始**: `/speckit.implement` コマンドで自動実装

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [WebSocket Testing Guide](https://github.com/websockets/ws#usage-examples)
- [Feature Specification](./spec.md)
- [Research Document](./research.md)
- [Data Model](./data-model.md)
- [Test Interfaces](./contracts/test-interfaces.md)
