# Beechclub Flying Club — Website

A static website for Beechclub, a member-owned flying club based at Georgetown
Airport (KGTU) flying two turbo-normalized Beechcraft Bonanzas (N33TN and
N17826).

## Structure

Plain HTML/CSS/JS, no build step required.

```
index.html        Home
about.html         About the club
fleet.html         Aircraft specs, rates, and photo gallery
membership.html    Dues, joining process, FAQ
events.html        Upcoming events
contact.html       Contact form and club info
styles.css         Shared stylesheet
script.js          Mobile nav + contact form behavior
assets/            Favicon and other static assets
CNAME              Custom domain for GitHub Pages (beechclub.org)
```

## Preview locally

Just open `index.html` in a browser, or serve the folder so relative paths
and the contact form behave the same way they will in production:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Things to customize before going live

- Replace placeholder text in `[]` brackets across `fleet.html` and
  `membership.html` (exact aircraft specs, initiation fee, etc.).
- Replace the placeholder email/phone in the footer and `contact.html`.
- Fleet photos are currently hotlinked from the club's Flickr album
  (https://www.flickr.com/photos/spear_of_thor/albums/72157673426952727).
  For a production site, download the originals and host them locally in
  `assets/photos/` instead of relying on Flickr staying up — swap the
  `<img src>` values accordingly.
- The contact form needs a form backend since GitHub Pages only serves
  static files. Sign up for a free plan at https://formspree.io (or a
  similar service) and replace the `action` URL in `contact.html`.
- Add real club officer names in `about.html`.

## Deploying with GitHub Pages

1. Push this folder's contents to the `main` branch of the GitHub repo.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch",
   branch `main`, folder `/ (root)`.
4. Under **Custom domain**, enter `beechclub.org` and save (this matches the
   included `CNAME` file). Check **Enforce HTTPS** once the certificate is
   issued (can take a few minutes to a few hours).

## Pointing beechclub.org (GoDaddy) at GitHub Pages

In GoDaddy's DNS management for beechclub.org, add:

- Four **A** records for the apex domain (`@`) pointing to GitHub Pages' IPs:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- One **CNAME** record for `www` pointing to `storgerson.github.io`.

Remove any existing GoDaddy "parked domain" A/CNAME records first. DNS
changes can take anywhere from a few minutes to 24-48 hours to propagate.
