# WedaKiriya.lk

A simple static directory to showcase local services in Sri Lanka. Built with HTML, CSS and [Bootstrap 5](https://getbootstrap.com/). This repository is ready to be hosted on GitHub Pages.

You can view the live site at [https://chamarairesh1982.github.io/wedakiriya-lk/](https://chamarairesh1982.github.io/wedakiriya-lk/).

## Structure
- `index.html` – main page listing sample services
- `css/style.css` – custom styling
- `images/` – contains local SVG icons for the hero section and service cards
- `data/services.js` – small JS array of service listings used by the homepage

To preview locally, simply open `index.html` in a browser. No build step or server is required.

The repository now ships with small SVG icons, so it works offline without external image URLs.

## Deploying `submit.html` on GitHub Pages
1. Push this repository to your own GitHub account.
2. In the repository settings, enable **GitHub Pages** and select the `main` branch as the source.
3. After a few minutes your site will be available at `https://<username>.github.io/wedakiriya-lk/submit.html`.

## Connecting to Supabase
1. Create a table called `businesses` in your Supabase project with columns that match the fields in `submit.html` (e.g. `name`, `owner`, `category`, `contact`, `city`, `description`).
2. Create a `config.json` file next to `submit.html` containing your Supabase URL and anon key:
   ```json
   {
     "SUPABASE_URL": "https://your-project.supabase.co",
     "SUPABASE_ANON_KEY": "your_anon_key_here"
   }
   ```
3. `submit.html` loads this file with `fetch('config.json')` to initialize the form submission request.

## Supabase Setup
1. Create a new [Supabase](https://supabase.com/) project.
2. Open the **SQL Editor** and run the commands in [`sql/schema.sql`](sql/schema.sql) to create the required tables.
3. From the project **Settings → API** page copy the `anon` key and project URL.
4. Create a `config.json` file in the repository root with these values:
   ```json
   {
     "SUPABASE_URL": "https://your-project.supabase.co",
     "SUPABASE_ANON_KEY": "your-anon-key"
   }
   ```
5. Sign up at least one user using `admin.html` and mark that user as an admin by ensuring the `is_admin` column in the `users` table is `true`.

## Deploying to GitHub Pages
1. Push the repository to your GitHub account.
2. Enable **GitHub Pages** for the `main` branch.
3. The site will be available at `https://<username>.github.io/wedakiriya-lk/`.

## Using the Admin Panel
1. Navigate to `admin.html` on your deployed site.
2. Log in with an admin account. Only users flagged as admins in the `users` table can access the panel.
3. From the panel you can manage offers, cities, categories and business listings. Changes are reflected instantly via Supabase.
