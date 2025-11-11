# Feature Specification: 単体テスト・結合テスト

**Feature Branch**: `002-unit-integration-tests`
**Created**: 2025-11-11
**Status**: Draft
**Input**: User description: "単体テスト・結合テスト"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - データモデルの単体テスト (Priority: P1)

開発者はUserとMessageのデータモデルに対する単体テストを実行し、各エンティティの基本的な機能が正しく動作することを確認します。

**Why this priority**: データモデルはアプリケーションの基盤であり、最初にテストすべき最も重要な部分です。この機能だけで基本的なデータ整合性を保証できます。

**Independent Test**: テストコマンドを実行し、Userエンティティのバリデーション、Messageエンティティの作成・検証が正しく動作することを確認します。

**Acceptance Scenarios**:

1. **Given** Userモデルが定義されている、**When** 有効なユーザーデータで新しいUserを作成する、**Then** Userオブジェクトが正しく作成され、すべてのプロパティが期待通りに設定される
2. **Given** Userモデルが定義されている、**When** 無効なデータ（空の名前、不正なUUID）でUserを作成する、**Then** 適切なバリデーションエラーが発生する
3. **Given** Messageモデルが定義されている、**When** 有効なメッセージデータで新しいMessageを作成する、**Then** Messageオブジェクトが正しく作成され、送信者情報とコンテンツが適切に保持される
4. **Given** Messageモデルが定義されている、**When** システムメッセージ（userIdがnull）を作成する、**Then** システムメッセージとして正しく作成される

---

### User Story 2 - データベース統合テスト (Priority: P2)

開発者はデータベースとの統合テストを実行し、UserとMessageの永続化、検索、更新が正しく動作することを確認します。

**Why this priority**: データモデルの単体テストが動作していれば、次にデータベースとの統合を検証します。独立してテスト可能です。

**Independent Test**: テストデータベースを使用して、UserとMessageのCRUD操作が正しく動作することを確認します。

**Acceptance Scenarios**:

1. **Given** データベースが初期化されている、**When** 新しいUserを永続化する、**Then** データベースにUserが正しく保存され、検索で取得できる
2. **Given** データベースにUserが存在する、**When** Userのオンライン状態を更新する、**Then** 更新が正しく反映され、lastActiveAtタイムスタンプが更新される
3. **Given** データベースにUserが存在する、**When** そのUserに関連付けられたMessageを作成する、**Then** Messageが正しく保存され、User IDとの関連が維持される
4. **Given** データベースに複数のMessageが存在する、**When** 最新のメッセージを時系列順に取得する、**Then** createdAtの降順でメッセージが取得される
5. **Given** データベースに複数のUserが存在する、**When** オンラインユーザーのみを検索する、**Then** isOnlineがtrueのユーザーのみが返される

---

### User Story 3 - WebSocket統合テスト (Priority: P3)

開発者はWebSocketを使用したリアルタイム通信の統合テストを実行し、メッセージの送受信、ユーザーの接続・切断が正しく動作することを確認します。

**Why this priority**: データモデルとデータベースが動作していれば、WebSocketレイヤーの統合を検証します。独立してテスト可能です。

**Independent Test**: テストクライアントを使用してWebSocketに接続し、メッセージの送受信、セッション管理が正しく動作することを確認します。

**Acceptance Scenarios**:

1. **Given** WebSocketサーバーが起動している、**When** クライアントが名前を指定して接続する、**Then** 新しいUserが作成され、socketIdが設定され、isOnlineがtrueになる
2. **Given** 複数のクライアントが接続している、**When** 1つのクライアントがメッセージを送信する、**Then** すべてのクライアントがメッセージを受信する
3. **Given** クライアントが接続している、**When** クライアントが切断する、**Then** Userのオンライン状態がfalseに更新され、socketIdがクリアされる
4. **Given** クライアントが接続している、**When** 一定時間アクティビティがない、**Then** lastActiveAtタイムスタンプが正しく更新される

---

### Edge Cases

