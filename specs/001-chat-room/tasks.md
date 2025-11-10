# Tasks: リアルタイムチャットルーム

**Input**: Design documents from `/specs/001-chat-room/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: テストは初期バージョンでは任意実装とします。基本機能を優先します。

**Organization**: タスクはユーザーストーリー単位で整理し、各ストーリーを独立して実装・テスト可能にします。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: 所属するユーザーストーリー（US1、US2、US3）
- 説明に正確なファイルパスを含めます

## Path Conventions

- **Backend**: `backend/src/`, `backend/prisma/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Shared**: `shared/types/`

## Phase 1: Setup (共通インフラ)

**Purpose**: プロジェクト初期化と基本構造のセットアップ

- [ ] T001 Create monorepo structure with backend/, frontend/, shared/ directories
- [ ] T002 [P] Initialize backend project with package.json, tsconfig.json in backend/
- [ ] T003 [P] Initialize frontend project with Next.js in frontend/
- [ ] T004 [P] Setup shared types directory in shared/types/
- [ ] T005 [P] Create docker-compose.yml with db, backend, frontend services
- [ ] T006 [P] Create backend Dockerfile in backend/Dockerfile
- [ ] T007 [P] Create frontend Dockerfile in frontend/Dockerfile
- [ ] T008 [P] Configure mise.toml for Node.js toolchain at repository root
- [ ] T009 [P] Setup ESLint and Prettier configuration in backend/
- [ ] T010 [P] Setup ESLint and Prettier configuration in frontend/

---

## Phase 2: Foundational (必須の前提条件)

**Purpose**: すべてのユーザーストーリーが依存するコアインフラ

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業は開始できません

- [ ] T011 Define Prisma schema with User and Message models in backend/prisma/schema.prisma
- [ ] T012 Create initial database migration in backend/prisma/migrations/
- [ ] T013 [P] Define shared TypeScript types for User in shared/types/user.ts
- [ ] T014 [P] Define shared TypeScript types for Message in shared/types/message.ts
- [ ] T015 [P] Define shared TypeScript types for WebSocket protocol in shared/types/websocket.ts
- [ ] T016 Setup Express.js server with basic routing in backend/src/index.ts
- [ ] T017 [P] Configure database connection with Prisma Client in backend/src/db.ts
- [ ] T018 [P] Create validation utilities for name and message in backend/src/utils/validation.ts
- [ ] T019 [P] Setup error handling middleware in backend/src/middleware/errorHandler.ts
- [ ] T020 [P] Configure environment variables in backend/.env.example and frontend/.env.example

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 名前入力とチャット参加 (Priority: P1) 🎯 MVP

**Goal**: ユーザーが名前を入力してチャットルームに参加し、リアルタイムでメッセージを送受信できる

**Independent Test**: ブラウザを開き、名前を入力してチャットルームに入り、メッセージを送信・受信できることを確認します

### Backend Implementation for User Story 1

- [ ] T021 [P] [US1] Create UserService with join/leave/find methods in backend/src/services/UserService.ts
- [ ] T022 [P] [US1] Create MessageService with create/broadcast methods in backend/src/services/MessageService.ts
- [ ] T023 [US1] Setup WebSocket server with ws library in backend/src/websocket/server.ts
- [ ] T024 [US1] Implement JOIN message handler in backend/src/websocket/handlers/joinHandler.ts
- [ ] T025 [US1] Implement MESSAGE send handler in backend/src/websocket/handlers/messageHandler.ts
- [ ] T026 [US1] Implement connection management in backend/src/websocket/connectionManager.ts
- [ ] T027 [US1] Implement disconnect handler with cleanup logic in backend/src/websocket/handlers/disconnectHandler.ts
- [ ] T028 [US1] Add system message generation for join/leave in backend/src/services/SystemMessageService.ts
- [ ] T029 [US1] Implement message broadcasting to all connected clients in backend/src/websocket/broadcast.ts
- [ ] T030 [US1] Add rate limiting for message sending in backend/src/middleware/rateLimiter.ts

### Frontend Implementation for User Story 1

- [ ] T031 [P] [US1] Create JoinForm component in frontend/src/components/JoinForm/JoinForm.tsx
- [ ] T032 [P] [US1] Create ChatRoom component in frontend/src/components/ChatRoom/ChatRoom.tsx
- [ ] T033 [P] [US1] Create MessageList component in frontend/src/components/MessageList/MessageList.tsx
- [ ] T034 [P] [US1] Create MessageInput component in frontend/src/components/MessageInput/MessageInput.tsx
- [ ] T035 [US1] Create WebSocket client service in frontend/src/services/websocket.ts
- [ ] T036 [US1] Create useWebSocket custom hook in frontend/src/hooks/useWebSocket.ts
- [ ] T037 [US1] Create useChatRoom custom hook for state management in frontend/src/hooks/useChatRoom.ts
- [ ] T038 [US1] Implement main page with join and chat views in frontend/src/app/page.tsx
- [ ] T039 [US1] Add client-side validation for name and message in frontend/src/utils/validation.ts
- [ ] T040 [US1] Add error handling and user notifications in frontend/src/components/ErrorNotification/ErrorNotification.tsx

