# Tasks: 単体テスト・結合テスト

**Input**: Design documents from `/specs/002-unit-integration-tests/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/test-interfaces.md

**Tests**: このフィーチャーはテストの実装そのものです。すべてのタスクがテストコードの作成に関連します。

**Organization**: タスクはユーザーストーリー（P1: 単体テスト、P2: データベース統合テスト、P3: WebSocket統合テスト）ごとにグループ化され、各ストーリーを独立して実装・検証できるようになっています。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（異なるファイル、依存関係なし）
- **[Story]**: ユーザーストーリーのラベル（US1, US2, US3）
- 説明には正確なファイルパスを含む

## Path Conventions

このプロジェクトはモノレポ（web app）構造です:
- バックエンドテスト: `backend/tests/`
- テストヘルパー: `backend/tests/unit/helpers/`
- 統合テストセットアップ: `backend/tests/integration/setup/`
- 設定ファイル: `backend/tests/config/`

---

## Phase 1: Setup（テスト基盤の構築）

**Purpose**: テストプロジェクトの初期化と基本構造の作成

- [x] T001 Create test directory structure per plan.md in backend/tests/
- [x] T002 Configure Jest with TypeScript support in backend/tests/config/jest.config.js
- [x] T003 [P] Create test environment configuration in backend/tests/config/test-env.ts
- [x] T004 [P] Add test scripts to backend/package.json (test, test:watch, test:integration, test:coverage)

---

## Phase 2: Foundational（テスト共通基盤）

**Purpose**: すべてのユーザーストーリーで使用する共通のテストヘルパーとセットアップコード

**⚠️ CRITICAL**: この Phase が完了しないと、いかなるユーザーストーリーも実装できません

- [x] T005 [P] Define User and Message type interfaces in backend/tests/unit/helpers/types.ts
- [x] T006 [P] Implement validation helper functions (isValidUUID, isValidUserName, isValidMessageContent) in backend/tests/unit/helpers/validators.ts
- [x] T007 [P] Create test data factory functions (createTestUser, createTestMessage, createTestUserWithMessages) in backend/tests/unit/helpers/factories.ts
- [x] T008 [P] Implement database setup functions (setupTestDatabase, teardownTestDatabase, clearTestData) in backend/tests/integration/setup/db-setup.ts
- [x] T009 [P] Implement WebSocket setup functions (setupTestWebSocketServer, teardownTestWebSocketServer, createTestWebSocketClient, waitForWebSocketMessage) in backend/tests/integration/setup/ws-setup.ts
- [x] T010 [P] Create assertion helper functions (expectUserToMatchSchema, expectMessageToMatchSchema) in backend/tests/unit/helpers/validators.ts
- [x] T011 Update Docker Compose configuration to include test database (db-test service on port 5433) in docker-compose.yml
- [x] T012 Create .env.test file with test database connection string in backend/.env.test

**Checkpoint**: テスト基盤が準備完了 - ユーザーストーリーの実装を並行して開始可能

---

## Phase 3: User Story 1 - データモデルの単体テスト (Priority: P1) 🎯 MVP

**Goal**: UserとMessageのデータモデルに対する単体テストを実装し、各エンティティの基本的な機能が正しく動作することを確認する

**Independent Test**: `cd backend && pnpm test tests/unit/models` を実行し、すべてのテストがパスすることを確認

### Implementation for User Story 1

- [x] T013 [P] [US1] Implement User model unit tests for valid data creation in backend/tests/unit/models/user.test.ts
- [x] T014 [P] [US1] Implement User model unit tests for validation (empty name, invalid UUID, name length) in backend/tests/unit/models/user.test.ts
- [x] T015 [P] [US1] Implement User model unit tests for online/offline state transitions in backend/tests/unit/models/user.test.ts
- [x] T016 [P] [US1] Implement User model unit tests for socketId lifecycle (set on connect, clear on disconnect) in backend/tests/unit/models/user.test.ts
- [x] T017 [P] [US1] Implement User model unit tests for timestamp fields (createdAt, updatedAt, lastActiveAt) in backend/tests/unit/models/user.test.ts
- [x] T018 [P] [US1] Implement Message model unit tests for valid user message creation in backend/tests/unit/models/message.test.ts
- [x] T019 [P] [US1] Implement Message model unit tests for valid system message creation (userId=null) in backend/tests/unit/models/message.test.ts
- [x] T020 [P] [US1] Implement Message model unit tests for validation (empty content, invalid type, content length) in backend/tests/unit/models/message.test.ts
- [x] T021 [P] [US1] Implement Message model unit tests for userId-userName consistency in backend/tests/unit/models/message.test.ts
- [x] T022 [P] [US1] Implement Message model unit tests for createdAt timestamp in backend/tests/unit/models/message.test.ts
- [x] T023 [US1] Run coverage report and verify 95%+ coverage for data model layer in backend/

**Checkpoint**: User Story 1 完了 - データモデルの単体テストが完全に機能し、独立してテスト可能

---

## Phase 4: User Story 2 - データベース統合テスト (Priority: P2)

**Goal**: データベースとの統合テストを実装し、UserとMessageの永続化、検索、更新が正しく動作することを確認する

**Independent Test**: `cd backend && pnpm test tests/integration/database` を実行し、すべてのテストがパスすることを確認

### Implementation for User Story 2

- [x] T024 [P] [US2] Implement User CRUD test for create operation in backend/tests/integration/database/user-crud.test.ts
- [x] T025 [P] [US2] Implement User CRUD test for read/findMany operations in backend/tests/integration/database/user-crud.test.ts
- [x] T026 [P] [US2] Implement User CRUD test for update operation (isOnline, lastActiveAt) in backend/tests/integration/database/user-crud.test.ts
- [x] T027 [P] [US2] Implement User CRUD test for delete operation in backend/tests/integration/database/user-crud.test.ts
- [x] T028 [P] [US2] Implement User CRUD test for findMany with where clause (isOnline filter) in backend/tests/integration/database/user-crud.test.ts
- [x] T029 [P] [US2] Implement Message CRUD test for create operation with User relation in backend/tests/integration/database/message-crud.test.ts
- [x] T030 [P] [US2] Implement Message CRUD test for create system message (userId=null) in backend/tests/integration/database/message-crud.test.ts
- [x] T031 [P] [US2] Implement Message CRUD test for findMany ordered by createdAt DESC in backend/tests/integration/database/message-crud.test.ts
- [x] T032 [P] [US2] Implement Message CRUD test for User-Message relationship (foreign key) in backend/tests/integration/database/message-crud.test.ts
- [x] T033 [P] [US2] Implement Message CRUD test for delete User cascade (set userId to null) in backend/tests/integration/database/message-crud.test.ts
- [x] T034 [US2] Add transaction rollback tests for data isolation in backend/tests/integration/database/user-crud.test.ts
- [x] T035 [US2] Add concurrent test execution validation in backend/tests/integration/database/message-crud.test.ts

**Checkpoint**: User Story 2 完了 - データベース統合テストが完全に機能し、独立してテスト可能

---

## Phase 5: User Story 3 - WebSocket統合テスト (Priority: P3)

**Goal**: WebSocketを使用したリアルタイム通信の統合テストを実装し、メッセージの送受信、ユーザーの接続・切断が正しく動作することを確認する

**Independent Test**: `cd backend && pnpm test tests/integration/websocket` を実行し、すべてのテストがパスすることを確認

### Implementation for User Story 3

- [x] T036 [P] [US3] Implement WebSocket connection test (client connects with username) in backend/tests/integration/websocket/connection.test.ts
- [x] T037 [P] [US3] Implement WebSocket connection test (User created with socketId and isOnline=true) in backend/tests/integration/websocket/connection.test.ts
- [x] T038 [P] [US3] Implement WebSocket disconnection test (isOnline=false, socketId cleared) in backend/tests/integration/websocket/connection.test.ts
- [x] T039 [P] [US3] Implement WebSocket test for lastActiveAt timestamp updates in backend/tests/integration/websocket/connection.test.ts
- [x] T040 [P] [US3] Implement message broadcast test (one client sends, all receive) in backend/tests/integration/websocket/broadcast.test.ts
- [x] T041 [P] [US3] Implement message broadcast test with multiple clients (3+ clients) in backend/tests/integration/websocket/broadcast.test.ts
- [x] T042 [P] [US3] Implement system message broadcast test (user join/leave) in backend/tests/integration/websocket/broadcast.test.ts
- [x] T043 [US3] Implement WebSocket reconnection test in backend/tests/integration/websocket/connection.test.ts
- [x] T044 [US3] Add WebSocket error handling tests (invalid message, connection drop) in backend/tests/integration/websocket/connection.test.ts

**Checkpoint**: User Story 3 完了 - WebSocket統合テストが完全に機能し、独立してテスト可能

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: すべてのユーザーストーリーに影響する改善と最終調整

- [x] T045 [P] Run full test suite and verify all tests pass in backend/
- [x] T046 [P] Generate coverage report and verify 95%+ coverage in backend/
- [x] T047 [P] Run ESLint and Prettier on test code in backend/tests/
- [x] T048 [P] Validate test execution time meets performance goals (unit < 1s, DB < 5s, WS < 10s, total < 30s)
- [x] T049 [P] Test parallel execution with multiple workers (jest --maxWorkers=4)
- [ ] T050 [P] Validate quickstart.md instructions by following the guide
- [ ] T051 Update README.md with test execution instructions and coverage badge
- [ ] T052 [P] Add CI/CD workflow for automated test execution in .github/workflows/test.yml
- [ ] T053 [P] Verify tests run successfully in Docker container environment
- [ ] T054 Final validation: Run all tests in clean environment and verify success

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setup完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-5)**: すべてFoundational完了に依存
  - ユーザーストーリーは並行実行可能（スタッフ配置次第）
  - または優先順位順に逐次実行（P1 → P2 → P3）
- **Polish (Phase 6)**: 実装したいすべてのユーザーストーリーの完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完了後に開始可能 - 他のストーリーへの依存なし
- **User Story 2 (P2)**: Foundational完了後に開始可能 - US1とは独立してテスト可能
- **User Story 3 (P3)**: Foundational完了後に開始可能 - US1/US2とは独立してテスト可能

### Within Each User Story

- **US1**: すべてのテストタスク（T013-T022）は並行実行可能
- **US2**: すべてのCRUDテスト（T024-T033）は並行実行可能
- **US3**: すべてのWebSocketテスト（T036-T042）は並行実行可能

### Parallel Opportunities

- Phase 1のすべてのタスク（T003-T004）は並行実行可能
- Phase 2のすべてのタスク（T005-T010, T012）は並行実行可能（T011を除く）
- Foundational完了後、すべてのユーザーストーリーを並行開始可能
- 各ストーリー内の[P]マークタスクは並行実行可能
- 異なるユーザーストーリーは異なるチームメンバーが並行作業可能

---

## Parallel Example: User Story 1

```bash
# User Story 1の全テストを同時に起動:
Task: "Implement User model unit tests for valid data creation in backend/tests/unit/models/user.test.ts"
Task: "Implement User model unit tests for validation in backend/tests/unit/models/user.test.ts"
Task: "Implement User model unit tests for online/offline state transitions in backend/tests/unit/models/user.test.ts"
Task: "Implement Message model unit tests for valid user message creation in backend/tests/unit/models/message.test.ts"
Task: "Implement Message model unit tests for valid system message creation in backend/tests/unit/models/message.test.ts"

