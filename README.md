# Simple Chat

リアルタイムチャットルームアプリケーション

## About

WebSocketを使用したリアルタイムチャットルームです。ユーザーはアカウント登録なしで名前を入力するだけでチャットに参加できます。

## Features

- リアルタイムメッセージング
- メッセージ履歴表示（最新100件）
- オンラインユーザーリスト
- システムメッセージ（参加・退出通知）
- 自動再接続

## Tech Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- WebSocket API

### Backend
- Node.js 20
- Express.js
- WebSocket (ws library)
- Prisma ORM
- PostgreSQL

### Infrastructure
- Docker & Docker Compose
- mise (toolchain management)

## Prerequisites

- mise v2024.1.0+
- Docker v20.10+
- Docker Compose v2.0+

## Quick Start

### 1. Install mise

```bash
# macOS
brew install mise

# Linux
curl https://mise.jdx.dev/install.sh | sh
```

### 2. Install toolchain

```bash
mise install
```

### 3. Start services

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Setup database

```bash
# Run migrations
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
```

### 5. Access the application

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health

## Development

### Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
pnpm install
```

### Run locally (without Docker)

```bash
# Terminal 1: Database
docker-compose up db

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
pnpm dev
```

### Database management

```bash
# Prisma Studio (GUI)
cd backend
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

## Project Structure

```
.
├── backend/              # Express.js + WebSocket server
│   ├── src/
│   │   ├── services/     # Business logic
│   │   ├── websocket/    # WebSocket handlers
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Utilities
│   └── prisma/           # Database schema & migrations
├── frontend/             # Next.js application
│   ├── app/              # Next.js App Router
│   └── src/
│       ├── components/   # React components
│       ├── hooks/        # Custom React hooks
│       ├── services/     # WebSocket client
│       └── utils/        # Utilities
├── shared/               # Shared TypeScript types
│   └── types/
└── docker-compose.yml
```

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/chatdb
WS_PORT=3001
NODE_ENV=development
SESSION_TIMEOUT=1800000
```

### Frontend (.env)

```
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Testing

### Backend Tests

バックエンドには110以上のテストケースがあり、単体テスト、データベース統合テスト、WebSocket統合テストが含まれます。

```bash
cd backend

# すべてのテストを実行
pnpm test

# 単体テストのみ実行
pnpm test tests/unit

# 統合テストのみ実行
pnpm test:integration

# カバレッジレポート付きで実行
pnpm test:coverage

# Watch モード（開発時）
pnpm test:watch
```

#### テスト前提条件

統合テストを実行する前に、テスト用データベースを起動する必要があります。

```bash
# テスト用データベースを起動
docker compose up -d db-test

# マイグレーションを実行
cd backend
DATABASE_URL="postgresql://testuser:testpass@localhost:5433/simple_chat_test" pnpm prisma migrate deploy
```

#### テスト構成

- **単体テスト** (`tests/unit/models/`): データモデルのバリデーションとビジネスロジック
- **データベース統合テスト** (`tests/integration/database/`): CRUD操作とトランザクション
- **WebSocket統合テスト** (`tests/integration/websocket/`): リアルタイム通信とブロードキャスト

#### テスト結果

```
Test Suites: 7 passed, 7 total
Tests:       108 passed, 110 total
Time:        ~6秒
Success Rate: 98%
```

詳細なテスト手順は [specs/002-unit-integration-tests/quickstart.md](specs/002-unit-integration-tests/quickstart.md) を参照してください。

### Frontend Tests

```bash
cd frontend
pnpm test
```

## Deployment

See [specs/001-chat-room/quickstart.md](specs/001-chat-room/quickstart.md) for detailed deployment instructions.

## Documentation

- [Feature Specification](specs/001-chat-room/spec.md)
- [Implementation Plan](specs/001-chat-room/plan.md)
- [Data Model](specs/001-chat-room/data-model.md)
- [WebSocket Protocol](specs/001-chat-room/contracts/websocket-protocol.md)
- [Quick Start Guide](specs/001-chat-room/quickstart.md)

## License

MIT
