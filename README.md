# KAK Invitational — Live Scoring

A live, mobile-first scoring and leaderboard app for the 2026 KAK Invitational (4-man scramble)
at St. Andrews Golf Club, Overland Park KS. Players tap into their group's scorecard from their
phones, scores sync live to everyone via Firebase, and the admin account can seed/reset the
tournament.

- **Format:** 4-man scramble, Blue tees (5,986 yds, par 71)
- **Scoring:** bogey is the max recorded score on any hole
- **7 groups / tee times**, Group 6 plays with a 3-stroke advantage
- **Leaderboard:** live, ranked by net score to par
- **Admin:** Google sign-in restricted to `mccann79@gmail.com`

## How it works

- **GitHub Pages** hosts the static built app (free, public).
- **Firebase** (free tier) provides the live database (Firestore) that syncs scores across every
  phone in real time, plus Google sign-in for the admin account. GitHub Pages alone can't do
  this — it only serves static files — so a small free backend is required for genuinely live,
  cross-phone score tracking.
- Regular players don't need an account. Tapping a group and entering a name silently signs that
  phone in anonymously and "claims" the team as its scorekeeper. The admin is the only one who
  signs in with a real Google account.

## One-time setup

### 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and create a new project
   (any name, e.g. "kak-invitational"). You can disable Google Analytics, it's not needed.
2. In the project, go to **Build -> Authentication -> Get started**. Enable the **Google** and
   **Anonymous** sign-in providers.
3. Go to **Build -> Firestore Database -> Create database**. Start in production mode, pick any
   region.
4. In Firestore, go to the **Rules** tab, replace the contents with everything in
   [`firestore.rules`](./firestore.rules) from this repo, and click **Publish**.
5. Go to **Project settings** (gear icon) -> **General**, scroll to "Your apps", click the web
   icon (`</>`) to register a new web app (any nickname), and copy the `firebaseConfig` values
   shown (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
6. Still in Project settings, go to **Authentication -> Settings -> Authorized domains** and add
   `<your-github-username>.github.io` (needed for Google sign-in to work once deployed).

### 2. Configure the app

Copy `.env.example` to `.env` and paste in the six values from step 1.5:

```
cp .env.example .env
```

For local development:

```
npm install
npm run dev
```

### 3. Configure GitHub Pages + Actions secrets

1. In the GitHub repo, go to **Settings -> Pages** and set **Source** to "GitHub Actions".
2. Go to **Settings -> Secrets and variables -> Actions** and add each of these as a repository
   secret, using the same Firebase config values from step 1.5:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Push/merge to `main` — `.github/workflows/deploy.yml` builds and deploys automatically. The
   site will be published at `https://<your-github-username>.github.io/phipsigolftourney/`.

### 4. Seed the tournament

1. Open the deployed site, go to **Admin**, and sign in with `mccann79@gmail.com`.
2. Click **Seed tournament teams** to create the 7 groups from the tee sheet.
3. Optionally set the tournament date under **Tournament settings**.

From then on, players open the site, tap **Teams**, pick their group, enter their name, and start
entering scores. Everyone can watch the **Leaderboard** update live.

## Admin capabilities

Signed in as `mccann79@gmail.com` on the **Admin** page:

- Seed/re-seed the 7 team rosters and tee times
- Reset all scores & claims (start the tournament over)
- Reset an individual team's scores/claim
- Unlock a team's claim (e.g. if the wrong phone claimed a group)
- Edit the tournament name/date shown on the Teams and Course pages

## A note on security

Team rosters, tee times, and tournament settings are locked to the admin account by
[`firestore.rules`](./firestore.rules). Score entry itself is intentionally open to anyone with
the link once they're on a device (no per-player login) — this fits a small trusted group playing
together, but it does mean a determined player could edit scores outside the app's UI. That's a
reasonable trade-off for a casual tournament; it isn't meant to withstand an adversarial public
audience.

## Editing the roster / course data

`src/data/course.js` holds the hole-by-hole par/yardage from the scorecard and the seed data for
the 7 groups (players, tee times, Ghin averages, stroke advantage). Edit it and re-run **Seed
tournament teams** (or **Re-seed rosters & tee times**) in Admin to push changes live.

## Tech stack

React + Vite, React Router (hash-based, so it works on GitHub Pages without server rewrites),
Firebase (Firestore + Auth), deployed via GitHub Actions to GitHub Pages.