### Integration for User Story 1

- [ ] T041 [US1] Connect frontend WebSocket client to backend server
- [ ] T042 [US1] Test JOIN flow: name input → WebSocket connection → WELCOME message
- [ ] T043 [US1] Test MESSAGE flow: send message → save to DB → broadcast to all clients
- [ ] T044 [US1] Test multi-user scenario: multiple connections send/receive messages
- [ ] T045 [US1] Test disconnect flow: close connection → update user status → broadcast USER_LEFT

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - メッセージ履歴の表示 (Priority: P2)

**Goal**: ユーザーがチャットルームに参加すると過去のメッセージ履歴（最新100件）が表示される

**Independent Test**: チャットルームを離れて再度参加し、過去のメッセージが表示されることを確認します

### Backend Implementation for User Story 2

- [ ] T046 [US2] Add getHistory method to MessageService with limit=100 in backend/src/services/MessageService.ts
- [ ] T047 [US2] Update JOIN handler to load and send message history in backend/src/websocket/handlers/joinHandler.ts
- [ ] T048 [US2] Add database index for createdAt DESC on Message table via Prisma migration
- [ ] T049 [US2] Optimize history query for performance (<50ms for 100 messages)

### Frontend Implementation for User Story 2

- [ ] T050 [US2] Update ChatRoom component to display history on join in frontend/src/components/ChatRoom/ChatRoom.tsx
- [ ] T051 [US2] Add scroll-to-bottom behavior for new messages in frontend/src/components/MessageList/MessageList.tsx
- [ ] T052 [US2] Add loading indicator while fetching history in frontend/src/components/MessageList/MessageList.tsx
- [ ] T053 [US2] Handle empty history state gracefully in frontend/src/components/MessageList/MessageList.tsx

### Integration for User Story 2

- [ ] T054 [US2] Test history loading: join → receive WELCOME with 100 messages → display in chronological order
- [ ] T055 [US2] Test scroll behavior: history displayed → new message arrives → scroll to bottom
- [ ] T056 [US2] Test with empty history: new room → no messages → display empty state

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - ユーザーのオンライン状態表示 (Priority: P3)

**Goal**: チャットルームに参加しているユーザーのリストとオンライン状態を表示する

**Independent Test**: 複数のブラウザでチャットルームに参加し、参加者リストが更新されることを確認します

### Backend Implementation for User Story 3

- [ ] T057 [US3] Add getActiveUsers method to UserService in backend/src/services/UserService.ts
- [ ] T058 [US3] Update JOIN handler to broadcast USER_JOINED with user info to other clients in backend/src/websocket/handlers/joinHandler.ts
- [ ] T059 [US3] Update disconnect handler to broadcast USER_LEFT to remaining clients in backend/src/websocket/handlers/disconnectHandler.ts
- [ ] T060 [US3] Send ACTIVE_USERS message on user join in backend/src/websocket/handlers/joinHandler.ts
- [ ] T061 [US3] Add database index for isOnline on User table via Prisma migration

### Frontend Implementation for User Story 3

- [ ] T062 [P] [US3] Create UserList component in frontend/src/components/UserList/UserList.tsx
- [ ] T063 [P] [US3] Create UserListItem component in frontend/src/components/UserList/UserListItem.tsx
- [ ] T064 [US3] Update useChatRoom hook to manage active users state in frontend/src/hooks/useChatRoom.ts
- [ ] T065 [US3] Handle USER_JOINED message to add user to list in frontend/src/services/websocket.ts
- [ ] T066 [US3] Handle USER_LEFT message to remove user from list in frontend/src/services/websocket.ts
- [ ] T067 [US3] Display UserList component in ChatRoom in frontend/src/components/ChatRoom/ChatRoom.tsx
- [ ] T068 [US3] Add online/offline indicator styling in frontend/src/components/UserList/UserList.tsx

### Integration for User Story 3

- [ ] T069 [US3] Test user join: new user joins → USER_JOINED broadcast → all clients update user list
- [ ] T070 [US3] Test user leave: user disconnects → USER_LEFT broadcast → all clients update user list
- [ ] T071 [US3] Test multiple users: 3+ users in room → all see complete user list
- [ ] T072 [US3] Test network disconnect: simulate disconnect → user marked offline → list updates

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善

