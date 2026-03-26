-- ============================================
-- GURArt Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  role text default 'buyer' check (role in ('buyer', 'artist', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- ARTISTS TABLE
-- ============================================
create table public.artists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade unique,
  bio text,
  location text,
  specialty text,
  is_verified boolean default false,
  total_sales numeric default 0,
  created_at timestamp with time zone default now()
);

-- ============================================
-- ARTWORKS TABLE
-- ============================================
create table public.artworks (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid references public.artists(id) on delete cascade,
  title text not null,
  description text,
  story text,
  price numeric not null,
  category text check (category in ('painting', 'sculpture', 'photography', 'portrait', 'pattern', 'other')),
  image_url text,
  cloudinary_public_id text,
  is_available boolean default true,
  is_approved boolean default false,
  created_at timestamp with time zone default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.artworks enable row level security;

-- Profiles: users can read all, only update their own
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Artists: viewable by all, editable by owner
create policy "Artists are viewable by everyone" on public.artists
  for select using (true);

create policy "Artists can insert own record" on public.artists
  for insert with check (auth.uid() = user_id);

create policy "Artists can update own record" on public.artists
  for update using (auth.uid() = user_id);

-- Artworks: approved ones viewable by all, owner manages their own
create policy "Approved artworks are viewable by everyone" on public.artworks
  for select using (is_approved = true or artist_id in (
    select id from public.artists where user_id = auth.uid()
  ));

create policy "Artists can insert own artworks" on public.artworks
  for insert with check (artist_id in (
    select id from public.artists where user_id = auth.uid()
  ));

create policy "Artists can update own artworks" on public.artworks
  for update using (artist_id in (
    select id from public.artists where user_id = auth.uid()
  ));

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
