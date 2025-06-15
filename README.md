# WedaKiriya.lk

A simple static directory to showcase local services in Sri Lanka. Built with Vanilla HTML, CSS and JS. This repository is ready to be hosted on GitHub Pages.

You can view the live site at [https://chamarairesh1982.github.io/wedakiriya-lk/](https://chamarairesh1982.github.io/wedakiriya-lk/).

## Structure
- `index.html` – main page listing sample services
- `css/styles.css` – custom styling
- `images/` – contains local SVG icons for the hero section and service cards
- `data/services.js` – small JS array of service listings used by the homepage
- `dashboard.html` – user dashboard showing favourites

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
5. Sign up at least one user using `admin.html`. The SQL script adds the first registered user to the `admin_users` table so they can access the admin panel. Additional admins can be inserted into this table manually. If you receive a `404` response from `/rest/v1/admin_users`, verify this table exists in your project.

## Deploying to GitHub Pages
1. Push the repository to your GitHub account.
2. Enable **GitHub Pages** for the `main` branch.
3. The site will be available at `https://<username>.github.io/wedakiriya-lk/`.

## Using the Admin Panel
1. Open `admin.html` in the browser.
2. Enter the admin password (`wedakiriya` by default).
3. Use the buttons to import Sri Lankan cities and default categories.
4. The imported lists are displayed below each button.

## New Features
- User registration and login via `login.html` using Supabase Auth.
- Users can favourite listings on the homepage. Favourites are stored in the `favorites` table.
- Listings can be reported from the details page which inserts a row into the `reports` table.
- Additional SQL script `sql/extended_schema.sql` creates tables for listings, images, favourites and reports.

- Sinhala/English language switcher with localStorage and URL parameter persistence.
=======
- Listings now support comments. Users can post comments on a listing and report inappropriate ones, stored in `comments` and `comment_reports` tables.
=======
- `dashboard.html` shows a simple user dashboard where logged in users can view and remove their favourites and logout.
- `admin-dashboard.html` offers analytics charts and a moderation table for reported listings. It requires an admin account from the `admin_users` table. The updated `sql/extended_schema.sql` script adds `category` and `is_active` columns to `listings` and a `status` column to `reports` for this dashboard.

