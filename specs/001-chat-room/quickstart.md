# Quick Start Guide: リアルタイムチャットルーム

**Feature**: 001-chat-room | **Date**: 2025-11-07

## Overview

このガイドは開発者がリアルタイムチャットルーム機能の開発を開始するための手順を提供します。環境構築から基本的な動作確認までをカバーします。

## Prerequisites

### Required Tools

以下のツールがインストールされている必要があります:

- **mise**: v2024.1.0+ (ツールチェイン管理)
- **Docker**: v20.10+ (コンテナ実行)
- **Docker Compose**: v2.0+ (マルチコンテナオーケストレーション)

### Installation

#### 1. mise Installation

```bash
# macOS (Homebrew)
brew install mise

# Linux
curl https://mise.jdx.dev/install.sh | sh

# Verify installation
mise --version
```

#### 2. Docker Installation

```bash
# macOS
brew install --cask docker

# Linux (Ubuntu)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
docker-compose --version
```

## Project Setup

### 1. Clone Repository

```bash
# If not already cloned
git clone <repository-url>
cd simple-chat

# Switch to feature branch
git checkout 001-chat-room
```

### 2. Install Development Tools via mise

```bash
# mise will read .mise.toml and install required versions
mise install

# Verify Node.js installation
node --version  # Should show version specified in mise.toml
```

### 3. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Return to project root
cd ..
```

## Development Environment

### 1. Start Docker Services

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

**Expected Output**:
```
NAME                COMMAND                  SERVICE    STATUS    PORTS
simple-chat-db-1    "docker-entrypoint.s…"   db         Up        0.0.0.0:5432->5432/tcp
simple-chat-be-1    "npm run dev"            backend    Up        0.0.0.0:3001->3001/tcp
simple-chat-fe-1    "npm run dev"            frontend   Up        0.0.0.0:3000->3000/tcp
```

### 2. Database Setup

```bash
# Run migrations (inside backend container or locally)
cd backend
npx prisma migrate dev

# (Optional) Seed test data
npx prisma db seed
```

### 3. Verify Services

**Database**:
```bash
# Connect to PostgreSQL
docker exec -it simple-chat-db-1 psql -U postgres -d chatdb

# List tables
\dt

# Should see: User, Message tables
```

**Backend**:
```bash
# Check backend health
curl http://localhost:3001/health

# Expected: {"status": "ok"}
```

**Frontend**:
```bash
# Open in browser
open http://localhost:3000

# Should see: Chat room interface
```

### 4. WebSocket Connection Test

```bash
# Install wscat for WebSocket testing
npm install -g wscat

# Connect to WebSocket server
wscat -c ws://localhost:3001/ws

# Send JOIN message
> {"type":"join","name":"TestUser"}

# Expected response: WELCOME message with history
< {"type":"welcome","userId":"...","history":[]}
```

## Development Workflow

### 1. Making Code Changes

#### Backend Changes

```bash
cd backend

# TypeScript compilation is automatic in dev mode
npm run dev

# Changes are hot-reloaded
# Check logs: docker-compose logs -f backend
```

#### Frontend Changes

```bash
cd frontend

# Next.js hot-reload is automatic
npm run dev

# Open http://localhost:3000
# Changes reflect immediately in browser
```

### 2. Database Schema Changes

```bash
cd backend

# Edit prisma/schema.prisma
# Then create migration
npx prisma migrate dev --name your_migration_name

# Apply migration (dev environment)
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### 3. Type Definitions

#### Shared Types

```bash
# Edit shared/types/*.ts

# Both backend and frontend reference these types
# No build step needed for TypeScript

# Verify type safety
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

### 4. Running Tests

#### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

#### Frontend Tests

```bash
cd frontend

# Component tests
npm run test

# E2E tests (requires services running)
npm run test:e2e

# Watch mode
npm run test:watch
```

## Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Clean Up

```bash
# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v

# Remove all Docker resources
docker-compose down -v --rmi all
```

### Database Administration

```bash
# Access Prisma Studio (GUI for database)
cd backend
npx prisma studio

# Opens at http://localhost:5555
```

### Reset Database

```bash
cd backend

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Confirm with 'y'
```

## Testing the Feature

### Manual Testing Flow

#### 1. Test User Join

1. Open http://localhost:3000
2. Enter name: "ユーザー1"
3. Click "参加" button
4. Verify:
   - Chat room appears
   - System message: "ユーザー1さんが参加しました"

#### 2. Test Message Sending

1. Type message: "こんにちは"
2. Press Enter or click Send
3. Verify:
   - Message appears in chat
   - Timestamp is displayed
   - Username is displayed

#### 3. Test Multiple Users

1. Open second browser/tab
2. Enter name: "ユーザー2"
3. Join chat room
4. Verify in first tab:
   - "ユーザー2さんが参加しました" appears
   - User list shows both users
5. Send message from second tab
6. Verify message appears in first tab

#### 4. Test Disconnection

1. Close second browser/tab
2. Verify in first tab:
   - "ユーザー2さんが退出しました" appears
   - User list updates (removes ユーザー2)

#### 5. Test Message History

1. Close and reopen browser
2. Enter name: "ユーザー1"
3. Join chat room
4. Verify:
   - Previous messages are displayed (up to 100)
   - Messages are in chronological order

### Automated Testing

```bash
# Run all tests
npm run test:all

