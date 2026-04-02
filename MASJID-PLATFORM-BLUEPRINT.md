# 🕌 MASJID DONATION PLATFORM — MASTER BLUEPRINT
## A Complete Reference for Rebuilding This Application from Scratch

> **Purpose of this document:** Everything an AI agent or developer needs to understand, recreate, and extend this project. Read top to bottom before writing a single line of code.

---

## 📋 TABLE OF CONTENTS

1. [Project Scenario & Brief](#1-project-scenario--brief)
2. [What Was Built — Full Feature List](#2-what-was-built--full-feature-list)
3. [Technology Stack & Why](#3-technology-stack--why)
4. [Architecture Overview](#4-architecture-overview)
5. [Database Schema — Firebase Firestore](#5-database-schema--firebase-firestore)
6. [Complete File Structure](#6-complete-file-structure)
7. [Every File Explained](#7-every-file-explained)
8. [Design System & Aesthetic](#8-design-system--aesthetic)
9. [Environment Variables](#9-environment-variables)
10. [Configuration Files](#10-configuration-files)
11. [API Routes Reference](#11-api-routes-reference)
12. [Component Reference](#12-component-reference)
13. [Key Patterns & Conventions Used](#13-key-patterns--conventions-used)
14. [Build & Deploy Instructions](#14-build--deploy-instructions)
15. [What to Change for a Different Masjid/Org](#15-what-to-change-for-a-different-masjidorg)
16. [Future Extensions](#16-future-extensions)
17. [Rebuild Prompt for AI](#17-rebuild-prompt-for-ai)

---

## 1. PROJECT SCENARIO & BRIEF

### The Problem
A Masjid (mosque) needed a modern digital donation platform to:
- Accept online donations from community members
- Run fundraising campaigns for specific causes (masjid renovation, food programs, etc.)
- Display transparency so donors can see where money goes
- Manage campaigns and donors through an admin panel
- Allow volunteers to sign up
- Calculate Zakat (Islamic mandatory charity, 2.5% of savings)

### The Client
**Al-Noor Masjid** — a fictional Islamic community centre serving 2,400 families. Established 1998. Non-profit 501(c)(3). Needs to collect donations, manage campaigns, and serve the community digitally.

### Requirements Given
- Frontend: **Next.js**
- Database: **Firebase**
- Full-stack (frontend + backend API routes)
- Admin dashboard (no separate login system needed — password-only)
- Islamic aesthetic (Arabic fonts, green/gold colour scheme)
- Mobile responsive

### What Was Delivered
A production-ready, full-stack web application with 57 files covering 14 pages, 11 components, 6 API routes, 6 library files, CI/CD pipeline, Firestore security rules, and a seed script.

---

## 2. WHAT WAS BUILT — FULL FEATURE LIST

### Public-Facing Pages

| Page | Route | Key Features |
|------|-------|-------------|
| Home | `/` | Animated stat counters, hero with inline donation widget, live donation ticker, rotating Quran verse carousel, prayer times widget, campaign cards, impact numbers |
| Campaigns | `/campaigns` | All campaigns, search by title, filter by category (9 types), filter by status (active/closed), responsive card grid |
| Campaign Detail | `/campaigns/[id]` | Progress bar, donor list with amounts/messages, sticky donate widget, share button, fundraising stats, days remaining |
| Donate | `/donate` | 3-step wizard: Amount → Donor Details → Confirm → Receipt redirect. Preset amounts + custom. Anonymous option. One-time or monthly. |
| Donation Receipt | `/receipt/[id]` | Printable receipt with receipt number, tax deduction notice, Arabic dua, donor details, share button |
| Zakat Calculator | `/zakat` | Nisab basis selector (gold/silver), 9 asset fields, 3 deduction fields, live net wealth calculation, FAQ accordion |
| Transparency | `/transparency` | All donations public ledger with pagination (15/page), category breakdown bar chart, total stats |
| About | `/about` | Masjid history, prayer times table (full schedule), leadership team grid |
| Volunteer | `/volunteer` | 2-step signup: role selection (9 roles, multi-select cards) → personal details + availability + skills tags |
| Contact | `/contact` | Form with name/email/phone/subject/message, Firestore submission, sticky info sidebar |
| 404 | `not-found.js` | Custom Arabic 404 page |
| Loading | `loading.js` | Spinning crescent moon global loader |
| Error | `error.js` | Global error boundary with reset button |

### Admin Panel (`/admin`) — Password Protected

| Tab | Features |
|-----|----------|
| Dashboard | 6 stat cards, 7-day bar chart, monthly trend chart, campaign leaderboard, recent donations table |
| Campaigns | Full CRUD via modal form: create, edit, delete, activate/close |
| Donations | All donations table with receipt links, CSV export |
| Volunteers | Applications list, approve/reject/email/delete, pending badge count |
| Inbox | Contact messages, mark read, reply via mailto, delete, unread badge |
| Newsletter | Subscribers list, export emails CSV, unsubscribe individual |

### API Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/donate` | Server-validated donation creation |
| POST | `/api/contact` | Contact form with spam filter |
| GET | `/api/admin/export` | Password-protected CSV donation export |
| GET | `/api/analytics` | Full analytics data (daily/monthly trends, category breakdown, top donors) |
| GET | `/api/prayer-times` | Static times + optional live Aladhan.com integration |
| GET | `/api/newsletter/unsubscribe` | One-click email unsubscribe with HTML confirmation page |
| POST | `/api/webhooks/payment` | Stripe/PayPal webhook stub (ready to uncomment and activate) |

### Other Features
- 🌙 **Dark mode** — CSS `data-theme` attribute + localStorage persistence + toggle button in navbar
- 📱 **PWA** — `manifest.json` with app shortcuts to /donate, /campaigns, /zakat
- 🗺️ **SEO** — Next.js Metadata API, `sitemap.xml`, `robots.txt`
- 🔒 **Security headers** — via Next.js middleware (X-Frame-Options, X-XSS-Protection, etc.)
- 🔄 **CI/CD** — GitHub Actions: lint → build → Vercel deploy on push to main
- ⚡ **Real-time** — LiveTicker uses Firestore `onSnapshot` for live donation feed
- 🖨️ **Print** — Receipt page has print-optimised CSS with `@media print`
- 🌱 **Seed script** — Populate Firestore with 6 campaigns + 8 donations via Firebase Admin SDK

---

## 3. TECHNOLOGY STACK & WHY

### Core Stack

| Layer | Technology | Version | Why Chosen |
|-------|-----------|---------|-----------|
| Framework | Next.js | 14.2.5 | App Router, Server Components, API Routes, built-in SEO tools |
| Database | Firebase Firestore | 10.12.2 | Real-time listeners, no-server setup, free tier generous |
| Styling | Pure CSS Variables | — | No build tools needed, full control, dark mode via `data-theme` |
| Notifications | react-hot-toast | 2.4.1 | Simple, beautiful, customisable toast notifications |

### Fonts (Google Fonts — loaded in `globals.css`)

| Font | Usage | Why |
|------|-------|-----|
| **Amiri** (Arabic) | Arabic Quran verses, Arabic text | Authentic Arabic calligraphy style |
| **Playfair Display** | Headings, titles, numbers | Elegant serif, feels premium and trustworthy |
| **DM Sans** | Body text, UI elements | Clean, modern, highly readable |

### Why Firebase Firestore over SQL

- **No backend server** — Firestore SDK connects directly from browser
- **Real-time** — `onSnapshot` gives live donation updates without polling
- **Free tier** — 50,000 reads/day, 20,000 writes/day — sufficient for a Masjid
- **Simple auth** — no user accounts needed (admin is password-only)
- **Scale** — handles traffic spikes (Ramadan) automatically
- **Alternative**: Supabase (PostgreSQL) would work too but requires more server-side code

### Why Next.js 14 App Router (not Pages Router)

- **File-based routing** — `app/campaigns/[id]/page.js` auto-creates dynamic routes
- **Server Components** — metadata, sitemap, robots generated server-side
- **API Routes** — `app/api/*/route.js` gives full Express-like server endpoints
- **Suspense** — `<Suspense>` boundaries for loading states
- **`use client`** — explicit client/server split for Firebase SDK calls

---

## 4. ARCHITECTURE OVERVIEW

```
Browser
  │
  ├── Next.js Pages (Client Components — 'use client')
  │     ├── Fetch data directly from Firestore SDK
  │     ├── State managed with useState/useEffect
  │     └── Custom hooks in lib/hooks.js
  │
  ├── Next.js API Routes (Server-side)
  │     ├── /api/donate       — validate & write to Firestore
  │     ├── /api/contact      — spam-filter & write to Firestore
  │     ├── /api/admin/export — read Firestore, return CSV
  │     ├── /api/analytics    — read Firestore, return JSON
  │     ├── /api/prayer-times — static data + optional Aladhan API proxy
  │     └── /api/webhooks/payment — payment provider webhook receiver
  │
  ├── Middleware (middleware.js)
  │     ├── Add security headers to all responses
  │     └── Protect /api/admin/* routes
  │
  └── Firebase Firestore (Cloud Database)
        ├── campaigns   — read by all, write via admin only
        ├── donations   — read by all, create by all (validated)
        ├── contacts    — create by all
        ├── volunteers  — create by all
        └── newsletter  — create by all
```

### Data Flow: Donation Submission
```
User fills form
  → Client validates (name, email, amount)
  → POST /api/donate (server validates again)
  → addDoc(db, 'donations', {...})
  → updateDoc(db, 'campaigns/id', { raisedAmount: increment(amount) })
  → Returns { success: true, id: donationRef.id }
  → Client redirects to /receipt/[id]
  → Receipt page reads donation from Firestore by ID
```

### Data Flow: Real-Time Ticker
```
LiveTicker component mounts
  → onSnapshot(query(collection(db, 'donations'), orderBy('createdAt', 'desc'), limit(6)))
  → Firestore pushes update any time a donation is added
  → Component re-renders with new data
  → New donations show "NEW" badge for 3 seconds
```

---

## 5. DATABASE SCHEMA — FIREBASE FIRESTORE

### Collection: `campaigns`

```js
{
  title:        string,      // "Masjid Renovation Fund"
  description:  string,      // Long text, supports \n for paragraphs
  goalAmount:   number,      // 85000 (USD, no cents)
  raisedAmount: number,      // Auto-incremented by donate API
  donorCount:   number,      // Auto-incremented by donate API
  category:     string,      // One of: masjid | education | food | relief | water | medical | youth | zakat | general
  endDate:      string,      // "2025-08-31" (ISO date string, YYYY-MM-DD)
  imageUrl:     string,      // Optional banner image URL
  active:       boolean,     // true = visible on site
  createdAt:    timestamp,   // serverTimestamp()
}
```

### Collection: `donations`

```js
{
  donorName:     string,     // "Aisha Rahman" or "Anonymous"
  email:         string,     // "aisha@example.com" or ""
  phone:         string,     // Optional
  amount:        number,     // 250 (USD)
  campaignId:    string,     // Firestore doc ID of campaign, or ""
  category:      string,     // Same enum as campaigns
  donationType:  string,     // "one-time" | "monthly"
  paymentMethod: string,     // "card" | "bank" | "cash"
  message:       string,     // Optional donor message/dua
  anonymous:     boolean,    // If true, donorName stored as "Anonymous"
  status:        string,     // "completed"
  createdAt:     timestamp,  // serverTimestamp()
}
```

### Collection: `contacts`

```js
{
  name:      string,
  email:     string,
  phone:     string,         // Optional
  subject:   string,         // Dropdown selection
  message:   string,
  read:      boolean,        // false on create, admin marks true
  ip:        string,         // x-forwarded-for header (for spam tracking)
  createdAt: timestamp,
}
```

### Collection: `volunteers`

```js
{
  name:         string,
  email:        string,
  phone:        string,      // Optional
  roles:        string[],    // ["masjid_maintenance", "food_program", ...]
  availability: string[],    // ["Weekends", "Ramadan only", ...]
  skills:       string[],    // ["Arabic speaker", "Driver / Transport", ...]
  message:      string,      // Optional
  status:       string,      // "pending" | "approved" | "rejected"
  createdAt:    timestamp,
}
```

### Collection: `newsletter`

```js
{
  email:     string,         // Lowercase, trimmed
  active:    boolean,        // false = unsubscribed
  createdAt: timestamp,
}
```

### Firestore Indexes (firestore.indexes.json)

Two composite indexes are required:
1. `donations` — `campaignId ASC` + `createdAt DESC` (for getDonationsByCampaign)
2. `campaigns` — `active ASC` + `createdAt DESC` (for filtering active campaigns)

### Security Rules Summary (firestore.rules)

```
campaigns  → allow read: true;  allow write: false (admin SDK only)
donations  → allow create: if amount > 0 && amount <= 1000000 && status == 'completed'
             allow read/update/delete: false
all others → deny (client writes go via API routes)
```

---

## 6. COMPLETE FILE STRUCTURE

```
masjid-donation/
│
├── 📄 .env.local.example          ← Template — copy to .env.local
├── 📄 .gitignore                  ← Excludes: node_modules, .env.local, .next, serviceAccount.json
├── 📄 firebase.json               ← Firebase hosting + Firestore config pointers
├── 📄 firestore.indexes.json      ← Composite index definitions
├── 📄 firestore.rules             ← Production security rules
├── 📄 jsconfig.json               ← Path aliases: @/components, @/lib
├── 📄 middleware.js               ← Security headers + admin API protection
├── 📄 next.config.js              ← Next.js config (Firebase Storage image domain)
├── 📄 package.json                ← Dependencies + npm scripts
├── 📄 README.md                   ← Project overview
├── 📄 SETUP.md                    ← Step-by-step setup guide
│
├── 📁 .github/
│   └── 📁 workflows/
│       ├── deploy.yml             ← CI/CD: lint → build → Vercel prod deploy
│       └── preview.yml            ← PR preview deployments
│
├── 📁 app/                        ← Next.js App Router
│   ├── 📄 error.js                ← Global error boundary
│   ├── 📄 globals.css             ← Design system + dark mode CSS variables
│   ├── 📄 layout.js               ← Root layout: DarkModeProvider, Navbar, Footer, ScrollToTop, Toaster
│   ├── 📄 loading.js              ← Global loading spinner
│   ├── 📄 not-found.js            ← Custom 404 page
│   ├── 📄 page.js                 ← Home page
│   ├── 📄 robots.js               ← robots.txt generator
│   ├── 📄 sitemap.js              ← sitemap.xml generator
│   │
│   ├── 📁 about/page.js           ← About + prayer times + team
│   ├── 📁 admin/page.js           ← Full admin dashboard (6 tabs)
│   ├── 📁 campaigns/
│   │   ├── page.js                ← Campaign listing + search/filter
│   │   └── [id]/page.js           ← Individual campaign detail
│   ├── 📁 contact/page.js         ← Contact form
│   ├── 📁 donate/page.js          ← 3-step donation form
│   ├── 📁 receipt/[id]/page.js    ← Printable donation receipt
│   ├── 📁 transparency/page.js    ← Public donation ledger
│   ├── 📁 volunteer/page.js       ← Volunteer application
│   ├── 📁 zakat/page.js           ← Zakat calculator
│   │
│   └── 📁 api/
│       ├── analytics/route.js     ← Full analytics data endpoint
│       ├── contact/route.js       ← Contact form submission
│       ├── donate/route.js        ← Donation submission + campaign update
│       ├── prayer-times/route.js  ← Prayer times (static + Aladhan API)
│       ├── admin/
│       │   └── export/route.js    ← CSV export of all donations
│       ├── newsletter/
│       │   └── unsubscribe/route.js ← One-click unsubscribe
│       └── webhooks/
│           └── payment/route.js   ← Stripe/PayPal webhook stub
│
├── 📁 components/
│   ├── CampaignCard.js            ← Reusable campaign card with progress bar
│   ├── DarkModeToggle.js          ← ☀️/🌙 toggle button
│   ├── DonationWidget.js          ← Embeddable quick-donate widget
│   ├── Footer.js                  ← 4-column footer with newsletter
│   ├── LiveTicker.js              ← Real-time Firestore onSnapshot feed
│   ├── Navbar.js                  ← Sticky nav with active links + dark mode
│   ├── NewsletterSignup.js        ← Email subscription (light + dark variants)
│   ├── PrayerTimesWidget.js       ← Prayer times with "next prayer" highlight
│   ├── QuranVerse.js              ← 8-verse rotating carousel with Arabic text
│   ├── ScrollToTop.js             ← Floating ↑ button
│   └── SkeletonCard.js            ← Shimmer loading skeleton
│
├── 📁 lib/
│   ├── darkMode.js                ← DarkModeProvider context + useDarkMode hook
│   ├── firebase.js                ← Firebase app init (prevents re-init in hot reload)
│   ├── firestore-admin.js         ← Admin-only helpers: getVolunteers, getAdminStats, etc.
│   ├── firestore.js               ← Public CRUD: getCampaigns, submitDonation, getStats, etc.
│   ├── hooks.js                   ← Custom hooks: useCampaigns, useDonations, useStats, useDebounce
│   └── utils.js                   ← formatCurrency, formatDate, calcProgress, CATEGORY_CONFIG
│
├── 📁 public/
│   └── manifest.json              ← PWA manifest with app shortcuts
│
└── 📁 scripts/
    └── seed.js                    ← Firebase Admin SDK seeder: 6 campaigns + 8 donations
```

---

## 7. EVERY FILE EXPLAINED

### `app/layout.js`
- Root layout wrapping every page
- Imports `globals.css`
- Wraps children in `<DarkModeProvider>` (provides dark mode context)
- Renders `<Navbar>`, `<main>{children}</main>`, `<Footer>`, `<ScrollToTop>`, `<Toaster>`
- Exports `metadata` object (site title template, description, OG tags, manifest, themeColor)

### `app/globals.css`
- Defines all CSS custom properties (variables) on `:root`
- Key variables: `--emerald`, `--gold`, `--cream`, `--parchment`, `--charcoal`, `--muted`
- Utility classes: `.btn-primary`, `.btn-secondary`, `.btn-emerald`, `.card`, `.input-field`, `.badge`, `.progress-bar`, `.section`, `.container`, `.geo-pattern`
- Dark mode overrides via `[data-theme="dark"]` selector
- Google Fonts import: Amiri, Playfair Display, DM Sans

### `lib/firebase.js`
- Initialises Firebase app once (guards against hot-reload re-init with `getApps().length === 0`)
- Exports: `db` (Firestore), `auth` (Firebase Auth — unused but available)

### `lib/firestore.js`
Public CRUD functions:
- `getCampaigns()` — all campaigns ordered by createdAt desc
- `getCampaign(id)` — single campaign by ID
- `createCampaign(data)` — adds raisedAmount:0, donorCount:0, active:true
- `updateCampaign(id, data)` — partial update
- `deleteCampaign(id)` — hard delete
- `submitDonation(data)` — creates donation + increments campaign totals atomically
- `getDonations()` — all donations ordered by createdAt desc
- `getDonationsByCampaign(campaignId)` — filtered donations (requires composite index)
- `getStats()` — aggregates totalRaised, totalDonations, activeCampaigns, totalCampaigns

### `lib/firestore-admin.js`
Admin-only helpers (same Firestore but different collections):
- `getVolunteers()`, `updateVolunteerStatus(id, status)`, `deleteVolunteer(id)`
- `getNewsletterSubscribers()`, `unsubscribeNewsletter(id)`
- `getContacts()`, `markContactRead(id)`, `deleteContact(id)`
- `getAdminStats()` — comprehensive stats including monthlyData (last 6 months)

### `lib/hooks.js`
Custom React hooks for data fetching:
- `useCampaigns({ activeOnly })` — with reload function
- `useCampaign(id)` — single campaign
- `useDonations(campaignId?)` — optionally filtered
- `useStats()` — platform statistics
- `useDebounce(value, delay)` — for search inputs

### `lib/utils.js`
Pure utility functions:
- `formatCurrency(amount)` — "$1,234"
- `formatDate(timestamp)` — from Firestore timestamp
- `calcProgress(raised, goal)` — percentage capped at 100
- `daysLeft(dateStr)` — from ISO date string
- `truncate(str, limit)` — with "…"
- `initials(name)` — "AR" from "Aisha Rahman"
- `CATEGORY_CONFIG` — object mapping category keys to { icon, label, color }

### `lib/darkMode.js`
- `DarkModeProvider` — React context provider
- On mount: reads `localStorage.getItem('theme')` + `prefers-color-scheme` media query
- `toggle()` — flips `data-theme` attribute on `<html>`, saves to localStorage
- `useDarkMode()` — hook returning `{ dark, toggle }`

### `middleware.js`
Runs on every request:
- Adds 5 security headers to all responses
- Checks `x-admin-password` header on `/api/admin/*` routes
- Config: matches all routes except `_next/static`, `_next/image`, `favicon.ico`

---

## 8. DESIGN SYSTEM & AESTHETIC

### Colour Palette

| Variable | Value | Usage |
|----------|-------|-------|
| `--emerald` | `#1a5c38` | Primary brand, buttons, active states |
| `--emerald-light` | `#256b44` | Button hover |
| `--emerald-dark` | `#0e3b22` | Hero background, navbar, footer |
| `--gold` | `#c9973a` | Accent, badges, highlights |
| `--gold-light` | `#e8b84b` | Hover gold, Arabic text |
| `--gold-pale` | `#f5e8c8` | Gold badge background |
| `--cream` | `#faf7f0` | Page background |
| `--parchment` | `#f2ead8` | Card backgrounds, section alt |
| `--charcoal` | `#1c1c1e` | Body text |
| `--muted` | `#6b7280` | Secondary text, labels |

### Islamic Geometric Pattern
The `.geo-pattern` class creates the hero backgrounds using:
- CSS `background-image` with inline SVG data URI
- Hexagonal grid pattern using `<polygon>` elements
- Two radial gradient overlays for depth
- Used on: Hero, CTA banner, 404 page, Error page

### Typography Hierarchy

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1/H2/H3 | Playfair Display | 700 | clamp(2rem–4.8rem) |
| Arabic text | Amiri | 400/700 | 1.1rem–2.5rem |
| Body | DM Sans | 400 | 1rem |
| Labels | DM Sans | 600 | 0.8–0.9rem |
| Numbers/Stats | Playfair Display | 700 | 1.8–3rem |

### Dark Mode Implementation
- CSS variables are redefined under `[data-theme="dark"]` selector
- Background flips: `--cream: #0f1a0f`, `--parchment: #162216`
- Text flips: `--charcoal: #e8f0e8`
- Emerald becomes brighter: `--emerald: #4ade80`
- Gold becomes brighter: `--gold: #fbbf24`
- Stored in `localStorage` as `'theme': 'dark'|'light'`

### Responsive Breakpoints
- **Mobile first** — all layouts use CSS Grid with `auto-fit, minmax()`
- Override at 768px: single column for two-column grids
- Override at 600px: single column for two-column form fields
- Navbar hamburger appears at 900px

---

## 9. ENVIRONMENT VARIABLES

### Required (`.env.local`)

```env
# Firebase Web App Configuration
# Get from: Firebase Console → Project Settings → Your Apps → Web App
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# Admin Dashboard Password
NEXT_PUBLIC_ADMIN_PASSWORD=choose_a_strong_password_here

# Your domain (used in sitemap, OG tags, unsubscribe links)
NEXT_PUBLIC_BASE_URL=https://alnoormasjid.org
```

### Optional (for advanced features)

```env
# Stripe Payment Processing (uncomment webhook code in /api/webhooks/payment/route.js)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Upstash Redis (for rate limiting in production)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Important Notes
- All `NEXT_PUBLIC_*` variables are exposed to the browser — never put secrets in them
- `ADMIN_PASSWORD` is technically public (client-side check) — for production, implement Firebase Auth
- `.env.local` is in `.gitignore` — never commit it
- On Vercel, add all variables under Project → Settings → Environment Variables

---

## 10. CONFIGURATION FILES

### `next.config.js`
```js
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};
```
Enables Next.js `<Image>` optimisation for Firebase Storage hosted images.

### `jsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/app/*": ["app/*"]
    }
  }
}
```
Allows imports like `import CampaignCard from '@/components/CampaignCard'`.

### `firebase.json`
```json
{
  "hosting": {
    "public": ".next",
    "cleanUrls": true,
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### `package.json` Scripts
```
npm run dev          → Start development server on port 3000
npm run build        → Production build
npm run start        → Start production server
npm run lint         → Run ESLint
npm run seed         → Populate Firestore with sample data (requires firebase-admin)
npm run firebase:deploy → Deploy security rules + indexes
npm run vercel:deploy → Deploy to Vercel production
```

---

## 11. API ROUTES REFERENCE

### `POST /api/donate`
**Body:**
```json
{
  "amount": 100,
  "donorName": "Aisha Rahman",
  "email": "aisha@example.com",
  "campaignId": "abc123",
  "category": "masjid",
  "donationType": "one-time",
  "paymentMethod": "card",
  "anonymous": false,
  "message": "JazakAllahu Khayran"
}
```
**Returns:** `{ success: true, id: "donationDocId" }`
**Side effects:** Creates donation + increments campaign `raisedAmount` and `donorCount`

### `POST /api/contact`
**Body:** `{ name, email, phone?, subject, message }`
**Validation:** Checks name, email format, message length, spam keywords
**Returns:** `{ success: true, id: "contactDocId" }`

### `GET /api/admin/export`
**Headers:** `x-admin-password: your_password`
**Returns:** CSV file download with all donation fields
**Filename:** `alnoor-donations-YYYY-MM-DD.csv`

### `GET /api/analytics`
**Headers:** `x-admin-password: your_password`
**Returns:** JSON with summary, byCategory, byPayment, donationTypes, dailyTrend (30 days), monthlyTrend (12 months), topDonors, campaignPerformance

### `GET /api/prayer-times`
**Query params:** `?city=NewYork&country=US&method=2`
**Returns:** JSON with times object: `{ Fajr: { adhan, iqama }, Dhuhr: {...}, ... }`
**Note:** Falls back to static times if Aladhan API fails

### `GET /api/newsletter/unsubscribe`
**Query params:** `?email=user@example.com`
**Returns:** Full HTML page (not JSON) — confirmation page with return button

### `POST /api/webhooks/payment`
**Headers:** `stripe-signature: ...` (for Stripe verification)
**Body:** Stripe or PayPal event JSON
**Returns:** `{ received: true }` — actual payment handling is in commented code blocks

---

## 12. COMPONENT REFERENCE

### `<CampaignCard campaign={} />`
**Props:** campaign object from Firestore
**Renders:** Category icon, badge, title, description snippet, progress bar, donor count, "Donate Now" button
**Links to:** `/donate?campaign={id}`

### `<DonationWidget campaignId="" compact={false} />`
**Props:** optional campaignId, compact boolean for smaller version
**Renders:** Preset amounts ($10/$25/$50/$100), custom input, "Donate $X Now" button
**Links to:** `/donate?campaign={id}&amount={amount}`

### `<LiveTicker maxItems={6} />`
**Props:** maxItems number
**Behaviour:** Subscribes to Firestore `onSnapshot` — updates in real-time. New donations flash "NEW" badge for 3 seconds with slide-in animation

### `<QuranVerse autoRotate={true} intervalMs={8000} dark={false} />`
**Props:** autoRotate boolean, intervalMs number, dark boolean for dark background variant
**Content:** 8 hardcoded verses/hadiths about charity. Dot navigation. Manual prev/next buttons. Fade transition between verses.

### `<PrayerTimesWidget compact={false} city={null} />`
**Props:** compact boolean for inline version, city string for live API
**Behaviour:** Fetches `/api/prayer-times`, highlights next upcoming prayer, re-evaluates every 60 seconds

### `<NewsletterSignup dark={false} />`
**Props:** dark boolean
**Behaviour:** Submits email to `newsletter` Firestore collection. Shows success state. Validates email format.

### `<SkeletonCard />`
**No props.** Renders shimmer animation placeholder matching CampaignCard dimensions. Used while campaigns load.

### `<DarkModeToggle style={} />`
**Props:** optional style object for positioning
**Behaviour:** Reads/sets `useDarkMode()` context. Renders ☀️ or 🌙 based on current mode.

### `<ScrollToTop />`
**No props.** Invisible until user scrolls 400px, then fades in. Smooth scrolls to top on click.

### `<Navbar />`
**Behaviour:** Sticky. Background appears on scroll. Active link highlighted with gold underline. Dark mode toggle. Hamburger on mobile (≤900px). Closes on route change.

### `<Footer />`
**Sections:** Brand + newsletter, Give links, Community links, Prayer times + contact
**Includes:** `<NewsletterSignup dark />` in brand column

---

## 13. KEY PATTERNS & CONVENTIONS USED

### 1. All pages are `'use client'` components
Firebase SDK requires browser environment. All data fetching uses `useEffect` + `useState`.

### 2. Multi-step wizard pattern (Donate, Volunteer)
```js
const [step, setStep] = useState(1);
// Step 1, 2, 3 rendered conditionally with {step === 1 && (...)}
// Validation before advancing: if (!validate()) return;
```

### 3. Inline styles for all component styling
No Tailwind, no CSS modules. Everything uses inline `style={{}}` objects referencing CSS variables. This keeps components self-contained and makes the CSS variable system the single source of truth.

### 4. CSS Variables for theming
```css
:root { --emerald: #1a5c38; }
[data-theme="dark"] { --emerald: #4ade80; }
/* Components always use var(--emerald) — never hardcoded colours */
```

### 5. Progressive enhancement
- Pages work without JavaScript for static content
- Components degrade gracefully (LiveTicker hides if no donations, PrayerTimesWidget falls back to static)

### 6. Server-side validation mirrors client-side
Both `/api/donate` and the form component validate the same fields. Server validation is the authoritative check.

### 7. Atomic Firestore updates
When a donation is submitted, campaign totals are updated with `increment()` — not read-modify-write. This prevents race conditions.

### 8. Error handling pattern
```js
try {
  await someFirestoreOperation();
  toast.success('Done!');
} catch (err) {
  toast.error('Something went wrong.');
  console.error(err);
}
```

### 9. Seeding uses Firebase Admin SDK
The `scripts/seed.js` file uses `firebase-admin` (server-side, bypasses security rules) to populate Firestore without needing to authenticate as a user.

### 10. Dynamic routing
- `/campaigns/[id]` → `app/campaigns/[id]/page.js` → reads `useParams()` for the ID
- `/receipt/[id]` → `app/receipt/[id]/page.js` → same pattern

---

## 14. BUILD & DEPLOY INSTRUCTIONS

### Local Development
```bash
git clone <repo>
cd masjid-donation
npm install
cp .env.local.example .env.local
# → Fill in Firebase values
npm run dev
# → http://localhost:3000
```

### Seed the Database
```bash
npm install firebase-admin --save-dev
# Download serviceAccount.json from Firebase Console → Project Settings → Service Accounts
# Save as serviceAccount.json in project root (it's in .gitignore)
node scripts/seed.js
```

### Deploy Security Rules
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# → Select existing project
# → Use firestore.rules and firestore.indexes.json (defaults)
firebase deploy --only firestore:rules,firestore:indexes
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
# → Add all NEXT_PUBLIC_* env vars when prompted
```

### GitHub Actions Setup
1. Push code to GitHub
2. Add these secrets in GitHub repo → Settings → Secrets:
   - `VERCEL_TOKEN` (from vercel.com/account/tokens)
   - `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` (from `.vercel/project.json` after first `vercel` deploy)
   - All `NEXT_PUBLIC_*` Firebase variables
3. Every push to `main` auto-deploys

### Activate Real Payments (Stripe)
```bash
npm install stripe
```
Add to `.env.local`: `STRIPE_SECRET_KEY=...` and `STRIPE_WEBHOOK_SECRET=...`
Uncomment Stripe block in `app/api/webhooks/payment/route.js`
Configure Stripe webhook endpoint: `https://your-domain.com/api/webhooks/payment`
Events to listen: `checkout.session.completed`, `payment_intent.succeeded`

---

## 15. WHAT TO CHANGE FOR A DIFFERENT MASJID/ORG

| What to change | Where |
|---------------|-------|
| Masjid name ("Al-Noor") | `app/layout.js` metadata, `components/Navbar.js`, `components/Footer.js` |
| Address, phone, email | `components/Footer.js`, `app/about/page.js`, `app/contact/page.js` |
| Prayer times | `app/about/page.js` PRAYER_TIMES array, `components/PrayerTimesWidget.js` FALLBACK array, use `?city=YourCity` query param for live times |
| Founding year (1998) | `components/Footer.js`, `app/about/page.js` |
| EIN/charity number | `app/receipt/[id]/page.js` tax notice section |
| Number of families (2,400+) | `app/page.js` impact stats, `components/Navbar.js` |
| Colour scheme | `app/globals.css` `:root` variables — change `--emerald` and `--gold` |
| Team members | `app/about/page.js` TEAM array |
| Volunteer roles | `app/volunteer/page.js` ROLES array |
| Donation categories | `lib/utils.js` CATEGORY_CONFIG, all `CATEGORIES` arrays in forms |
| Arabic Bismillah | `components/Footer.js` arabic div |
| Admin password | `.env.local` NEXT_PUBLIC_ADMIN_PASSWORD |
| Map embed | `app/contact/page.js` — replace the map placeholder div with a `<iframe>` Google Maps embed |

---

## 16. FUTURE EXTENSIONS

### High Priority
- [ ] **Firebase Authentication** — Replace password-only admin with proper email/password Firebase Auth. Protect admin routes with `onAuthStateChanged`.
- [ ] **Stripe Payment Integration** — Uncomment the webhook stub. Create a `/api/create-checkout-session` endpoint. Add a Stripe Checkout redirect in the donation form.
- [ ] **Email receipts** — Use SendGrid or Resend to email donation receipts after successful payment. Trigger from webhook handler.
- [ ] **Real-time campaign updates** — Add `onSnapshot` to campaign detail page so progress bar updates live when others donate.

### Medium Priority
- [ ] **Multi-language** — Add Arabic RTL full-page support using `next-intl`. The Amiri font and RTL CSS are already in place.
- [ ] **Recurring donations** — Implement Stripe Subscriptions for the "Monthly" donation type (currently stored but not actually charged).
- [ ] **Image uploads** — Add Firebase Storage integration. Allow admin to upload campaign banners. Replace `imageUrl` text input with a file picker.
- [ ] **Donor portal** — Let donors view their donation history by email. Requires email-based lookup (no auth needed).

### Lower Priority
- [ ] **Push notifications** — Firebase Cloud Messaging for Jumu'ah reminders and campaign milestones.
- [ ] **Campaign comments** — Allow donors to leave public messages on campaign pages.
- [ ] **Social sharing cards** — Dynamic OG images per campaign using `@vercel/og`.
- [ ] **Analytics dashboard** — Surface the `/api/analytics` data visually in the admin panel with proper charts.
- [ ] **Rate limiting** — Implement Upstash Redis rate limiting on `/api/donate` and `/api/contact` to prevent spam.

---

## 17. REBUILD PROMPT FOR AI

Use this prompt to rebuild the entire application from scratch with an AI assistant:

---

```
Build a full-stack Masjid (mosque) donation platform called "Al-Noor Masjid" using:
- Next.js 14 with App Router (file-based routing, 'use client' components)
- Firebase Firestore as the database (no SQL, no backend server)
- Pure CSS with CSS variables (no Tailwind, no styled-components)
- react-hot-toast for notifications

DESIGN:
- Islamic aesthetic: emerald green (#1a5c38) and gold (#c9973a) colour scheme
- Fonts: Amiri (Arabic), Playfair Display (headings), DM Sans (body) from Google Fonts
- Islamic geometric SVG pattern for hero sections
- Dark mode via [data-theme="dark"] CSS variable overrides + localStorage

PAGES TO BUILD:
1. Home - hero, stat counters, live donation feed, Quran verse carousel, prayer times, campaign cards
2. Campaigns - listing with search, category filter, status filter
3. Campaign Detail (/campaigns/[id]) - donor list, progress, sticky donate widget
4. Donate - 3-step form (amount → details → confirm) that redirects to receipt
5. Receipt (/receipt/[id]) - printable with tax notice and Arabic dua
6. Zakat Calculator - asset/deduction fields, Nisab selector, FAQ
7. Volunteer - multi-step role selection + personal details
8. About - prayer times table, team, masjid history
9. Contact - form with Firestore submission
10. Transparency - paginated public donation ledger
11. Admin (/admin) - password-protected, 6 tabs: Dashboard/Campaigns/Donations/Volunteers/Inbox/Newsletter

FIRESTORE COLLECTIONS:
- campaigns: { title, description, goalAmount, raisedAmount, donorCount, category, endDate, imageUrl, active, createdAt }
- donations: { donorName, email, amount, campaignId, category, donationType, paymentMethod, message, anonymous, status, createdAt }
- contacts, volunteers, newsletter (see schema above)

API ROUTES:
- POST /api/donate (server-validate + write to Firestore + increment campaign totals)
- POST /api/contact (spam filter + Firestore)
- GET /api/admin/export (password-protected CSV)
- GET /api/prayer-times (static + optional Aladhan.com API)
- GET /api/newsletter/unsubscribe?email= (HTML confirmation page)
- POST /api/webhooks/payment (Stripe/PayPal stub)

COMPONENTS:
CampaignCard, DonationWidget, LiveTicker (Firestore onSnapshot), QuranVerse (8-verse carousel),
PrayerTimesWidget (next prayer highlighted), NewsletterSignup, DarkModeToggle, ScrollToTop, SkeletonCard

ALSO INCLUDE:
- .gitignore, middleware.js (security headers), firestore.rules, firestore.indexes.json
- GitHub Actions CI/CD (lint → build → Vercel deploy)
- PWA manifest.json
- Next.js sitemap.js and robots.js
- Firebase seed script (firebase-admin)
- SETUP.md with step-by-step instructions
```

---

*Document version: 2.0 — Built with Next.js 14 + Firebase Firestore — May Allah accept it. 🤲*