- データベース接続が失敗した場合、テストはどのように処理されるか？
- 並行して複数のテストが実行された場合、テストデータの分離は保証されるか？
- UUIDの生成が重複した場合（極めて稀なケース）、エラー処理は適切か？
- 非常に長いメッセージコンテンツ（上限を超える）の場合、バリデーションは機能するか？
- タイムゾーンが異なる環境でテストを実行した場合、DateTimeの比較は正しく動作するか？
- WebSocket接続が突然切断された場合、クリーンアップ処理は正しく動作するか？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: テストスイートはUserモデルの全プロパティ（id, name, socketId, isOnline, lastActiveAt, createdAt, updatedAt）の検証を含まなければならない
- **FR-002**: テストスイートはMessageモデルの全プロパティ（id, userId, userName, content, type, createdAt）の検証を含まなければならない
- **FR-003**: テストはUserのバリデーション（名前の長さ制限、UUIDの形式、Boolean型の検証）を確認しなければならない
- **FR-004**: テストはMessageのバリデーション（コンテンツの長さ制限、typeの値、userIdとuserNameの一貫性）を確認しなければならない
- **FR-005**: テストはシステムメッセージ（userIdがnull）とユーザーメッセージの区別を検証しなければならない
- **FR-006**: データベース統合テストはUserとMessageのCRUD操作（作成、読み取り、更新、削除）を検証しなければならない
- **FR-007**: データベース統合テストはUserとMessageの関連（外部キー制約）を検証しなければならない
- **FR-008**: テストはオンライン状態の変更（接続時にtrue、切断時にfalse）を検証しなければならない
- **FR-009**: テストはsocketIdの設定（接続時）とクリア（切断時）を検証しなければならない
- **FR-010**: テストはlastActiveAtタイムスタンプの自動更新を検証しなければならない
- **FR-011**: テストはcreatedAtとupdatedAtタイムスタンプの自動設定と更新を検証しなければならない
- **FR-012**: WebSocket統合テストは複数クライアント間のメッセージブロードキャストを検証しなければならない
- **FR-013**: テストはテストデータの分離（各テスト実行後のクリーンアップ）を保証しなければならない
- **FR-014**: テストはエラーケース（不正なデータ、接続失敗、バリデーションエラー）を網羅しなければならない

### Key Entities

- **User**: チャットルームに参加しているユーザーを表します。属性にはid（UUID）、name（String）、socketId（String、接続中のみ）、isOnline（Boolean）、lastActiveAt（DateTime）、createdAt（DateTime）、updatedAt（DateTime）が含まれます
- **Message**: チャットルームで送受信されるメッセージを表します。属性にはid（UUID）、userId（UUID、外部キー、システムメッセージの場合はnull）、userName（String、送信時のスナップショット）、content（String）、type（"user" | "system"）、createdAt（DateTime）が含まれます

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: すべての単体テストは1秒以内に完了する
- **SC-002**: すべてのデータベース統合テストは5秒以内に完了する
- **SC-003**: すべてのWebSocket統合テストは10秒以内に完了する
- **SC-004**: テストカバレッジはデータモデル層で95%以上を達成する
- **SC-005**: テストスイート全体は開発者のローカル環境で30秒以内に完了する
- **SC-006**: すべてのテストはCI/CD環境で自動実行され、失敗した場合は明確なエラーメッセージを提供する
- **SC-007**: 開発者の90%が初回実行時にテストを正常に実行できる

## Assumptions

- テストフレームワークとしてJestまたは同等のツールを使用します（Node.js LTS環境の標準）
- データベースはテスト用の別インスタンスまたはインメモリデータベースを使用します
- WebSocketテストはテスト用のモッククライアントを使用します
- テストデータは各テスト実行後にクリーンアップされます
- 名前の最大長は50文字、メッセージの最大長は1000文字とします（既存仕様001-chat-roomに基づく）
- タイムスタンプはUTCで管理され、テストでの比較もUTC基準で行います
- テストは並行実行可能で、相互に影響を与えません
