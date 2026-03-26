
-- ORDERS TABLE
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid references public.profiles(id) on delete cascade,
  artwork_id uuid references public.artworks(id) on delete cascade,
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  delivery_name text,
  delivery_address text,
  delivery_phone text,
  payment_method text,
  created_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

-- Buyers can see their own orders
create policy "Buyers can view own orders" on public.orders
  for select using (auth.uid() = buyer_id);

-- Buyers can insert their own orders
create policy "Buyers can create orders" on public.orders
  for insert with check (auth.uid() = buyer_id);

-- Buyers can update their own orders
create policy "Buyers can update own orders" on public.orders
  for update using (auth.uid() = buyer_id);

-- Admins can see all orders
create policy "Admins can view all orders" on public.orders
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


update public.profiles
set role = 'admin'
where email = 'emmaikirezi@gmail.com';
