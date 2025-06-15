-- SQL script to seed initial data for WedaKiriya.lk
-- Run this after executing schema.sql if you want sample entries.

-- Ensure extension for UUID generation exists
create extension if not exists pgcrypto;

-- Create tables if they don't already exist
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
  created_at timestamp with time zone default now()
);

-- Add any missing columns to businesses
alter table businesses add column if not exists city_id uuid references cities(id) on delete set null;
alter table businesses add column if not exists category_id uuid references categories(id) on delete set null;
alter table businesses add column if not exists contact text;
alter table businesses add column if not exists whatsapp text;
alter table businesses add column if not exists description text;
alter table businesses add column if not exists featured boolean default false;

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamp with time zone default now()
);

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean default false,
  created_at timestamp with time zone default now()
);

-- -------------------------------
-- Test Data Inserts
-- -------------------------------

insert into cities (name) values
  ('Colombo'),
  ('Kandy'),
  ('Galle'),
  ('Kurunegala'),
  ('Jaffna')
on conflict do nothing;

insert into categories (name, icon) values
  ('Hospital', '🏥'),
  ('Pharmacy', '💊'),
  ('Ayurveda', '🌿'),
  ('Clinic', '🏨'),
  ('Lab', '🧪')
on conflict do nothing;

insert into businesses (name, city_id, category_id, contact, whatsapp, description, featured)
values (
  'Lanka Hospitals',
  (select id from cities where name = 'Colombo' limit 1),
  (select id from categories where name = 'Hospital' limit 1),
  '+94112345678',
  '+94771234567',
  'Leading private hospital in Colombo',
  true
)
on conflict do nothing;

insert into businesses (name, city_id, category_id, contact, whatsapp, description, featured)
values (
  'Kandy Pharmacy',
  (select id from cities where name = 'Kandy' limit 1),
  (select id from categories where name = 'Pharmacy' limit 1),
  '+94812345678',
  '+94777654321',
  'Open 24/7 near Kandy Clock Tower',
  false
)
on conflict do nothing;
