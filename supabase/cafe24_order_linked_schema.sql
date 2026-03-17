-- Cafe24 order-linked payment schema
-- Purpose:
-- 1. Keep the existing app as the main product UI
-- 2. Use Cafe24 as the payment/order channel
-- 3. Let Supabase remain the source of truth for charge state and point credit

begin;

create extension if not exists pgcrypto;

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Internal charge lifecycle
create table if not exists public.charge_requests (
  id uuid primary key default gen_random_uuid(),
  internal_order_id text not null unique,
  user_kakao_id text not null,
  user_id text null,
  amount_krw integer not null check (amount_krw > 0),
  points integer not null check (points > 0),
  product_code text not null,
  product_name text not null,
  status text not null check (
    status in (
      'pending',
      'checkout_started',
      'payment_detected',
      'paid',
      'credited',
      'failed',
      'cancelled',
      'expired',
      'refunded'
    )
  ),
  cafe24_order_id text unique,
  cafe24_order_status text null,
  cafe24_payment_status text null,
  checkout_url text null,
  verification_attempts integer not null default 0 check (verification_attempts >= 0),
  last_verified_at timestamptz null,
  payment_confirmed_at timestamptz null,
  credited_at timestamptz null,
  failed_reason text null,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_charge_requests_user_kakao_id
  on public.charge_requests (user_kakao_id);

create index if not exists idx_charge_requests_status
  on public.charge_requests (status);

create index if not exists idx_charge_requests_expires_at
  on public.charge_requests (expires_at);

create index if not exists idx_charge_requests_created_at
  on public.charge_requests (created_at desc);

drop trigger if exists trg_charge_requests_updated_at on public.charge_requests;
create trigger trg_charge_requests_updated_at
before update on public.charge_requests
for each row
execute function public.set_updated_at();

comment on table public.charge_requests is
'One row per app charge attempt. Backend-owned lifecycle for Cafe24-linked payment flows.';

-- Immutable raw payment/callback/polling events
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  source text not null check (
    source in (
      'cafe24_callback',
      'cafe24_webhook',
      'cafe24_redirect',
      'cafe24_polling',
      'admin_manual'
    )
  ),
  event_type text not null,
  internal_order_id text null,
  cafe24_order_id text null,
  payload jsonb not null,
  process_status text not null default 'received' check (
    process_status in ('received', 'processed', 'ignored', 'failed')
  ),
  process_message text null,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz null
);

create index if not exists idx_payment_events_internal_order_id
  on public.payment_events (internal_order_id);

create index if not exists idx_payment_events_cafe24_order_id
  on public.payment_events (cafe24_order_id);

create index if not exists idx_payment_events_source_received_at
  on public.payment_events (source, received_at desc);

comment on table public.payment_events is
'Immutable payment event log from callbacks, redirects, polling, and manual operations.';

-- Immutable point ledger. This should be the financial truth for point changes.
create table if not exists public.point_ledger (
  id uuid primary key default gen_random_uuid(),
  user_kakao_id text not null,
  entry_type text not null check (
    entry_type in (
      'charge_credit',
      'refund_debit',
      'manual_adjustment',
      'legacy_migration'
    )
  ),
  delta_points integer not null,
  internal_order_id text null,
  cafe24_order_id text null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists uq_point_ledger_charge_credit_internal_order
  on public.point_ledger (internal_order_id)
  where entry_type = 'charge_credit' and internal_order_id is not null;

create index if not exists idx_point_ledger_user_kakao_id_created_at
  on public.point_ledger (user_kakao_id, created_at desc);

create index if not exists idx_point_ledger_cafe24_order_id
  on public.point_ledger (cafe24_order_id);

comment on table public.point_ledger is
'Immutable ledger for point credits/debits. Duplicate charge credit is blocked by unique internal_order_id.';

-- Explicit mapping between internal app order and Cafe24 order
create table if not exists public.order_mappings (
  id uuid primary key default gen_random_uuid(),
  internal_order_id text not null unique,
  cafe24_order_id text null unique,
  mapping_status text not null check (
    mapping_status in (
      'pending',
      'linked',
      'conflict',
      'failed'
    )
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_order_mappings_updated_at on public.order_mappings;
create trigger trg_order_mappings_updated_at
before update on public.order_mappings
for each row
execute function public.set_updated_at();

comment on table public.order_mappings is
'Explicit 1:1 linkage layer between the internal app order and the Cafe24 order.';

-- Reconciliation and operational job history
create table if not exists public.reconciliation_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (
    job_type in (
      'pending_recheck',
      'paid_uncredited_recheck',
      'daily_reconciliation',
      'manual_reconciliation'
    )
  ),
  status text not null check (
    status in ('running', 'completed', 'failed')
  ),
  summary jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz null
);

create index if not exists idx_reconciliation_jobs_job_type_started_at
  on public.reconciliation_jobs (job_type, started_at desc);

comment on table public.reconciliation_jobs is
'Execution history for automatic and manual reconciliation jobs.';

-- Helpful read model for current point balances derived from the immutable ledger
create or replace view public.user_point_balances as
select
  user_kakao_id,
  coalesce(sum(delta_points), 0) as balance_points,
  max(created_at) as last_ledger_at
from public.point_ledger
group by user_kakao_id;

comment on view public.user_point_balances is
'Derived balance view from point_ledger. Prefer ledger as source of truth.';

-- Optional row level security hardening.
-- Service role will bypass RLS, while anon/authenticated users are blocked by default.
alter table public.charge_requests enable row level security;
alter table public.payment_events enable row level security;
alter table public.point_ledger enable row level security;
alter table public.order_mappings enable row level security;
alter table public.reconciliation_jobs enable row level security;

commit;
