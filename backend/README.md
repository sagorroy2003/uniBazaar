# Backend Setup (Express + TypeScript + Prisma)

## Prerequisites
- Node.js 18+
- MySQL database

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and set:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - optional `UNIVERSITY_EMAIL_DOMAIN` (default: `university.edu`)
3. Run migrations:
   ```bash
   npm run prisma:migrate
   ```
4. Seed default categories:
   ```bash
   npm run prisma:seed
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## API
- `GET /health` -> `{ "status": "ok" }`
- `GET /categories` -> all categories sorted by name
- `POST /auth/signup` -> create user + return JWT
- `POST /auth/login` -> return JWT for valid credentials