- [ ] T073 [P] Add heartbeat/ping-pong to detect stale connections in backend/src/websocket/heartbeat.ts
- [ ] T074 [P] Implement automatic reconnection logic in frontend/src/services/websocket.ts
- [ ] T075 [P] Add structured logging with Winston or similar in backend/src/utils/logger.ts
- [ ] T076 [P] Add error boundary component for frontend in frontend/src/components/ErrorBoundary/ErrorBoundary.tsx
- [ ] T077 [P] Optimize bundle size with Next.js code splitting
- [ ] T078 [P] Add security headers in Express middleware in backend/src/middleware/security.ts
- [ ] T079 [P] Sanitize message content for XSS prevention in backend/src/utils/sanitize.ts
- [ ] T080 [P] Add performance monitoring (message delivery time) in backend/src/utils/metrics.ts
- [ ] T081 [P] Create README.md with setup instructions at repository root
- [ ] T082 [P] Add basic styling with Tailwind CSS or CSS Modules in frontend/
- [ ] T083 [P] Test quickstart.md instructions: docker-compose up → verify all services running
- [ ] T084 Conduct end-to-end manual testing of all user stories
- [ ] T085 Fix any edge cases discovered during testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses US1 components but adds history feature independently
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Adds user list feature independently

### Within Each User Story

1. Backend services before WebSocket handlers
2. Frontend components before integration
3. Core implementation before edge case handling
4. Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T010)
- All Foundational tasks marked [P] can run in parallel (T013-T020)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each story, tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Backend services (can run in parallel):
Task T021: "Create UserService in backend/src/services/UserService.ts"
Task T022: "Create MessageService in backend/src/services/MessageService.ts"

# Frontend components (can run in parallel):
Task T031: "Create JoinForm component in frontend/src/components/JoinForm/JoinForm.tsx"
Task T032: "Create ChatRoom component in frontend/src/components/ChatRoom/ChatRoom.tsx"
Task T033: "Create MessageList component in frontend/src/components/MessageList/MessageList.tsx"
Task T034: "Create MessageInput component in frontend/src/components/MessageInput/MessageInput.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T020) - CRITICAL
3. Complete Phase 3: User Story 1 (T021-T045)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**MVP Deliverable**: ユーザーが名前を入力してチャットルームに参加し、リアルタイムでメッセージを送受信できる機能

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP ready!**
3. Add User Story 2 → Test independently → **Enhanced with history**
4. Add User Story 3 → Test independently → **Full feature set with user list**
5. Add Polish → **Production ready**

Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T020)
2. Once Foundational is done:
   - Developer A: User Story 1 Backend (T021-T030)
   - Developer B: User Story 1 Frontend (T031-T040)
   - After US1 complete:
     - Developer A: User Story 2 (T046-T056)
     - Developer B: User Story 3 (T057-T072)
3. All developers: Polish (T073-T085)

---

## Task Summary

### Total Tasks: 85

**By Phase**:
- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 10 tasks (CRITICAL blocking phase)
- Phase 3 (User Story 1 - MVP): 25 tasks
- Phase 4 (User Story 2): 11 tasks
- Phase 5 (User Story 3): 16 tasks
- Phase 6 (Polish): 13 tasks

**By User Story**:
- User Story 1: 25 tasks (MVP核心機能)
- User Story 2: 11 tasks (履歴表示)
- User Story 3: 16 tasks (ユーザーリスト)

**Parallel Opportunities**:
- Setup phase: 9 parallel tasks
- Foundational phase: 8 parallel tasks
- Within each user story: 10+ parallel tasks
- User stories themselves: 3 parallel streams (after foundational)

### Independent Test Criteria

**User Story 1 (MVP)**:
- ✓ ブラウザで名前を入力してチャットルームに参加できる
- ✓ メッセージを送信すると即座に表示される
- ✓ 複数のユーザーがリアルタイムでメッセージを送受信できる

**User Story 2**:
- ✓ チャットルームに参加すると過去100件のメッセージが表示される
- ✓ メッセージ履歴をスクロールして閲覧できる

**User Story 3**:
- ✓ 参加しているユーザーのリストが表示される
- ✓ ユーザーの参加・退出時にリストが更新される
- ✓ オンライン/オフライン状態が表示される

### MVP Scope Recommendation

**Minimum Viable Product**: User Story 1のみ (T001-T045)

これにより以下を実現:
- ユーザーが名前を入力してチャットに参加
- リアルタイムでメッセージの送受信
- 複数ユーザーの同時利用

User Story 2 (履歴) と User Story 3 (ユーザーリスト) は、MVPの動作確認後に追加可能です。

---

## Notes

- [P] tasks = 異なるファイル、依存関係なし
- [Story] label = タスクを特定のユーザーストーリーに関連付けてトレーサビリティ確保
- 各ユーザーストーリーは独立して完成・テスト可能
- 各チェックポイントでストーリーを独立して検証
- タスク完了後またはロジカルなグループ単位でコミット
- 回避すべき: 曖昧なタスク、同一ファイルでの競合、ストーリーの独立性を損なう相互依存
- Foundational phase完了後、各ユーザーストーリーは並列実装可能
- MVP (User Story 1) を最初に完成させ、その後段階的に機能追加を推奨