# これらはすべて異なるテストケースで、並行して実装可能
```

## Parallel Example: User Story 2

```bash
# User Story 2の全テストを同時に起動:
Task: "Implement User CRUD test for create operation in backend/tests/integration/database/user-crud.test.ts"
Task: "Implement User CRUD test for read/findMany operations in backend/tests/integration/database/user-crud.test.ts"
Task: "Implement Message CRUD test for create operation in backend/tests/integration/database/message-crud.test.ts"
Task: "Implement Message CRUD test for findMany ordered by createdAt in backend/tests/integration/database/message-crud.test.ts"

# これらはすべて独立したCRUDテストで、並行して実装可能
```

## Parallel Example: User Story 3

```bash
# User Story 3の全テストを同時に起動:
Task: "Implement WebSocket connection test in backend/tests/integration/websocket/connection.test.ts"
Task: "Implement WebSocket disconnection test in backend/tests/integration/websocket/connection.test.ts"
Task: "Implement message broadcast test in backend/tests/integration/websocket/broadcast.test.ts"
Task: "Implement message broadcast test with multiple clients in backend/tests/integration/websocket/broadcast.test.ts"

# これらはすべて独立したWebSocketテストで、並行して実装可能
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1完了: Setup
2. Phase 2完了: Foundational（クリティカル - すべてのストーリーをブロック）
3. Phase 3完了: User Story 1
4. **ストップして検証**: User Story 1を独立してテスト
5. カバレッジ95%達成を確認

