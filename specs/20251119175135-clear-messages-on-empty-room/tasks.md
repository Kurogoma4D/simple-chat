# Tasks: Clear Messages on Empty Room

**Input**: Design documents from `/specs/20251119175135-clear-messages-on-empty-room/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as per project testing strategy (Jest 29.7+, ts-jest 29.1+)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`, `frontend/src/`
- This feature only touches backend code

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment and development setup

既存のプロジェクト構造を使用するため、セットアップタスクは最小限です。

- [ ] T001 Verify Docker environment is running with `docker compose ps`
- [ ] T002 Verify test database is accessible with `docker compose --profile test up db-test -d`
- [ ] T003 [P] Review existing MessageService implementation in backend/src/services/MessageService.ts
- [ ] T004 [P] Review existing disconnectHandler implementation in backend/src/websocket/handlers/disconnectHandler.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story implementation

このフェーズは既存のインフラ（Prisma、WebSocket、User/Message管理）を活用するため、新規の基盤タスクはありません。

**Checkpoint**: Foundation ready - 既存のインフラが全て利用可能

---

## Phase 3: User Story 1 - 全員退出時のメッセージ履歴自動削除 (Priority: P1) 🎯 MVP

**Goal**: チャットルームから全ユーザーが退出したときに、メッセージ履歴を自動的にクリアする。次回入室時はクリーンな状態から会話を開始できる。

**Independent Test**: 複数ユーザーでメッセージを送信後、全員が退出し、再度入室したときにメッセージ履歴が空であることを確認

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 [P] [US1] Create unit test file for MessageService.clearAllMessages in backend/tests/unit/services/MessageService.test.ts
- [ ] T006 [US1] Write unit test: should delete all messages and return count in backend/tests/unit/services/MessageService.test.ts
- [ ] T007 [US1] Write unit test: should return 0 when no messages exist in backend/tests/unit/services/MessageService.test.ts
- [ ] T008 [US1] Write unit test: should handle database errors gracefully in backend/tests/unit/services/MessageService.test.ts
- [ ] T009 [P] [US1] Create integration test file for message clearing in backend/tests/integration/websocket/message-clear.test.ts
- [ ] T010 [US1] Write integration test: should clear messages when all users disconnect in backend/tests/integration/websocket/message-clear.test.ts
- [ ] T011 [US1] Write integration test: should NOT clear messages when some users remain online in backend/tests/integration/websocket/message-clear.test.ts
- [ ] T012 [US1] Write integration test: should handle concurrent disconnects correctly in backend/tests/integration/websocket/message-clear.test.ts
- [ ] T013 [US1] Write integration test: should complete user disconnect even if message clear fails in backend/tests/integration/websocket/message-clear.test.ts

### Implementation for User Story 1

