# 🔧 Al-Noor Masjid — Complete Setup Guide

Follow this guide to go from a fresh machine to a fully deployed platform in under 30 minutes.

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **npm 9+** (comes with Node.js)
- A **Firebase account** — [console.firebase.google.com](https://console.firebase.google.com)
- A **Vercel account** (free) — [vercel.com](https://vercel.com) *(for deployment)*
- A **GitHub account** — [github.com](https://github.com) *(for CI/CD)*

---

## Part 1 — Local Development

### Step 1: Clone and install

```bash
# If you have Git:
git clone https://github.com/your-org/masjid-donation.git
cd masjid-donation

# Or just unzip the downloaded file:
unzip masjid-donation-platform.zip
cd masjid-donation

# Install all dependencies
npm install
```

### Step 2: Create your Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** → Name it (e.g. `alnoor-masjid`)
3. Disable Google Analytics (optional) → **Create project**

### Step 3: Enable Firestore

1. In your project, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select your **closest region** → **"Enable"**

### Step 4: Get your Firebase config

1. In Firebase Console → **Project Settings** (gear icon ⚙️)
2. Scroll to **"Your apps"** → Click **"</>"** (Web app)
3. Register the app (any nickname) → **"Register app"**
4. Copy the `firebaseConfig` object — you'll need these values

### Step 5: Set up environment variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Open `.env.local` and fill in every value:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_ADMIN_PASSWORD=choose_a_strong_password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 6: Start development

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — your platform is running!

---

## Part 2 — Seed Sample Data (Optional)

To populate Firestore with realistic campaigns and donations for testing:

```bash
# Install Firebase Admin SDK
npm install firebase-admin --save-dev

# Option A: Use Application Default Credentials
gcloud auth application-default login  # Requires Google Cloud CLI

# Option B: Download a service account key
# Firebase Console → Project Settings → Service Accounts → Generate new private key
# Save as serviceAccount.json in the project root (it's in .gitignore, so it's safe)
```

Then edit `scripts/seed.js` if using option B (uncomment the cert line), then run:

```bash
node scripts/seed.js
```

---

## Part 3 — Admin Panel

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Enter the password you set in `NEXT_PUBLIC_ADMIN_PASSWORD`
3. You'll see the full dashboard with all 6 tabs

**To create your first campaign:**
1. Click **Campaigns** tab → **+ New Campaign**
2. Fill in title, goal amount, category, description
3. Set **Active = true** → **Create**

---

## Part 4 — Firestore Security Rules (Production)

In test mode, anyone can read/write Firestore. **Before going live**, deploy secure rules:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (in project root)
firebase init firestore

# Answer prompts:
# → "Use an existing project" → select your project
# → "What file should be used for Firestore Rules?" → firestore.rules (default ✓)
# → "What file should be used for Firestore indexes?" → firestore.indexes.json (default ✓)

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Part 5 — Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Push your code to GitHub (see below)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. In **Environment Variables**, add all your `NEXT_PUBLIC_*` vars
5. Click **Deploy** ✅

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

Vercel will ask you to link to a project. Follow the prompts and add env vars when asked.

---

## Part 6 — Push to GitHub + Enable CI/CD

```bash
# Initialize git
git init
git add .
git commit -m "🕌 Initial commit — Al-Noor Masjid Platform"

# Create a repo on github.com, then:
git remote add origin https://github.com/your-org/masjid-donation.git
git branch -M main
git push -u origin main
```

### Add GitHub Secrets for automated deploys:

1. In your GitHub repo → **Settings → Secrets and variables → Actions**
2. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | From [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | From `.vercel/project.json` after first deploy |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` after first deploy |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Firebase config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From Firebase config |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Your admin password |
| `NEXT_PUBLIC_BASE_URL` | `https://your-domain.vercel.app` |

Now every push to `main` automatically deploys! 🚀

---

## Part 7 — Custom Domain

### On Vercel:
1. Vercel Dashboard → Your Project → **Domains**
2. Add your domain (e.g. `alnoormasjid.org`)
3. Update your DNS with the provided records (usually a CNAME or A record)

### Update BASE_URL:
```env
NEXT_PUBLIC_BASE_URL=https://alnoormasjid.org
```

---

## Part 8 — Prayer Times (Live)

The platform includes a prayer times API at `/api/prayer-times`. By default it returns static times.

To enable **live times via Aladhan.com** (free, no API key needed):

Visit: `https://your-domain.com/api/prayer-times?city=NewYork&country=US`

To use this in your prayer times widget, update `PrayerTimesWidget.js`:
```js
<PrayerTimesWidget city="New York" />
```

---

## Part 9 — Real Payment Processing (Optional)

The platform includes a payment webhook stub at `/app/api/webhooks/payment/route.js`.

To activate Stripe:

```bash
npm install stripe
```

Add to `.env.local`:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Then uncomment the Stripe block in `app/api/webhooks/payment/route.js`.

---

## Part 10 — Customise for Your Masjid

| File | What to change |
|------|----------------|
| `app/layout.js` | Masjid name in metadata |
| `components/Navbar.js` | Logo, Masjid name |
| `components/Footer.js` | Address, phone, email, prayer times |
| `app/about/page.js` | About text, team members, prayer times |
| `app/globals.css` | Colour variables (--emerald, --gold) |
| `scripts/seed.js` | Sample campaigns for your Masjid |
| `public/manifest.json` | App name and description |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Firebase: Error (auth/invalid-api-key)` | Check `.env.local` — all values must be correct |
| Campaigns not loading | Check Firestore rules — ensure reads are allowed |
| Admin panel not working | Verify `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local` |
| Build fails | Run `npm run lint` to find errors |
| Live ticker not updating | Enable Firestore real-time reads in security rules |

---

## Support

Open an issue on GitHub or email the development team.

---

*Built with ❤️ for the Ummah — May Allah accept it as Sadaqah Jariyah. 🤲*
