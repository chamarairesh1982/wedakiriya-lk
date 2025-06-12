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