# Expected output: All tests pass
```

## Troubleshooting

### Issue: Cannot connect to WebSocket

**Symptoms**:
- Frontend shows "接続中..." indefinitely
- Console error: "WebSocket connection failed"

**Solutions**:
```bash
# Check backend is running
docker-compose ps

# Check backend logs for errors
docker-compose logs backend

# Verify WebSocket endpoint
curl http://localhost:3001/health

# Restart backend
docker-compose restart backend
```

### Issue: Database connection error

**Symptoms**:
- Backend logs show "Can't reach database server"
- Prisma errors in console

**Solutions**:
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Verify connection string
echo $DATABASE_URL  # Should be: postgresql://postgres:postgres@db:5432/chatdb

# Reset database
cd backend && npx prisma migrate reset
```

### Issue: Port already in use

**Symptoms**:
- `docker-compose up` fails with "port already allocated"

**Solutions**:
```bash
# Find process using port 3000 (frontend)
lsof -i :3000

# Find process using port 3001 (backend)
lsof -i :3001

# Find process using port 5432 (database)
lsof -i :5432

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Issue: TypeScript errors

**Symptoms**:
- Build fails with type errors
- IDE shows red squiggles

**Solutions**:
```bash
# Regenerate Prisma Client
cd backend && npx prisma generate

# Clear TypeScript cache
cd backend && rm -rf node_modules/.cache
cd frontend && rm -rf .next

# Reinstall dependencies
npm install
```

### Issue: Hot reload not working

**Symptoms**:
- Code changes don't reflect in browser
- Must manually refresh

**Solutions**:
```bash
# Restart services
docker-compose restart

# Check Docker volume mounts in docker-compose.yml
# Ensure source code is mounted

# For macOS: Check Docker Desktop file sharing settings
```

## Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Frontend (Next.js)                   │  │
│  │  - React Components                               │  │
│  │  - WebSocket Client                               │  │
│  │  - State Management                               │  │
│  └───────────────────┬───────────────────────────────┘  │
└────────────────────────┼───────────────────────────────┘
                         │ WS: ws://localhost:3001/ws
                         │ HTTP: http://localhost:3001
                         ▼
       ┌─────────────────────────────────────────┐
       │      Backend (Express.js)               │
       │  ┌─────────────────────────────────┐    │
       │  │  WebSocket Server               │    │
       │  │  - Connection Management        │    │
       │  │  - Message Broadcasting         │    │
       │  └──────────────┬──────────────────┘    │
       │                 │                        │
       │  ┌──────────────▼──────────────────┐    │
       │  │  Business Logic Services        │    │
       │  │  - User Service                 │    │
       │  │  - Message Service              │    │
       │  │  - Session Service              │    │
       │  └──────────────┬──────────────────┘    │
       │                 │                        │
       │  ┌──────────────▼──────────────────┐    │
       │  │  Data Access Layer (Prisma)     │    │
       │  └──────────────┬──────────────────┘    │
       └─────────────────┼───────────────────────┘
                         │ TCP: postgresql://db:5432
                         ▼
       ┌─────────────────────────────────────────┐
       │      Database (PostgreSQL)              │
       │  - User table                           │
       │  - Message table                        │
       └─────────────────────────────────────────┘
```

### Data Flow

**Message Send Flow**:
```
1. User types message in Frontend
2. Frontend sends via WebSocket: {"type": "message", "content": "..."}
3. Backend WebSocket handler receives message
4. Message Service validates and saves to database via Prisma
5. Backend broadcasts message to all connected clients
6. All Frontends receive and display message
```

## Next Steps

### Development Tasks

1. **Implement Backend WebSocket Server**
   - Setup Express.js with ws library
   - Implement message handlers
   - See: `/speckit.tasks` for detailed task list

2. **Implement Frontend Chat UI**
   - Create React components
   - Setup WebSocket client
   - Implement state management

3. **Setup Database Schema**
   - Define Prisma schema
   - Create migrations
   - Setup indexes

4. **Write Tests**
   - Unit tests for services
   - Integration tests for WebSocket
   - E2E tests for user flows

### Resources

- **Specification**: [spec.md](spec.md)
- **Implementation Plan**: [plan.md](plan.md)
- **Data Model**: [data-model.md](data-model.md)
- **WebSocket Protocol**: [contracts/websocket-protocol.md](contracts/websocket-protocol.md)
- **Research**: [research.md](research.md)

### Getting Help

- Check existing issues in repository
- Review specification documents
- Consult team members
- Refer to technology documentation:
  - [Next.js Docs](https://nextjs.org/docs)
  - [Express.js Docs](https://expressjs.com/)
  - [Prisma Docs](https://www.prisma.io/docs)
  - [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## Conclusion

開発環境のセットアップが完了しました。`/speckit.tasks`コマンドで詳細な実装タスクを生成し、開発を開始してください。
