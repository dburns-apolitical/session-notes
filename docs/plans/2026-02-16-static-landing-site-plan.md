# Static Landing Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a static HTML/CSS landing site at `apps/web/` with a homepage and privacy policy page, deployed to Netlify.

**Architecture:** Pure HTML/CSS, no build step. Two HTML files share one CSS stylesheet. Netlify serves files directly from the `apps/web/` directory.

**Tech Stack:** HTML, CSS, Netlify

---

### Task 1: Scaffold `apps/web/` directory and package.json

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/css/` (directory)
- Create: `apps/web/assets/` (directory)

**Step 1: Create directory structure**

```bash
mkdir -p apps/web/css apps/web/assets
```

**Step 2: Create minimal package.json**

Create `apps/web/package.json`:

```json
{
  "name": "web",
  "version": "0.0.1",
  "private": true
}
```

**Step 3: Copy assets from repo root**

```bash
cp assets/logo.png apps/web/assets/logo.png
cp assets/favicon.png apps/web/assets/favicon.png
```

**Step 4: Commit**

```bash
git add apps/web/package.json apps/web/assets/
git commit -m "chore: scaffold apps/web with assets"
```

---

### Task 2: Create shared stylesheet

**Files:**
- Create: `apps/web/css/style.css`

**Step 1: Write the stylesheet**

Create `apps/web/css/style.css` with:

```css
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  background-color: #0a0a0a;
  color: #e0e0e0;
  line-height: 1.6;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

a {
  color: #999;
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: #e0e0e0;
}

/* Homepage layout */
.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero__logo {
  max-width: 420px;
  width: 100%;
  height: auto;
}

.hero__tagline {
  margin-top: 1.5rem;
  font-size: 1.125rem;
  color: #999;
  text-align: center;
}

/* Footer */
.footer {
  padding: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: #555;
}

/* Privacy policy page */
.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 3rem 2rem;
  flex: 1;
}

.page h1 {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.page p {
  margin-bottom: 1rem;
  color: #bbb;
}

.page__back {
  display: inline-block;
  margin-bottom: 2rem;
  font-size: 0.875rem;
}
```

**Step 2: Commit**

```bash
git add apps/web/css/style.css
git commit -m "feat: add shared stylesheet for landing site"
```

---

### Task 3: Create homepage

**Files:**
- Create: `apps/web/index.html`

**Step 1: Write index.html**

Create `apps/web/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Session Sync</title>
  <meta name="description" content="Keep your band's recording sessions in sync.">
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/favicon.png">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <main class="hero">
    <img src="/assets/logo.png" alt="Session Sync" class="hero__logo">
    <p class="hero__tagline">Keep your band's recording sessions in sync.</p>
  </main>
  <footer class="footer">
    <a href="/privacy">Privacy Policy</a>
  </footer>
</body>
</html>
```

**Step 2: Commit**

```bash
git add apps/web/index.html
git commit -m "feat: add homepage"
```

---

### Task 4: Create privacy policy page

**Files:**
- Create: `apps/web/privacy.html`

**Step 1: Write privacy.html**

Create `apps/web/privacy.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Privacy Policy - Session Sync</title>
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/favicon.png">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="page">
    <a href="/" class="page__back">&larr; Back to home</a>
    <h1>Privacy Policy</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
  </div>
  <footer class="footer">
    <a href="/">Session Sync</a>
  </footer>
</body>
</html>
```

**Step 2: Commit**

```bash
git add apps/web/privacy.html
git commit -m "feat: add privacy policy page"
```

---

### Task 5: Add Netlify config

**Files:**
- Create: `apps/web/netlify.toml`

**Step 1: Write netlify.toml**

Create `apps/web/netlify.toml`:

```toml
[build]
  publish = "."

[[redirects]]
  from = "/privacy"
  to = "/privacy.html"
  status = 200
```

Note: `publish = "."` because Netlify's base directory will be set to `apps/web` in the Netlify UI (or via `base = "apps/web"` if deploying from repo root). The redirect gives clean URLs so `/privacy` serves `privacy.html`.

**Step 2: Commit**

```bash
git add apps/web/netlify.toml
git commit -m "chore: add Netlify config with clean URLs"
```

---

### Task 6: Verify locally

**Step 1: Serve the site and check both pages**

```bash
cd apps/web && npx serve .
```

Open `http://localhost:3000` — verify:
- Logo centered on page
- Tagline visible below logo
- Footer link to privacy policy works
- `/privacy` shows privacy policy page
- Back link returns to homepage
- Favicon appears in browser tab

**Step 2: Final commit if any tweaks needed**
