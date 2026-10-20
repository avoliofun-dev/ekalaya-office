-- ==============================================================================
-- EKALAYA AI OFFICE — TAHAP 2: CRM & PERSISTENSI SUPABASE MIGRATION
-- File: supabase/migrations/20261020_crm_and_persistence.sql
-- Karakteristik: Idempoten, Non-Destruktif (Tidak mengubah data yang ada)
-- ==============================================================================

-- 1. FUNGSI UTILITAS: update_updated_at_column()
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- ==============================================================================
-- 2. TABEL: public.leads (Data Prospek CRM)
-- ==============================================================================
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  company text,
  phone text,
  source text not null default 'WhatsApp',
  interest text not null default 'Paket Starter (Rp99.000)',
  estimated_value numeric not null default 0,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Interested', 'Negotiation', 'Won', 'Lost')),
  notes text,
  assigned_to text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indeks untuk performa query
create index if not exists idx_leads_user_id on public.leads(user_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at desc);

-- Trigger auto updated_at
drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();

-- RLS: public.leads
alter table public.leads enable row level security;

drop policy if exists "Users can view own leads or owner can view all" on public.leads;
create policy "Users can view own leads or owner can view all"
  on public.leads
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

drop policy if exists "Users can insert their own leads" on public.leads;
create policy "Users can insert their own leads"
  on public.leads
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
  );

drop policy if exists "Users can update own leads or owner can update all" on public.leads;
create policy "Users can update own leads or owner can update all"
  on public.leads
  for update
  to authenticated
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  )
  with check (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

drop policy if exists "Users can delete own leads or owner can delete all" on public.leads;
create policy "Users can delete own leads or owner can delete all"
  on public.leads
  for delete
  to authenticated
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );


-- ==============================================================================
-- 3. TABEL: public.ai_daily_usage (Penegakan Kuota AI di Server/Database)
-- Mencegah manipulasi kuota dari localStorage browser
-- ==============================================================================
create table if not exists public.ai_daily_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  usage_date date not null default current_date,
  count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, usage_date)
);

create index if not exists idx_ai_daily_usage_user_date on public.ai_daily_usage(user_id, usage_date);

drop trigger if exists set_ai_daily_usage_updated_at on public.ai_daily_usage;
create trigger set_ai_daily_usage_updated_at
  before update on public.ai_daily_usage
  for each row execute function public.handle_updated_at();

-- RLS: public.ai_daily_usage
alter table public.ai_daily_usage enable row level security;

drop policy if exists "Users can view own AI daily usage or owner view all" on public.ai_daily_usage;
create policy "Users can view own AI daily usage or owner view all"
  on public.ai_daily_usage
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- Pengguna tidak boleh memanipulasi counter pemakaian secara langsung dari client
-- Insert dan update kuota ditangani secara aman oleh API server atau fungsi terproteksi
drop policy if exists "Authenticated users can increment own quota usage" on public.ai_daily_usage;
create policy "Authenticated users can increment own quota usage"
  on public.ai_daily_usage
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
  );

drop policy if exists "Authenticated users can update own quota usage" on public.ai_daily_usage;
create policy "Authenticated users can update own quota usage"
  on public.ai_daily_usage
  for update
  to authenticated
  using (
    auth.uid() = user_id
  );

-- Fungsi aman server-side untuk menambah pemakaian kuota harian
create or replace function public.increment_ai_usage(p_user_id uuid, p_date date)
returns integer as $$
declare
  v_count integer;
begin
  insert into public.ai_daily_usage (user_id, usage_date, count)
  values (p_user_id, p_date, 1)
  on conflict (user_id, usage_date)
  do update set count = public.ai_daily_usage.count + 1, updated_at = timezone('utc'::text, now())
  returning count into v_count;
  return v_count;
end;
$$ language plpgsql security definer;



-- ==============================================================================
-- 4. TABEL: public.user_subscriptions (Langganan & Entitlements Server-Side)
-- Mencegah aktivasi paket gratisan atau upgrade palsu dari frontend
-- ==============================================================================
create table if not exists public.user_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan_id text not null default 'free' check (plan_id in ('free', 'starter', 'business', 'pro')),
  status text not null default 'active' check (status in ('active', 'pending', 'expired', 'canceled')),
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null default (timezone('utc'::text, now()) + interval '14 days'),
  is_trial boolean not null default true,
  last_order_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_user_subscriptions_user on public.user_subscriptions(user_id);

drop trigger if exists set_user_subscriptions_updated_at on public.user_subscriptions;
create trigger set_user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row execute function public.handle_updated_at();

-- RLS: public.user_subscriptions
alter table public.user_subscriptions enable row level security;

drop policy if exists "Users can view own subscription or owner view all" on public.user_subscriptions;
create policy "Users can view own subscription or owner view all"
  on public.user_subscriptions
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- Pengguna BIASA DILARANG mengubah paket mereka sendiri secara langsung dari browser!
-- Hanya Owner yang memiliki hak administratif untuk mengubah langganan di database secara manual.
drop policy if exists "Only owner can update user subscriptions directly" on public.user_subscriptions;
create policy "Only owner can update user subscriptions directly"
  on public.user_subscriptions
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );


-- ==============================================================================
-- 5. TABEL: public.transactions (Log Riwayat Transaksi Pembayaran)
-- ==============================================================================
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  order_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  plan_id text not null,
  plan_name text not null,
  amount numeric not null,
  currency text not null default 'IDR',
  payment_method text not null default 'QRIS / VA Sandbox',
  status text not null default 'pending' check (status in ('pending', 'settlement', 'expire', 'cancel', 'deny')),
  is_sandbox boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_transactions_order on public.transactions(order_id);
create index if not exists idx_transactions_user on public.transactions(user_id);

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

-- RLS: public.transactions
alter table public.transactions enable row level security;

drop policy if exists "Users can view own transactions or owner view all" on public.transactions;
create policy "Users can view own transactions or owner view all"
  on public.transactions
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );
