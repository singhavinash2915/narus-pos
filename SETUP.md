# NARU's POS — Setup Guide

Everything you need to go from a fresh clone to a deployed web app + iOS/Android builds.

---

## 1. First commit & GitHub repo

The local repo already has its initial commit:

```
611371f  Initial commit: NARU's POS — full React + Supabase POS system
```

Remote is set to **https://github.com/SinghOpsTech/narus-pos.git** (org repo).

### Pushing — current blocker
The push currently fails with `403 Permission denied` because the GitHub user `singhavinash2915` only has `read:org` access on the SinghOpsTech organization. Pick **one** of the options below:

| Option | What to do | When to use |
|---|---|---|
| **A. Add as collaborator** | Org owner: `SinghOpsTech` → repo `narus-pos` → Settings → Collaborators → add `singhavinash2915` with **Write** access | You want the code in the org repo (recommended) |
| **B. Re-auth as a user with write access** | `git credential-osxkeychain erase` then push again, log in as a user that has org write | You have another GitHub account with org write |
| **C. Push to a personal repo instead** | `git remote set-url origin https://github.com/singhavinash2915/narus-pos.git` then create that repo on github.com | Quick test / personal copy |

Once one of the above is in place:

```bash
git push -u origin main
```

> The Capacitor changes from this session (capacitor.config.ts, src/lib/native.ts, vite.config.ts mobile target, index.html mobile meta tags, native haptics in POSPage) are **not yet committed**. After resolving the push permissions, commit them with:
> ```bash
> git add capacitor.config.ts src/lib/native.ts vite.config.ts index.html package.json package-lock.json src/main.tsx src/components/pos/POSPage.tsx
> git commit -m "Add Capacitor for iOS/Android + dual-target build"
> git push
> ```

---

## 2. GitHub Pages deployment

Already wired up via GitHub Actions (`.github/workflows/deploy.yml`). Once the repo is on GitHub:

1. **Enable Pages**
   GitHub repo → **Settings** → **Pages** → **Source: GitHub Actions** (not "Deploy from a branch").

2. **Add Supabase secrets** (see Section 4 below for why this is safe)
   GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon public key

3. **Push to `main`** — workflow runs automatically:
   - `npm ci`
   - `npm run build` (with secrets injected as build-time env vars)
   - Uploads `dist/` as Pages artifact
   - Deploys

4. **Live URL** (after first successful run):
   `https://singhopstech.github.io/narus-pos/`

   Vite is configured with `base: '/narus-pos/'` for web, so all asset paths and HashRouter routes (`/#/pos`, `/#/orders`, etc.) resolve correctly under that subpath.

> **Public vs private repos**: GitHub Pages is **free for public repos**. For **private repos** you need GitHub Pro / Team / Enterprise. If `narus-pos` must stay private, switch hosting to Cloudflare Pages or Vercel — the build command stays the same, just point the platform at the repo.

---

## 3. Supabase setup

The app is built to run in two modes:
- **Demo mode** (no env vars set) — uses hard-coded sample menu, no persistence. Useful for first-run UI testing.
- **Live mode** (env vars set) — talks to a real Supabase project, persists orders, multi-device realtime sync.

### Steps to wire it up

1. **Create a Supabase project** — https://supabase.com/dashboard → **New project** → free tier.
   - Pick a region close to the restaurant (e.g. `ap-south-1` Mumbai).
   - Save the database password somewhere safe.

2. **Run the schema migration**
   Supabase dashboard → **SQL Editor** → **New query** → paste the contents of:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
   → Run. This creates the 6 tables (`staff`, `categories`, `menu_items`, `coupons`, `orders`, `order_items`) plus indexes and RLS policies.

3. **Run the seed migration**
   New query → paste:
   ```
   supabase/migrations/002_seed_data.sql
   ```
   → Run. This inserts the 12 categories, 47 menu items, 3 coupons, and 2 demo staff records (1 staff PIN + 1 owner).

4. **Enable Realtime on the tables that need live sync**
   Dashboard → **Database** → **Replication** → enable for:
   - `orders`
   - `order_items`
   - `menu_items`

   (`categories`, `coupons`, `staff` rarely change — they refetch on navigation, no realtime needed.)

5. **Create the owner account**
   Dashboard → **Authentication** → **Users** → **Add user** → enter owner email + password.
   This is the account that gets access to Manage + Dashboard screens.

6. **Copy your credentials**
   Dashboard → **Settings** → **API**:
   - **Project URL** → goes into `VITE_SUPABASE_URL`
   - **anon public** key → goes into `VITE_SUPABASE_ANON_KEY`

   ⚠️ Do **not** copy the `service_role` key — that one is a real secret and should never go anywhere near the frontend.

7. **Plug them in** — see Section 4.

---

## 4. Secrets handling

### The important clarification
The Supabase **anon key is not a secret in the traditional sense**. It's designed to be shipped to browsers — it's how the JS client identifies itself to the API. What protects your data is **Row Level Security (RLS) policies** on the database, which migration `001_initial_schema.sql` already sets up.