### Incremental Delivery

1. Setup + Foundational完了 → テスト基盤準備完了
2. User Story 1追加 → 独立してテスト → デプロイ/デモ（MVP!）
3. User Story 2追加 → 独立してテスト → デプロイ/デモ
4. User Story 3追加 → 独立してテスト → デプロイ/デモ
5. 各ストーリーが前のストーリーを壊すことなく価値を追加

### Parallel Team Strategy

複数の開発者がいる場合:

1. チーム全体でSetup + Foundationalを完了
2. Foundational完了後:
   - Developer A: User Story 1（単体テスト）
   - Developer B: User Story 2（DB統合テスト）
   - Developer C: User Story 3（WebSocket統合テスト）
3. ストーリーは独立して完了し、統合

---

## Task Summary

### Total Task Count

**54 tasks** across 6 phases

### Tasks per User Story

- **User Story 1 (P1)**: 11 tasks（T013-T023）
- **User Story 2 (P2)**: 12 tasks（T024-T035）
- **User Story 3 (P3)**: 9 tasks（T036-T044）

### Parallel Opportunities

- **Setup Phase**: 2 tasks can run in parallel（T003-T004）
- **Foundational Phase**: 7 tasks can run in parallel（T005-T010, T012）
- **User Story 1**: 10 tasks can run in parallel（T013-T022）
- **User Story 2**: 10 tasks can run in parallel（T024-T033）
- **User Story 3**: 7 tasks can run in parallel（T036-T042）
- **Polish Phase**: 7 tasks can run in parallel（T045-T049, T052-T053）

