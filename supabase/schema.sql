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

-- Rate limiting. Vercel's serverless functions don't share process memory
-- across invocations, so an in-memory counter (fine on a persistent Node
-- host) silently resets on every cold start there. This table plus the
-- function below give the rate limiter a durable, atomically-updated counter
-- instead — see src/db/secure_db.ts's SupabaseStore.checkRateLimit.
create table if not exists public.rate_limits (
  key       text primary key,
  count     integer not null,
  reset_at  bigint not null
);

alter table public.leads          enable row level security;
alter table public.chat_logs      enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.rate_limits    enable row level security;

-- Atomically increments (or resets, if the window has elapsed) the counter
-- for `p_key` and returns whether the caller is still within `p_limit` for
-- this call. Runs as a single statement so concurrent serverless invocations
-- racing on the same key are still counted correctly.
create or replace function public.check_rate_limit(p_key text, p_limit integer, p_window_ms bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ms   bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  v_count  integer;
  v_reset  bigint;
begin
  insert into public.rate_limits (key, count, reset_at)
  values (p_key, 1, now_ms + p_window_ms)
  on conflict (key) do update
    set count = case
          when public.rate_limits.reset_at < now_ms then 1
          else public.rate_limits.count + 1
        end,
        reset_at = case
          when public.rate_limits.reset_at < now_ms then now_ms + p_window_ms
          else public.rate_limits.reset_at
        end
  returning count, reset_at into v_count, v_reset;

  return v_count <= p_limit;
end;
$$;

-- Match the "service role only" posture of the rest of this schema: the
-- browser's anon key must not be able to call this directly.
revoke execute on function public.check_rate_limit(text, integer, bigint) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, bigint) to service_role;
