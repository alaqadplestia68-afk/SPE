-- create_tables.sql
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text,
  role text not null default 'voter' check (role in ('voter','admin')),
  has_voted boolean default false,
  created_at timestamptz default now()
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  position text not null,
  name text not null,
  photo_url text,
  created_at timestamptz default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid references users(id) on delete cascade,
  candidate_id uuid references candidates(id) on delete cascade,
  created_at timestamptz default now(),
  unique(voter_id, candidate_id)
);