**Total parallel opportunities**: 43 tasks marked with [P]

### Independent Test Criteria

#### User Story 1 (P1)
- ✅ `pnpm test tests/unit/models`を実行
- ✅ すべてのUser/Messageモデルテストがパス
- ✅ カバレッジ95%以上

#### User Story 2 (P2)
- ✅ テスト用データベースを起動（Docker）
- ✅ `pnpm test tests/integration/database`を実行
- ✅ すべてのCRUDテストがパス
- ✅ トランザクション分離が機能

#### User Story 3 (P3)
- ✅ WebSocketサーバーを起動
- ✅ `pnpm test tests/integration/websocket`を実行
- ✅ すべての接続/ブロードキャストテストがパス
- ✅ 複数クライアントのテストがパス

### Suggested MVP Scope

**MVP = User Story 1のみ（データモデルの単体テスト）**

理由:
- データモデルはアプリケーションの基盤
- 外部依存なし（DB、WebSocket不要）で高速実行
- 基本的なデータ整合性を保証
- 独立して価値を提供（モデル層の品質保証）

---

## Notes

- [P]タスク = 異なるファイル、依存関係なし
- [Story]ラベルでタスクを特定のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完成・テスト可能
- 各タスクまたは論理的なグループ後にコミット
- 任意のチェックポイントで停止して、ストーリーを独立して検証可能
- 避けるべき: 曖昧なタスク、同一ファイルの競合、ストーリーの独立性を損なう依存関係

---

## Format Validation

✅ すべてのタスクがチェックリスト形式に従っています（チェックボックス、ID、ラベル、ファイルパス）
✅ ユーザーストーリーラベル（[US1], [US2], [US3]）が適切に割り当てられています
✅ 並行実行可能なタスクに[P]マークが付いています
✅ すべてのタスクに具体的なファイルパスが含まれています
