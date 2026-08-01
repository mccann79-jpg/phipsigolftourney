# Handoff — current state & next steps

Working notes for whoever (or whatever) picks this up next. For what the app *is* and how to
set it up from scratch, read [`README.md`](./README.md) first — this file only covers **where
things stand right now**.

Last updated at commit `ec35b5e`.

---

## TL;DR — the one thing blocking everything

**The code is finished and deployed. The site does not work yet because Firebase Authentication
has never been turned on for the project.** This is a console click, not a code change.

Go to the [Firebase console](https://console.firebase.google.com/) for project
**`phi-psi-golf-tourney`**:

1. **Build → Authentication → Get started**
2. **Sign-in method** tab → enable **Anonymous** → Save
3. **Build → Firestore Database → Rules** → paste the contents of
   [`firestore.rules`](./firestore.rules) from this repo → **Publish**

Then reload https://mccann79-jpg.github.io/phipsigolftourney/ (hard refresh).

### How this was diagnosed

`curl` reaches Google APIs from a sandbox even when a browser can't, so the check was done
directly against the live project:

```bash
# Anonymous sign-in, using the API key from src/firebaseConfig.js
curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCdoyYmgAOrEWxlS8Nzc-i5dlRAT5zDhzQ" \
  -H "Content-Type: application/json" -d '{"returnSecureToken":true}'
```

| Result | Meaning |
| --- | --- |
| `CONFIGURATION_NOT_FOUND` | **Current state.** Auth has never been initialized for the project. |
| `API key not valid` | The API key is wrong. (Was true earlier — a `L`/`l` transcription typo, now fixed.) |
| JSON containing `idToken` | Working. Sign-in succeeds. |

**Re-run that command after enabling Anonymous auth.** If you get an `idToken`, the app will
work. If it still says `CONFIGURATION_NOT_FOUND`, auth isn't actually enabled yet.

Also verify the `teams` collection gets created on first page load:

```bash
curl -s "https://firestore.googleapis.com/v1/projects/phi-psi-golf-tourney/databases/(default)/documents/teams"
```

`{}` means empty — the app seeds it automatically on first visit *once auth works*. Anything
else means seeding succeeded.

---

## What the app does

Live scoring for a 28-player, 7-team golf scramble (2026 KAK Invitational, St. Andrews Golf
Club, Overland Park KS, blue tees, par 71).

- Three tabs, fixed bottom nav, mobile-first: **Scorecard / Leaderboard / Info**
- Player opens the site → picks their team → taps their name → becomes that team's **scorekeeper**
- Only the scorekeeper can enter scores for their team; everyone else sees it live
- Scorekeeper can **hand off to a teammate** or **leave team**; nobody else can take over a team
  while it's claimed — enforced by `firestore.rules`, not just hidden in the UI
- Returning visits **skip straight to your team's scorecard** (team stored in `localStorage`)
- Scores are **capped at bogey** (par + 1) per tournament rules — enforced in the entry sheet
- **Group 6 gets a 3-stroke advantage**, applied automatically to net score and leaderboard rank
- **No admin panel, no login.** Roster/reset changes are made by editing code or the Firebase console

## Architecture

React + Vite, React Router (**HashRouter** — required for GitHub Pages without server rewrites),
Firebase (Firestore + anonymous Auth). Deployed by GitHub Actions to GitHub Pages.

| File | Role |
| --- | --- |
| `src/firebaseConfig.js` | **Firebase config, committed.** Paste the console's `firebaseConfig` block here. |
| `src/firebase.js` | Initializes Firebase; anonymous sign-in; exports `authReady`, `db`, `isFirebaseConfigured`. Optional emulator wiring. |
| `src/data/course.js` | Hole-by-hole par/yardage/handicap + the 7 groups (players, tee times, `strokeAdvantage`). **Seed data + source of truth for the roster.** |
| `src/data/scoring.js` | `netSummary`, `formatToPar`, birdie/par/bogey labels. Net = gross − `strokeAdvantage`. |
| `src/data/firestoreApi.js` | All Firestore reads/writes: `subscribeTeams`, `ensureTeamsSeeded`, `claimTeam`, `leaveTeam`, `setHoleScore`, `clearHoleScore`. |
| `src/hooks/useTeams.js` | Live team subscription + auto-seed + error/timeout handling. |
| `src/context/MyTeamContext.jsx` | Which team *this device* is scorekeeper for (`localStorage`). |
| `src/pages/Home.jsx` | Scorecard tab root — redirects to your team if claimed, else shows team list. `?browse` mode via `/teams`. |
| `src/pages/TeamView.jsx` | The scorecard: score entry, claim / hand off / leave / take over. |
| `src/pages/Leaderboard.jsx` | Ranked by net-to-par, expandable per-team scorecards. |
| `src/pages/Info.jsx` | Course address, tee times, rules. |
| `firestore.rules` | **Must be published to the Firebase console manually.** |

### Firestore data model

One collection, `teams`, with fixed document IDs `group-1` … `group-7`:

```js
{
  group: 6,                    // number
  teeTime: "10:48 AM",
  players: ["Zach Webb", ...], // 4 names
  ghinAvg: 28,
  strokeAdvantage: 3,          // 0 for every group except 6
  claimedBy: { name: "Zach Webb", claimedAt: 1234567890 } | null,
  scores: { "1": 4, "2": 5 },  // hole number (string key) -> strokes
  updatedAt: <serverTimestamp>
}
```

Security model: everyone is signed in **anonymously**; that's enough for rules to tell "a
visitor" from "nobody". Any signed-in visitor can create teams (auto-seeding) and update
`scores` / `claimedBy` / `updatedAt`. Roster fields are **immutable after creation** and
deletes are blocked. There is deliberately no admin role — this is a trusted group of friends,
not a hardened public app.

---

## Local development

```bash
npm install
npm run dev     # http://localhost:5173/phipsigolftourney/
npm run build
npx oxlint .
```

Note the `/phipsigolftourney/` base path (set in `vite.config.js` for GitHub Pages) — the bare
`http://localhost:5173/` will 404.

### Testing against the Firebase emulator (recommended)

Avoids touching real tournament data. Requires Java.

```bash
mkdir -p /tmp/kak-emu && cd /tmp/kak-emu
cp /path/to/repo/firestore.rules .
cat > firebase.json <<'EOF'
{ "firestore": { "rules": "firestore.rules" },
  "emulators": { "auth": { "port": 9099 }, "firestore": { "port": 8080 }, "ui": { "enabled": false } } }
EOF
echo '{}' > .firebaserc
npx -y firebase-tools@latest emulators:start --project phi-psi-golf-tourney --only firestore,auth
```

Then in the repo, `echo "VITE_USE_FIREBASE_EMULATOR=true" > .env` and `npm run dev`.
**Delete `.env` when done** so you don't accidentally build against the emulator.

The emulator starts empty; the app auto-seeds the 7 teams on first load, which is itself a good
test that seeding works.

---

## Deploying

Push/merge to `main` → `.github/workflows/deploy.yml` builds and deploys to
https://mccann79-jpg.github.io/phipsigolftourney/. Takes ~40s. **No secrets are required** —
config is committed in `src/firebaseConfig.js`.

⚠️ **Git gotcha:** `main` uses **squash merges**, so the feature branch and `main` diverge after
every merge and a plain `git rebase origin/main` will replay already-merged commits and conflict.
Either rebase only new work:

```bash
git rebase --onto origin/main <last-already-merged-commit> <branch>
```

…or, when the branch has nothing unmerged, just realign it:

```bash
git fetch origin main
git checkout -B claude/golf-tournament-tracker-g6h8zi origin/main
git push --force-with-lease origin claude/golf-tournament-tracker-g6h8zi
```

---

## Making common changes

- **Roster / tee times / stroke advantage** → edit `src/data/course.js`. This only affects teams
  at *creation* time; Firestore is authoritative afterwards. To apply changes to teams that
  already exist, edit the documents in the Firebase console (which bypasses security rules), or
  delete the whole `teams` collection so the app re-seeds on next load.
- **Reset all scores for a fresh round** → delete the `teams` collection in the Firebase console;
  the app re-creates it on the next page load. (Re-seeding only triggers when the collection is
  *completely* empty.)
- **Tournament date** → set `TOURNAMENT.date` in `src/data/course.js` (e.g. `'2026-08-15'`).
- **Course/scorecard data** → `HOLES` in `src/data/course.js`, transcribed from the club scorecard.

---

## Known gaps / possible next steps

Nothing here is blocking; the app is feature-complete for the outing.

- **No offline support.** Cell service at the course may be poor. Firestore's local cache handles
  brief drops, but a persistent-cache/PWA setup would be more robust. There's a 15s timeout that
  surfaces a clear error rather than spinning forever.
- **Claiming a team under a teammate's name is on the honor system.** There's no real login, so
  `firestore.rules` can stop a *different* team from taking over your claim, but it can't verify
  that "Zach Webb" tapping his own name is actually Zach Webb. Intentional trade-off — see the
  security note in `README.md`.
- **No per-player individual scores.** Team scramble score only, by design.
- **Bundle is ~780 KB** (mostly the Firebase SDK). Fine over wifi, could be code-split if it
  matters on cell.
- `oxlint` emits one benign warning about `MyTeamContext.jsx` exporting a hook alongside a
  component (fast-refresh only).
