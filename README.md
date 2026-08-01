# KAK Invitational — Live Scoring

A live, mobile-first scoring and leaderboard app for the 2026 KAK Invitational (4-man scramble)
at St. Andrews Golf Club, Overland Park KS. Players pick their team and their name from the
roster, and whoever picks first for a team becomes its scorekeeper — scores sync live to
everyone via Firebase.

- **Format:** 4-man scramble, Blue tees (5,986 yds, par 71)
- **Scoring:** bogey is the max recorded score on any hole
- **7 groups / tee times**, Group 6 plays with a 3-stroke advantage
- **Leaderboard:** live, ranked by net score to par
- **Three tabs:** Scorecard, Leaderboard, Info — built for a phone in your pocket on the course

## How it works

- **GitHub Pages** hosts the static built app (free, public).
- **Firebase** (free tier) provides the live database (Firestore) that syncs scores across every
  phone in real time. GitHub Pages alone can't do this — it only serves static files — so a
  small free backend is required for genuinely live, cross-phone score tracking.
- There's no login. Opening the site silently signs your phone in anonymously (just enough for
  Firestore to tell "some visitor" apart from "nobody"), and tapping your team + name is what
  claims scorekeeping — no admin, no accounts.
- The **first person to pick a name for a team becomes its scorekeeper** and is the only one who
  can enter scores for that team on their phone. Anyone can view any team's scorecard live.
  No one else can take over a team that's already claimed, so a rival team can't hijack another
  group's scoring — and one phone can't be scorekeeper for two teams at once, either.
- Want a teammate to take over — wrong player claimed it, or you're stepping away? **Stop
  scoring** (only the current scorekeeper can do this) releases the role so anyone on the roster
  can pick it up again. If a scorekeeper's phone is lost mid-round, the admin panel or an
  organizer can free the claim up (see below).
- **Following a team** is separate from scoring for it: tap **This is my team** on any team's page
  to make that team your device's default — the Scorecard tab jumps straight to it instead of the
  team list, and it's highlighted on the Leaderboard — without becoming its scorekeeper. Handy for
  players whose teammate is already entering scores.

## One-time setup

### 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and create a new project
   (any name, e.g. "kak-invitational"). You can disable Google Analytics, it's not needed.
2. Go to **Build -> Authentication -> Get started** and enable the **Anonymous** sign-in
   provider (only this one — there's no admin login in this app).
3. Go to **Build -> Firestore Database -> Create database**. Start in production mode, pick any
   region.
4. In Firestore, go to the **Rules** tab, replace the contents with everything in
   [`firestore.rules`](./firestore.rules) from this repo, and click **Publish**.
5. Go to **Project settings** (gear icon) -> **General**, scroll to "Your apps", click the web
   icon (`</>`) to register a new web app (any nickname). It shows a `firebaseConfig = { ... }`
   block — hit the copy button.

### 2. Paste the config into the app

Open [`src/firebaseConfig.js`](./src/firebaseConfig.js) and replace the `firebaseConfig` object
with the one you just copied, then commit. That's the entire configuration step — no environment
variables, no repository secrets.

Those values are **not secrets**. They identify your Firebase project the way a public URL does,
and they're visible in the built JavaScript of any deployed Firebase web app whether you commit
them or not; Google [documents this explicitly](https://firebase.google.com/docs/projects/api-keys).
Access control comes from [`firestore.rules`](./firestore.rules), not from hiding the config.

For local development:

```
npm install
npm run dev
```

### 3. Turn on GitHub Pages

1. In the GitHub repo, go to **Settings -> Pages** and set **Source** to "GitHub Actions".
2. Push/merge to `main` — `.github/workflows/deploy.yml` builds and deploys automatically. The
   site will be published at `https://<your-github-username>.github.io/phipsigolftourney/`.

That's it — the first visit to the deployed site automatically creates the 7 teams in Firestore
from the roster in `src/data/course.js`. No seeding step, no sign-in.

## A note on security

There's no admin account — anyone with the link can view every team live, and can claim any
*unclaimed* team. But once a team is claimed, [`firestore.rules`](./firestore.rules) ties further
score edits to the anonymous auth session that claimed it, so nobody else — not even via browser
devtools — can take over or edit another team's scores while it's actively claimed. The same rules
also stop one session from claiming a second team while it already holds one, by checking the
other 6 fixed group docs for a matching `claimedByUid` before allowing a claim. Roster/tee-time/
handicap fields are likewise immutable after creation. The one thing this can't stop is someone
claiming a team under a teammate's name instead of their own — there's no real login, so identity
within a team roster is on the honor system. That's an intentional trade-off for a small trusted
group playing together, not something meant to withstand an adversarial public audience.

**The Admin section (bottom of the Info tab)** — for clearing a stuck scorekeeper claim from a
phone on the course without Firebase console access — is a deliberate exception to that model.
The PIN (`src/adminConfig.js`) is a UI speed bump only; `firestore.rules` can't check a PIN typed
into a form, so it allows *any* signed-in visitor to clear a claim (set `claimedBy`/`claimedByUid`
back to null), PIN or not — someone determined enough to open devtools doesn't need the PIN at
all. That write can only release a claim, never set one or touch scores, so the worst case is
someone getting bumped back to "unclaimed" and having to re-tap their name. Acceptable for a
casual outing with friends; don't reuse this pattern anywhere the blast radius is bigger than
that.

## Making changes later

There's no admin panel by design — for anything beyond normal scoring, edit directly:

- **Roster, tee times, handicaps, stroke advantage:** edit `src/data/course.js` and redeploy.
  This only affects the *first* time a team is created (Firestore is the source of truth after
  that) — to apply a change to an already-created team, edit that document directly in the
  Firebase console (Firestore Database -> Data), which bypasses the security rules entirely.
- **Reset a team's scores/scorekeeper, or wipe everything:** in the Firebase console, edit or
  delete documents in the `teams` collection directly. Deleting a document doesn't bring it back
  automatically — re-seeding only happens when the whole `teams` collection is empty.
- **Tournament date:** set `TOURNAMENT.date` in `src/data/course.js` (e.g. `'2026-08-15'`) and
  redeploy.

## Tech stack

React + Vite, React Router (hash-based, so it works on GitHub Pages without server rewrites),
Firebase (Firestore + Auth), deployed via GitHub Actions to GitHub Pages.
