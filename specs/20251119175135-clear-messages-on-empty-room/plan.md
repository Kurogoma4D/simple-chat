# Implementation Plan: Clear Messages on Empty Room

**Branch**: `20251119175135-clear-messages-on-empty-room` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/20251119175135-clear-messages-on-empty-room/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

全ユーザーがチャットルームから退出したときに、メッセージ履歴を自動的にクリアする機能を実装します。ユーザー退出処理をブロックせず、非同期でメッセージ削除を実行することで、パフォーマンスとユーザー体験を両立します。

## Technical Context

**Language/Version**: TypeScript 5.2+, Node.js 22.12.0
**Primary Dependencies**: Express.js 4.x, ws 8.14+, Prisma 6.0+, PostgreSQL
**Storage**: PostgreSQL (Prisma ORM経由でアクセス)
**Testing**: Jest 29.7+, ts-jest 29.1+
**Target Platform**: Linux server (Docker container)
**Project Type**: Web (backend + frontend monorepo)
**Performance Goals**: メッセージ削除処理5秒以内、10,000件のメッセージを10秒以内に削除
**Constraints**: ユーザー退出処理をブロックしない、既存スキーマを変更しない
**Scale/Scope**: 単一グローバルチャットルーム、既存の退出処理フローに統合

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Before Phase 0)

#### I. Type Safety First
- ✅ メッセージ削除サービスは全て型定義を持つ
- ✅ 既存のPrismaスキーマを活用し、型安全性を維持
- ✅ `any`型を使用せず、明示的な型定義を実施

#### II. Single Responsibility Architecture
- ✅ MessageServiceにメッセージ削除ロジックを追加（単一責任）
- ✅ disconnectHandlerからメッセージクリアロジックを呼び出し（関心の分離）
- ✅ 既存のレイヤー構造（Handler → Service → Prisma）を維持

#### III. Container-First Infrastructure
- ✅ 既存のDocker環境を使用（backend service）
- ✅ 環境変数による設定の外部化を維持
- ✅ インフラ変更なし

#### IV. Monorepo Organization
- ✅ backend/src配下に実装を追加
- ✅ 既存のmonorepo構造を維持
- ✅ フロントエンドへの影響なし（バックエンドのみの変更）

#### V. Figma-Driven Frontend
- ✅ フロントエンド変更なし（該当しない）

**Initial Result**: ✅ All gates passed

### Re-check (After Phase 1 Design)

#### I. Type Safety First
- ✅ `MessageService.clearAllMessages(): Promise<number>` - 明示的な戻り値型
- ✅ `clearMessagesIfRoomEmpty(): Promise<void>` - 明示的な戻り値型
- ✅ Prismaの型定義を活用（`prisma.message.deleteMany({})`）
- ✅ 型定義ファイル作成: `contracts/MessageService.ts`, `contracts/disconnectHandler.ts`

#### II. Single Responsibility Architecture
- ✅ MessageService: メッセージCRUD + 削除（単一責任維持）
- ✅ disconnectHandler: ユーザー退出処理 + メッセージクリアトリガー（関心分離）
- ✅ clearMessagesIfRoomEmpty: 条件判定 + 削除実行（内部ヘルパー関数）
- ✅ 依存関係: Handler → Service → Prisma（循環参照なし）

#### III. Container-First Infrastructure
- ✅ 設定変更なし（既存のbackend serviceを使用）
- ✅ 環境変数追加なし
- ✅ docker-compose.yml変更なし

#### IV. Monorepo Organization
- ✅ backend/src/services/MessageService.ts - メソッド追加のみ
- ✅ backend/src/websocket/handlers/disconnectHandler.ts - ロジック追加のみ
- ✅ backend/tests/ - テスト追加
- ✅ フロントエンド影響なし

#### V. Figma-Driven Frontend
- ✅ 該当なし

**Final Result**: ✅ All gates passed - 設計完了後も全てのconstitution原則に準拠

## Project Structure

### Documentation (this feature)

```text
specs/20251119175135-clear-messages-on-empty-room/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # (既存) Prismaモデル
│   ├── services/
│   │   ├── UserService.ts        # (既存)
│   │   ├── MessageService.ts     # (既存) - メッセージ削除メソッドを追加
│   │   └── SystemMessageService.ts  # (既存)
│   ├── websocket/
│   │   ├── handlers/
│   │   │   └── disconnectHandler.ts  # (既存) - メッセージクリア処理を追加
│   │   └── server.ts                 # (既存)
│   └── db.ts                         # (既存)
└── tests/
    ├── unit/
    │   └── services/
    │       └── MessageService.test.ts  # メッセージ削除ロジックのユニットテスト
    └── integration/
        └── websocket/
            └── message-clear.test.ts   # 全員退出時のメッセージクリア統合テスト

frontend/  # 変更なし
```

**Structure Decision**: 既存のWeb applicationモノレポ構造（backend + frontend）を維持します。バックエンドのみの変更となり、フロントエンドへの影響はありません。既存のサービスレイヤーパターンに従い、MessageServiceにメッセージ削除メソッドを追加し、disconnectHandlerから呼び出します。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

該当なし - すべてのconstitutionチェックに合格
