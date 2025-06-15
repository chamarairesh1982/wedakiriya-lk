-- SQL schema for WedaKiriya.lk
-- Creates tables for cities, categories, businesses and admin_users
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

-- Table of admin users linked to Supabase auth users
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- ensure first registered user becomes admin
insert into admin_users(user_id)
select id from auth.users limit 1
on conflict do nothing;
