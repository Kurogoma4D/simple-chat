# Implementation Plan: 単体テスト・結合テスト

**Branch**: `002-unit-integration-tests` | **Date**: 2025-11-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-unit-integration-tests/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

単体テスト・結合テストの実装により、UserとMessageデータモデルの品質を保証します。テストは3つのレイヤーで構成されます: データモデルの単体テスト（P1）、データベース統合テスト（P2）、WebSocket統合テスト（P3）。既存のJest環境を活用し、Prismaを使用したデータベーステスト、WebSocketクライアントを使用した結合テストを実装します。

## Technical Context

**Language/Version**: TypeScript 5.2+, Node.js 20 LTS
**Primary Dependencies**: Jest 29.7+, ts-jest 29.1+, Prisma 6.0+, ws 8.14+
**Storage**: PostgreSQL (テスト用インメモリまたは専用インスタンス)
**Testing**: Jest (単体テスト、統合テスト)
**Target Platform**: Linux server (Docker container), macOS (ローカル開発)
**Project Type**: web (monorepo: backend + frontend)
**Performance Goals**: 単体テスト < 1秒、データベース統合テスト < 5秒、WebSocket統合テスト < 10秒、全体 < 30秒
**Constraints**: テストカバレッジ 95%以上（データモデル層）、並行実行可能、環境依存を最小化
**Scale/Scope**: バックエンドのみ対象、テストファイル約10-15個、総テストケース約50-80個

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Type Safety First (Principle I)
- ✅ **PASS**: すべてのテストコードはTypeScriptで記述され、型安全性を維持します
- ✅ **PASS**: テストデータとモックオブジェクトにも明示的な型定義を適用します
- ✅ **PASS**: `any`型の使用を禁止し、必要に応じて`unknown`と型ガードを使用します

### Single Responsibility Architecture (Principle II)
- ✅ **PASS**: 単体テスト、統合テスト、E2Eテストを明確に分離します
- ✅ **PASS**: テストファイルは責務ごと（モデル、データベース、WebSocket）に分割します
- ✅ **PASS**: テストヘルパー関数とユーティリティを適切に分離します

### Container-First Infrastructure (Principle III)
- ✅ **PASS**: データベーステストはDocker上のPostgreSQLインスタンスを使用します
- ✅ **PASS**: テスト環境の設定は環境変数で外部化します

### Monorepo Organization (Principle IV)
- ✅ **PASS**: バックエンドのテストはbackend/testsディレクトリに配置します
- ✅ **PASS**: 共通の型定義は既存のsharedディレクトリを活用します

### Figma-Driven Frontend (Principle V)
- ✅ **N/A**: バックエンドのテスト実装のため、このプリンシプルは適用外です

### Code Quality Standards
- ✅ **PASS**: ESLintとPrettierでテストコードの品質を維持します
- ✅ **PASS**: ビルドエラーとタイプエラーをゼロに保ちます

### Testing Strategy
- ✅ **PASS**: 機能要件に基づいて適切なテストを実装します
- ✅ **PASS**: 単体テスト（モデル）、統合テスト（DB、WebSocket）を優先順位付けして実装します

**Gate Result**: ✅ **PASSED** - すべてのconstitutionプリンシプルに準拠しています

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/           # データモデル定義（テスト対象）
│   ├── services/         # ビジネスロジック
│   └── index.ts          # エントリーポイント
└── tests/
    ├── unit/             # 単体テスト（P1）
    │   ├── models/       # Userモデル、Messageモデルのテスト
    │   │   ├── user.test.ts
    │   │   └── message.test.ts
    │   └── helpers/      # テストヘルパー（型定義、ファクトリ関数）
    │       ├── factories.ts
    │       └── types.ts
    ├── integration/      # 統合テスト（P2, P3）
    │   ├── database/     # データベース統合テスト
    │   │   ├── user-crud.test.ts
    │   │   └── message-crud.test.ts
    │   ├── websocket/    # WebSocket統合テスト
    │   │   ├── connection.test.ts
    │   │   └── broadcast.test.ts
    │   └── setup/        # 統合テスト用セットアップ
    │       ├── db-setup.ts
    │       └── ws-setup.ts
    └── config/
        ├── jest.config.js      # Jest設定
        └── test-env.ts         # テスト環境設定

shared/
└── types/                # 共通型定義（既存）
```

**Structure Decision**: モノレポ構造の`backend/tests`ディレクトリに、単体テストと統合テストを明確に分離して配置します。単体テストは`tests/unit/models`に、統合テストは`tests/integration/database`と`tests/integration/websocket`に分けて実装します。テストヘルパーとセットアップコードは再利用可能な形で分離します。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations**: すべてのconstitutionプリンシプルに準拠しており、複雑性の正当化は不要です。

---

## Phase 1 Completion Status

**Date**: 2025-11-11

### Generated Artifacts

✅ **research.md**: テストフレームワーク、データベーステスト戦略、WebSocketテストアプローチの調査完了
✅ **data-model.md**: User/Messageモデルの詳細定義、バリデーションルール、テストデータ例を記載
✅ **contracts/test-interfaces.md**: テストインターフェース、ファクトリ関数、セットアップ関数の仕様を定義
✅ **quickstart.md**: テスト実行手順、トラブルシューティング、CI/CD統合ガイドを作成
✅ **Agent Context Update**: CLAUDE.mdにテスト関連技術スタックを追加

### Post-Design Constitution Check

Phase 1設計完了後のconstitutionプリンシプル準拠確認:

#### Type Safety First (Principle I)
- ✅ **PASS**: すべてのテストヘルパー関数とファクトリに明示的な型定義を適用
- ✅ **PASS**: test-interfaces.mdですべてのインターフェースと型を文書化
- ✅ **PASS**: Prisma型との互換性を維持

#### Single Responsibility Architecture (Principle II)
- ✅ **PASS**: 単体テスト、統合テスト（DB、WebSocket）を明確に分離
- ✅ **PASS**: ファクトリ、バリデーター、セットアップを独立した責務として分離
- ✅ **PASS**: 各テストファイルは1つのモデルまたは機能のみをテスト

#### Container-First Infrastructure (Principle III)
- ✅ **PASS**: テスト用PostgreSQLをDocker Composeで提供
- ✅ **PASS**: quickstart.mdでDocker環境のセットアップを文書化

#### Monorepo Organization (Principle IV)
- ✅ **PASS**: backend/testsディレクトリに適切に配置
- ✅ **PASS**: sharedディレクトリの型定義を活用

#### Code Quality Standards
- ✅ **PASS**: テストコードもESLint/Prettierの対象
- ✅ **PASS**: カバレッジ95%の閾値を設定

#### Testing Strategy
- ✅ **PASS**: 機能要件（FR-001〜FR-014）に基づいたテスト計画
- ✅ **PASS**: 優先順位付け（P1: 単体、P2: DB統合、P3: WebSocket統合）

**Gate Result**: ✅ **PASSED** - Phase 1設計後もすべてのconstitutionプリンシプルに準拠しています

### Next Steps

Phase 2（タスク生成）に進む準備が完了しました。

次のコマンドを実行してください:
```bash
/speckit.tasks
```

これにより、実装タスクが依存関係順に生成され、`specs/002-unit-integration-tests/tasks.md`が作成されます。
