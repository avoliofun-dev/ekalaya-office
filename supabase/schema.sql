-- ==============================================================================
-- EKALAYA OFFICE - SKEMA DATABASE, TRIGGER, DAN KEBIJAKAN RLS SUPABASE
-- Tabel: public.profiles
-- Role yang tersedia: 'owner', 'member'
-- ==============================================================================

-- 1. Pastikan tabel public.profiles sesuai dengan skema aktual
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Hapus kebijakan lama jika ada agar eksekusi idempoten
drop policy if exists "Profiles can be viewed by profile owner or platform owner" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Only owner can update role" on public.profiles;
drop policy if exists "Only owner can delete profile" on public.profiles;

-- 4. KEBIJAKAN SELECT:
-- Pengguna terautentikasi dapat melihat profil mereka sendiri.
-- Pengguna dengan role 'owner' dapat melihat seluruh profil pengguna untuk manajemen kantor.
create policy "Profiles can be viewed by profile owner or platform owner"
  on public.profiles
  for select
  to authenticated
  using (
    auth.uid() = id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- 5. KEBIJAKAN INSERT:
-- Pengguna baru hanya dapat menginsert profil untuk id mereka sendiri dengan role 'member'.
-- Role 'owner' DILARANG ditetapkan secara langsung melalui client insert.
create policy "Users can insert own profile with member role"
  on public.profiles
  for insert
  to authenticated
  with check (
    auth.uid() = id
    and
    role = 'member'
  );

-- 6. KEBIJAKAN UPDATE:
-- Pengguna dapat memperbarui nama & profil mereka sendiri, TETAPI tidak boleh mengubah role mereka menjadi 'owner'.
-- Perubahan role hanya dapat dilakukan jika pengguna yang mengubah saat ini memiliki role 'owner'.
create policy "Users can update own profile without privilege escalation"
  on public.profiles
  for update
  to authenticated
  using (
    auth.uid() = id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  )
  with check (
    (
      auth.uid() = id
      and
      role = (select p.role from public.profiles p where p.id = auth.uid())
    )
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- 7. KEBIJAKAN DELETE:
-- Hanya Platform Owner yang dapat menghapus akun profil pengguna.
create policy "Only owner can delete profile"
  on public.profiles
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

-- 8. TRIGGER OTOMATIS: handle_new_user()
-- Saat akun baru mendaftar di auth.users, otomatis buat row di public.profiles.
-- PENTING: Role SELALU diatur ke 'member' untuk mencegah eskalasi hak akses lewat raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, full_name, role, created_at, updated_at)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    'member', -- Keamanan: registrasi baru selalu berstatus 'member'
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- PANDUAN PENETAPAN OWNER PERTAMA:
-- Untuk menetapkan akun sebagai Owner resmi pertama, jalankan query berikut
-- di SQL Editor Supabase setelah akun mendaftar:
--
-- UPDATE public.profiles
-- SET role = 'owner'
-- WHERE id = '<UUID_AKUN_DARI_SUPABASE_AUTH>';
-- ==============================================================================
