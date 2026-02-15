# Static Landing Site Design

## Overview

A static HTML/CSS landing site at `apps/web/`, deployed to Netlify. Two pages: homepage and privacy policy. Dark/moody aesthetic matching the studio recording vibe.

## Structure

```
apps/web/
  index.html
  privacy.html
  css/style.css
  assets/
    logo.png          (from repo root assets/)
    favicon.png       (from repo root assets/)
  netlify.toml
  package.json        (minimal, for workspace compatibility)
```

## Pages

### Homepage (`index.html`)

- Dark background (#0a0a0a)
- Session Sync logo centered vertically and horizontally
- Tagline below logo: "Keep your band's recording sessions in sync."
- Subtle muted footer with link to privacy policy
- Responsive — logo scales on mobile

### Privacy Policy (`privacy.html`)

- Same dark background and styling
- "Privacy Policy" heading
- Lorem ipsum placeholder text
- Link back to homepage

## Visual Style

- Dark/moody: near-black background, light text (~#e0e0e0)
- System font stack (no external dependencies)
- Footer text: small, muted gray, ~14px
- Generous whitespace, minimal padding

## Favicon

- Use existing `assets/favicon.png` (waveform icon)
- Reference as PNG in `<link>` tags (modern browsers support it)
- Include apple-touch-icon reference

## Netlify Config

- `publish = "apps/web"` (no build command)
- Clean URLs enabled (`/privacy` works without `.html`)

## Approach

Pure HTML/CSS, no build step, no dependencies. Netlify serves files as-is.