- [ ] T014 [US1] Implement clearAllMessages method in backend/src/services/MessageService.ts returning Promise<number>
- [ ] T015 [US1] Add JSDoc documentation to clearAllMessages method with type annotations in backend/src/services/MessageService.ts
- [ ] T016 [US1] Create clearMessagesIfRoomEmpty helper function in backend/src/websocket/handlers/disconnectHandler.ts
- [ ] T017 [US1] Implement online user count check in clearMessagesIfRoomEmpty using UserService.getActiveUsers in backend/src/websocket/handlers/disconnectHandler.ts
- [ ] T018 [US1] Implement message deletion logic when room is empty in clearMessagesIfRoomEmpty in backend/src/websocket/handlers/disconnectHandler.ts
- [ ] T019 [US1] Add try-catch error handling with console.error logging in clearMessagesIfRoomEmpty in backend/src/websocket/handlers/disconnectHandler.ts
- [ ] T020 [US1] Add fire-and-forget call to clearMessagesIfRoomEmpty at end of handleDisconnect using void pattern in backend/src/websocket/handlers/disconnectHandler.ts
- [ ] T021 [US1] Add success log message with deletion count in clearMessagesIfRoomEmpty in backend/src/websocket/handlers/disconnectHandler.ts
- [ ] T022 [US1] Run unit tests and verify all tests pass with `cd backend && npm test -- MessageService.test.ts`
- [ ] T023 [US1] Run integration tests and verify all tests pass with `cd backend && npm run test:integration -- message-clear.test.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Validation & Performance Testing

**Purpose**: Ensure feature meets success criteria and performance goals

- [ ] T024 [P] Manual test: Verify 3 users can join, send messages, all disconnect, and messages are cleared
- [ ] T025 [P] Manual test: Verify partial disconnect (some users remain) does NOT clear messages
- [ ] T026 [P] Manual test: Verify new user joining after clear sees empty message history
- [ ] T027 Performance test: Create 10,000 test messages and verify deletion completes within 10 seconds in backend/tests/integration/performance/message-clear-perf.test.ts
- [ ] T028 [P] Error scenario test: Verify user disconnect succeeds even when message deletion fails
- [ ] T029 Log verification: Check Docker logs for successful message clear operations with `docker compose logs backend | grep MessageClear`

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [ ] T030 [P] Review and update TypeScript types for all new functions ensuring no `any` types
- [ ] T031 [P] Run ESLint and fix any violations with `cd backend && npm run lint`
- [ ] T032 [P] Run Prettier and format all modified files with `cd backend && npm run format`
- [ ] T033 Verify all tests pass with coverage with `cd backend && npm run test:coverage`
- [ ] T034 [P] Update feature documentation in specs/20251119175135-clear-messages-on-empty-room/quickstart.md with final implementation details
- [ ] T035 Code review: Verify Single Responsibility Principle compliance per constitution
- [ ] T036 Code review: Verify Type Safety First principle compliance per constitution
- [ ] T037 [P] Add inline comments explaining fire-and-forget pattern in disconnectHandler.ts
- [ ] T038 Final validation: Run quickstart.md manual testing scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A - no foundational tasks (using existing infrastructure)
- **User Story 1 (Phase 3)**: Can start immediately after Setup
- **Validation (Phase 4)**: Depends on User Story 1 implementation completion
- **Polish (Phase 5)**: Depends on all testing and validation completion

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - this is the only story for this feature

### Within User Story 1

1. **Tests First (T005-T013)**: Write all tests first, ensure they FAIL
2. **Core Implementation (T014-T015)**: MessageService.clearAllMessages method
3. **Handler Integration (T016-T021)**: disconnectHandler updates
4. **Verification (T022-T023)**: Run tests and ensure they PASS

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003 and T004 can run in parallel (reviewing different files)

**Phase 3 (Tests)**:
- T005 and T009 can run in parallel (creating different test files)
- T006, T007, T008 must run sequentially (same file)
- T010, T011, T012, T013 must run sequentially (same file)

**Phase 3 (Implementation)**:
- T014-T015 (MessageService changes) can run in parallel with T016-T021 (disconnectHandler changes) IF different developers
- Within same developer: Must be sequential

**Phase 4 (Validation)**:
- T024, T025, T026 can run in parallel (independent manual tests)
- T027, T028, T029 can run in parallel (independent test scenarios)

**Phase 5 (Polish)**:
- T030, T031, T032, T034, T037 can all run in parallel (different files or independent operations)

---

## Parallel Example: User Story 1

### Parallel Test Creation
```bash
# Developer A:
Task: "Create unit test file for MessageService.clearAllMessages in backend/tests/unit/services/MessageService.test.ts"

# Developer B (simultaneously):
Task: "Create integration test file for message clearing in backend/tests/integration/websocket/message-clear.test.ts"
```

### Parallel Implementation (if multiple developers)
```bash
# Developer A:
Task: "Implement clearAllMessages method in backend/src/services/MessageService.ts"
Task: "Add JSDoc documentation to clearAllMessages method"

# Developer B (simultaneously):
Task: "Create clearMessagesIfRoomEmpty helper function in backend/src/websocket/handlers/disconnectHandler.ts"
Task: "Implement online user count check and deletion logic"
```

### Parallel Validation
```bash
# All can run simultaneously:
Task: "Manual test: Verify 3 users scenario"
Task: "Manual test: Verify partial disconnect scenario"
Task: "Manual test: Verify new user sees empty history"
Task: "Performance test: 10,000 messages deletion"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. **Phase 1: Setup** (T001-T004)
   - Verify environment ready
   - Review existing code

2. **Phase 3: User Story 1** (T005-T023)
   - Write failing tests first (T005-T013)
   - Implement MessageService.clearAllMessages (T014-T015)
   - Implement disconnectHandler integration (T016-T021)
   - Verify tests pass (T022-T023)
   - **STOP and VALIDATE**: Test independently

3. **Phase 4: Validation** (T024-T029)
   - Manual testing scenarios
   - Performance verification
   - Error scenario validation

4. **Phase 5: Polish** (T030-T038)
   - Code quality checks
   - Documentation updates
   - Final review

### Incremental Delivery

1. Complete Setup → Environment verified
2. Complete Tests → Test suite ready (failing)
3. Complete Implementation → Tests pass, feature works
4. Complete Validation → Performance and edge cases verified
5. Complete Polish → Production ready

### Time Estimates (Single Developer)

- **Phase 1**: 15-30 minutes (environment verification)
- **Phase 3 Tests**: 2-3 hours (write comprehensive test suite)
- **Phase 3 Implementation**: 1-2 hours (simple implementation)
- **Phase 4**: 1-2 hours (manual and performance testing)
- **Phase 5**: 1 hour (polish and review)

**Total**: 5-8 hours for complete feature implementation

---

## Notes

- All tasks follow strict TypeScript type safety (no `any` types)
- Fire-and-forget pattern (`void promise`) is used for non-blocking message deletion
- Error handling ensures user disconnect never fails due to message clear errors
- Tests verify both positive and negative scenarios
- Performance target: 10,000 messages deleted in <10 seconds
- User disconnect target: Always completes in <5 seconds regardless of message deletion
- Logging provides visibility into message clear operations for debugging
- Constitution compliance: Type Safety First, Single Responsibility Architecture