So even if someone reads the anon key from your deployed JS bundle, they can only do what RLS allows (e.g. read public menu, insert orders — never read other restaurants' data, never escalate to admin).

That said, we still keep it out of git for hygiene and to make rotation easy.

### Local development

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your URL + anon key:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

`.env.local` is in `.gitignore` — it never gets committed.

Then:
```bash
npm run dev
```

The app auto-detects the env vars and switches from demo mode to live data.

### Production (GitHub Pages)

Add the same two values as **GitHub repository secrets** (Section 2, step 2). The workflow injects them at build time:

```yaml
- name: Build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  run: npm run build
```

Vite inlines them into the JS bundle during `npm run build`. The values are baked into the deployed assets, never sitting as plain text in the repo.

### What never goes in the repo
- `.env`, `.env.local` (gitignored)
- Supabase `service_role` key (never used by the frontend)
- Database password
- Owner account password

---

## 5. Capacitor — iOS & Android builds

Already configured. `capacitor.config.ts` exists with:
- `appId: com.narusbiryani.pos`
- `appName: NARU's POS`
- `webDir: dist`
- iOS and Android platforms scaffolded under `ios/` and `android/`

Native plugin wrapper lives at `src/lib/native.ts` and is initialized once from `src/main.tsx`. It's safe on web (all calls become no-ops via `Capacitor.isNativePlatform()`).

Haptic feedback is wired into POSPage (light tap when adding an item, medium tap on payment complete).

### Dual-target builds

`vite.config.ts` reads `BUILD_TARGET`:
- `web` (default) → `base: '/narus-pos/'` (for GitHub Pages subpath)
- `mobile` → `base: '/'` (for Capacitor, which serves from the app bundle root)

This is why the package.json scripts are split:
```json
"build":         "tsc -b && vite build",
"build:mobile":  "BUILD_TARGET=mobile tsc -b && BUILD_TARGET=mobile vite build",
"cap:sync":      "npm run build:mobile && npx cap sync",
"cap:ios":       "npm run cap:sync && npx cap open ios",
"cap:android":   "npm run cap:sync && npx cap open android"
```

### iOS build

**Prerequisites:**
- macOS with **Xcode** installed (already on your machine)
- An Apple Developer account if you want to deploy to a physical device or the App Store. For simulator-only testing, no account needed.

**Build flow:**
```bash
npm run cap:ios
```

This will:
1. Build the web app with mobile target
2. Sync `dist/` into `ios/App/App/public/`
3. Open the project in Xcode

In Xcode: pick a simulator (e.g. iPhone 15) → press **Run** (▶). The app boots with the splash screen, hides it, and lands on the login page.

> Capacitor 8 uses **Swift Package Manager**, not CocoaPods — there's no `pod install` step, no `Podfile`, nothing extra to install.

### Android build

**Prerequisites (one-time setup):**
1. **Java JDK 17+** — install via `brew install --cask temurin`
2. **Android Studio** — https://developer.android.com/studio (includes Android SDK + emulator)
3. After Android Studio first launch: open SDK Manager → install Android SDK Platform 34 + Android SDK Build-Tools

**Build flow:**
```bash
npm run cap:android
```

This will:
1. Build the web app with mobile target
2. Sync `dist/` into `android/app/src/main/assets/public/`
3. Open the project in Android Studio

In Android Studio: wait for Gradle sync → pick an emulator (or plug in a phone with USB debugging) → press **Run** (▶).

> When `cap add android` ran, it warned: *"Unable to infer default Android SDK settings. This is fine, just run npx cap open android and import and sync gradle manually"* — that's expected and harmless. Android Studio will sync Gradle on first open.

### Iteration loop (after the first build)

After changing any web code:
```bash
npm run cap:sync       # rebuild + copy into native projects
```
Then re-run from Xcode / Android Studio. No need to reopen the IDE.

### What lives where
| Path | Purpose | In git? |
|---|---|---|
| `capacitor.config.ts` | Capacitor config (appId, plugins) | ✅ yes |
| `src/lib/native.ts` | TS wrapper for native plugins | ✅ yes |
| `ios/` | iOS Xcode project | ❌ gitignored |
| `android/` | Android Gradle project | ❌ gitignored |

The native projects are regenerated from `npx cap add ios/android` on a fresh clone, so there's no need to commit them. The web code + `capacitor.config.ts` is the source of truth.

---

## 6. Quick reference — first-time setup checklist

```
□ Resolve GitHub push permission (Section 1, Option A/B/C)
□ git push -u origin main
□ GitHub repo → Settings → Pages → Source: GitHub Actions
□ Create Supabase project
□ Run 001_initial_schema.sql in Supabase SQL editor
□ Run 002_seed_data.sql in Supabase SQL editor
□ Enable Realtime on orders, order_items, menu_items
□ Create owner user in Supabase Auth dashboard
□ Copy Supabase URL + anon key
□ Add VITE_SUPABASE_URL secret to GitHub repo
□ Add VITE_SUPABASE_ANON_KEY secret to GitHub repo
□ cp .env.example .env.local and paste the same values
□ npm run dev — verify live data loads
□ Push to main — verify GitHub Actions deploys to Pages
□ npm run cap:ios — verify iOS build runs in simulator
□ Install Java + Android Studio
□ npm run cap:android — verify Android build runs in emulator
```

---

## 7. Where things break (and how to fix)

| Symptom | Likely cause | Fix |
|---|---|---|
| App loads but shows demo menu only | Env vars not set | Check `.env.local` exists locally, or GitHub secrets are set for deploys |
| 404 on `https://singhopstech.github.io/narus-pos/` | First Actions run hasn't finished | Check **Actions** tab for green checkmark |
| 404 on `/#/pos` after clicking link | `base` misconfigured | Confirm `vite.config.ts` has `base: '/narus-pos/'` for web |
| iOS app shows white screen | Web assets not synced | `npm run cap:sync` then rerun from Xcode |
| Android Gradle sync fails | Java/SDK not installed | Install Temurin JDK 17 + Android Studio + SDK Platform 34 |
| `git push` returns 403 | Account lacks org write | Section 1, options A/B/C |
| Supabase realtime not updating other tabs | Replication not enabled | Dashboard → Database → Replication → enable for `orders`, `order_items`, `menu_items` |
