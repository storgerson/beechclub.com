# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing/info website for Beechclub, a member-owned flying club at
Georgetown Airport (KGTU) flying two turbo-normalized Beechcraft Bonanzas
(N33TN and N17826). Plain HTML/CSS/JS — no build step, no package manager,
no framework, no dependencies.

## Working locally

No build/lint/test tooling exists in this repo. To preview:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

Opening the HTML files directly in a browser also works, except the
weather panel (fetches `api.weather.gov`, fine over `file://`) and the
contact form's local-preview branch, which specifically checks
`window.location.protocol === "file:"` (see script.js).

## Structure

Every page is a hand-written, self-contained HTML file sharing one
stylesheet and one script:

```
index.html / about.html / fleet.html / membership.html / events.html
  / documents.html / contact.html   Pages (each repeats the same header
                                     nav and footer markup — no templating)
styles.css                          Shared stylesheet (CSS custom properties
                                     for the navy/gold/sky palette, BEM-ish
                                     class names: .card, .plane-card, .btn
                                     .btn-primary, .section--alt, etc.)
script.js                           Shared behavior: mobile nav toggle,
                                     active-nav-link highlighting, contact
                                     form local-preview handling, and the
                                     live METAR/weather widget
assets/photos/                      Local fleet photos
assets/favicon.svg
CNAME                               Custom domain for GitHub Pages
                                     (beechclub.org)
```

Since there's no templating system, changes to shared chrome (nav, footer,
`<head>` boilerplate) must be hand-edited across every HTML file
individually — check all seven pages when changing header/footer markup.

## The weather widget (script.js)

`index.html`'s `#metar-grid` is populated client-side by
`loadWeather()` in script.js, which fetches current conditions from the
National Weather Service's public API (`api.weather.gov`, no API key) for
a fixed list of stations (KGTU + nearby airports). It decodes visibility,
ceiling, temp, wind, and altimeter from the structured JSON response (NWS
doesn't reliably populate a raw METAR string) and derives a flight category
(VFR/MVFR/IFR/LIFR) locally in `flightCategory()`. Each card links out to
aviationweather.gov for the official raw METAR/TAF — this widget is
explicitly not a substitute for a real briefing. If a station's fetch
fails it degrades gracefully to a per-card "unavailable" message; if every
station fails, the whole grid falls back to a single link-out message.

## Contact form

`contact.html`'s form posts to Formspree (`action="https://formspree.io/f/..."`).
Note: script.js's comments and README.md both describe the form as a
Netlify Forms integration (`data-netlify="true"` in the comment), but the
actual markup uses a Formspree action URL — treat the Formspree action in
contact.html as the source of truth if the two disagree, and reconcile the
stale comments if you touch this form.

## Placeholder content

Several pages still contain bracketed placeholders (e.g. `[add engine &amp;
TN system details]` in fleet.html, `[add amount]` in membership.html,
`info@beechclub.example` in footers) awaiting real club data — see
README.md's "Things to customize before going live" section. Don't treat
these as bugs to silently invent values for; ask for real figures or leave
the placeholder intact unless the user supplies the real data.

## Deployment

GitHub Pages, deployed from the `main` branch root, custom domain
`beechclub.org` via the `CNAME` file. See README.md for full DNS/GoDaddy
setup notes.
