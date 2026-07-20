-- Shadow Root — Supabase schema for serverless (Vercel) persistence.
--
-- Run this once in the Supabase SQL editor (or `supabase db` CLI) for the
-- project referenced by SUPABASE_URL. The server writes with the service-role
-- key, so Row Level Security is left enabled with NO public policies: only the
-- service role (never the browser anon key) can read or write these tables.

create table if not exists public.leads (
  id          text primary key,
  name        text not null,
  company     text,
  email       text not null,
  phone       text,
  service     text,
  message     text,
  status      text not null default 'pending',
  created_at  bigint not null
);

create table if not exists public.chat_logs (
  id                text primary key,
  visitor_name      text,
  visitor_contact   text,
  messages          jsonb not null default '[]'::jsonb,
  is_escalated      boolean not null default false,
  escalation_reason text,
  status            text not null default 'pending',
  created_at        bigint not null,
  updated_at        bigint not null
);

create table if not exists public.knowledge_base (
  id        text primary key,
  title     text not null,
  category  text not null,
  content   text not null,
  keywords  jsonb not null default '[]'::jsonb
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists chat_logs_updated_at_idx on public.chat_logs (updated_at desc);

-- RLS on, no policies => only the service-role key (used server-side) has access.
alter table public.leads          enable row level security;
alter table public.chat_logs      enable row level security;
alter table public.knowledge_base enable row level security;
