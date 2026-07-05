create extension if not exists pgcrypto;

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My Wishlist',
  description text not null default 'Things I would love to receive.',
  share_token text not null unique default encode(gen_random_bytes(9), 'hex'),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_url text not null,
  store_name text not null,
  price text,
  note text,
  image_index integer not null default 0,
  reserved boolean not null default false,
  reserved_by text,
  created_at timestamptz not null default now()
);

alter table public.wishlists enable row level security;
alter table public.products enable row level security;

drop policy if exists "Owners can manage wishlists" on public.wishlists;
create policy "Owners can manage wishlists"
on public.wishlists
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Anyone can view public wishlists" on public.wishlists;
create policy "Anyone can view public wishlists"
on public.wishlists
for select
to anon, authenticated
using (is_public = true);

drop policy if exists "Owners can manage products" on public.products;
create policy "Owners can manage products"
on public.products
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Anyone can view public wishlist products" on public.products;
create policy "Anyone can view public wishlist products"
on public.products
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.wishlists
    where wishlists.id = products.wishlist_id
      and wishlists.is_public = true
  )
);

drop policy if exists "Anyone can reserve public wishlist products" on public.products;
create policy "Anyone can reserve public wishlist products"
on public.products
for update
to anon, authenticated
using (
  reserved = false
  and exists (
    select 1
    from public.wishlists
    where wishlists.id = products.wishlist_id
      and wishlists.is_public = true
  )
)
with check (
  reserved = true
  and exists (
    select 1
    from public.wishlists
    where wishlists.id = products.wishlist_id
      and wishlists.is_public = true
  )
);
