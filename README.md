# Task Management System — Track A (Full-Stack)

A full-stack Task Management app with **Node.js + TypeScript** backend and **Next.js** web frontend. Built for the Ernest Fintech Software Engineering Assessment.

## Features

- **Auth**: Register, Login, Logout with JWT (access + refresh tokens), bcrypt password hashing
- **Tasks**: Full CRUD, pagination, filter by status, search by title, toggle completion
- **UI**: Responsive dashboard, toasts for feedback, clean teal/outfit design

## Quick start

### 1. Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

API runs at **http://localhost:3001**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**. Open it and sign up to create tasks.

### Environment (optional)

- **Backend** `backend/.env`: `PORT`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`
- **Frontend** `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001`

## API summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/tasks?page&limit&status&search` | List tasks (paginated, filter, search) |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| POST | `/tasks/:id/toggle` | Toggle completed ↔ pending |

## Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, SQLite, JWT, bcrypt, express-validator
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, react-hot-toast
