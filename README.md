# ePOS SaaS

Production-ready Next.js 15 infrastructure for an electronic point-of-sale SaaS platform.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (`@supabase/ssr`)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Add your Supabase project URL and anon key from the [Supabase dashboard](https://supabase.com/dashboard).

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  (auth)/login, signup     # Public auth routes
  (dashboard)/retailer, wholesaler, admin
components/
  ui/                      # Button, Input, Spinner
  auth/                    # Login & signup forms
  dashboard/               # Shell & placeholders
lib/
  supabase/                # Browser, server, middleware clients
  auth/routes.ts           # Role & route constants
  utils/cn.ts
types/
hooks/
middleware.ts              # Session refresh + role-based routing
```

## Auth & roles

- Users store `role` in `user_metadata` (`retailer` | `wholesaler` | `admin`).
- Middleware refreshes the Supabase session and enforces:
  - Redirect authenticated users away from `/login` and `/signup`
  - Block unauthenticated access to dashboard routes
  - Restrict dashboards by role

## Supabase types

Generate types from your existing project:

```bash
npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
```

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | ESLint                   |
| `npm run typecheck` | TypeScript check    |
