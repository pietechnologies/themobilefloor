# The Mobile Floor — Landing Page

A conversion-focused landing page for [themobilefloor.com](https://www.themobilefloor.com),
built as static HTML/CSS/JS and ready to host on **GitHub Pages**.

## Features

- 🎯 **Auto popup lead form** — opens automatically **5.5 seconds** after page load
  (inside the requested 5–7 second window). Suppressed for 7 days after a successful
  submission so returning visitors aren't nagged.
- 💼 **Sales-focused layout** — announcement bar, hero with dual CTAs, trust strip,
  mobile-showroom differentiator, 10 service cards, why-us, 4-step process, gallery,
  service-area band, FAQ and a full contact form.
- 📱 **Fully responsive** with a sticky mobile call/estimate bar.
- ⚡ **Zero dependencies** — no build step, no frameworks. Just open `index.html`.

## Run locally

```bash
# any static server works, e.g.:
python3 -m http.server 8080
# → http://localhost:8080
```

## Deploy on GitHub Pages

1. Push this repository (files are at the repo **root**).
2. GitHub → **Settings → Pages → Build and deployment**
3. Source: **Deploy from a branch**
4. Branch: `main` (or your working branch), folder: **`/ (root)`** → **Save**.
5. Your site goes live at `https://<owner>.github.io/themobilefloor/`.

> `.nojekyll` is included so GitHub skips Jekyll processing.

## How the lead form delivers

The form posts to [FormSubmit](https://formsubmit.co) (`FORM_ENDPOINT` in
`assets/js/main.js`) — no account required and it works on static hosting.

**One-time activation:** the very first submission sends an activation email to
`joseph@themobilefloor.com` — click the link inside and all future submissions
arrive straight to that inbox.

If the network call fails, the form gracefully falls back to opening the visitor's
mail app with everything pre-filled, so no lead is ever lost.

To switch providers, edit this constant in `assets/js/main.js`:

```js
var FORM_ENDPOINT = "https://formsubmit.co/ajax/joseph@themobilefloor.com";
```

## Customization

| What | Where |
|---|---|
| Popup delay (ms) | `POPUP_DELAY_MS` in `assets/js/main.js` (default `5500`) |
| Popup suppression after submit | `SUPPRESS_DAYS` (default `7`) |
| Brand colors / fonts | `:root` variables in `assets/css/styles.css` |
| Images | `assets/img/` |
| Copy / sections | `index.html` |
| Phone, email, address | `index.html` + `assets/js/main.js` (`FALLBACK_EMAIL`) |

## Structure

```
.
├── index.html            # single-page landing page
├── .nojekyll             # disable Jekyll on GitHub Pages
├── assets/
│   ├── css/styles.css    # all styles (design tokens in :root)
│   ├── js/main.js        # popup, forms, nav, scroll reveals
│   └── img/              # optimized imagery
└── README.md
```
