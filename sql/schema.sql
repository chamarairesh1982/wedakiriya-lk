-- SQL schema for WedaKiriya.lk
-- Creates tables for cities, categories, businesses, offers and users (admin)
-- Run this script in the Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city_id uuid references cities(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  contact text,
  whatsapp text,
  description text,
  featured boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamp with time zone default now()
);

-- references auth.users to mark admins
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean default false,
  created_at timestamp with time zone default now()
);

-- mark the first signed up user as admin
insert into users(id, is_admin)
select id, true from auth.users limit 1
on conflict do nothing;
