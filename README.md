# Peer-to-Peer Evaluator

A web application for peer evaluation within student groups. Students evaluate their group members, professors view results, and administrators manage courses, groups, and professor access.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** (PostgreSQL) + **Prisma ORM**
- **NextAuth.js** (Google OAuth)
- **shadcn/ui** + **Tailwind CSS**
- **xlsx (SheetJS)** for CSV/Excel import

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings → Database → Connection string**
3. Copy the **Transaction (port 6543)** URI → this is your `DATABASE_URL`
4. Copy the **Session (port 5432)** URI → this is your `DIRECT_URL`
5. Replace `[YOUR-PASSWORD]` in both with your database password

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

- **DATABASE_URL**: Supabase pooled connection string (port 6543, with `?pgbouncer=true`)
- **DIRECT_URL**: Supabase direct connection string (port 5432) — used by Prisma for migrations
- **GOOGLE_CLIENT_ID** / **GOOGLE_CLIENT_SECRET**: From [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — create an OAuth 2.0 Client ID, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **ADMIN_EMAIL**: The Google email that will have admin access

### 4. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Roles

| Role | How assigned | What they can do |
|------|-------------|------------------|
| **Admin** | Email matches `ADMIN_EMAIL` env var | Manage professors, courses, import data |
| **Professor** | Email pre-approved by admin | View courses, groups, evaluation results |
| **Student** | Everyone else | See group, evaluate peers |

## Data Import

The admin can import data via CSV/Excel files:

1. **Groups file** — columns: `Group Code`, `Title` (+ any others, which are ignored)
2. **Students file** — columns: `Group Code`, `User Name` (email), `First Name`, `Last Name`

Import groups first, then students. Re-importing is safe (upserts).

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes (auth, courses, groups, evaluations, import)
│   ├── auth/         # Sign-in page
│   └── dashboard/    # Role-based dashboards (admin, professor, student)
├── components/       # Shared UI components
├── lib/              # Auth, Prisma, validators, Excel parser
├── hooks/            # React hooks
└── types/            # TypeScript type augmentations
```
