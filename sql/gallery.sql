-- Setup for listing image storage and gallery
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  image_url text not null,
  uploaded_at timestamptz default now()
);

-- Create a public storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'listing-images') THEN
    PERFORM storage.create_bucket('listing-images', public := true);
  END IF;
END $$;
