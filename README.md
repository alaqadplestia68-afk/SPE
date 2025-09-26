# SPE UNIBEN Election — Next.js + Supabase (Vercel-ready)

This repository contains a Vercel-ready Next.js app using Supabase (Postgres) for persistent storage.
It includes a step-by-step ballot flow (one position per screen), admin dashboard, and utilities for generating voter credentials.

## Quick steps (minimum to run)
1. Create a Supabase project and run `sql/create_tables.sql` (or the seeded variant).
2. Push this repo to GitHub.
3. In Vercel, import the GitHub repo and set these Environment Variables (Production scope):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (server-only)
   - JWT_SECRET
   - ADMIN_ACCESS_KEY
   - ADMIN_SEED_KEY
   - DEFAULT_ADMIN_EMAIL (optional)
   - DEFAULT_ADMIN_PASSWORD (optional)
   - Optional email SMTP vars for sending credentials automatically
4. Deploy on Vercel.
5. (One-time) seed the admin user by visiting:
   `https://your-deployed-site.vercel.app/api/admin/seed-admin?key=YOUR_ADMIN_SEED_KEY`
   This will insert an admin account with DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD.
6. Login (admin) and use the Admin Dashboard to generate voter credentials or add candidates.

## Files of interest
- `sql/create_tables.sql` — schema (run in Supabase SQL editor)
- `pages/` — Next.js pages + API routes
- `lib/` — Supabase clients and email helper

IMPORTANT: Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Do not commit `.env` files with secrets.
