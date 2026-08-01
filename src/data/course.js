// 2026 KAK Invitational — St. Andrews Golf Club, Overland Park KS, Blue tees
// Transcribed from the club scorecard and tournament rules card.

export const COURSE = {
  name: 'St. Andrews Golf Club',
  address: '11099 W 135th St, Overland Park, KS 66221',
  phone: '(913) 890-1650',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=St.+Andrews+Golf+Club+11099+W+135th+St+Overland+Park+KS+66221',
  tee: {
    name: 'Blue',
    rating: 68.8,
    slope: 123,
    yardage: 5986,
  },
}

export const TOURNAMENT = {
  name: '2026 KAK Invitational',
  format: '4-Man Scramble',
  year: 2026,
}

export const RULES = [
  { title: 'Tournament Format', body: '4-Man Scramble' },
  { title: 'Tees & Yardage', body: 'Blue tee boxes — 5,986 yds' },
  {
    title: 'Lie Integrity',
    body: 'Same-surface placement. If the chosen ball is in the rough, fairway, sand, or a hazard, players must place their subsequent shot within one club-length in that same general area. No moving to the fairway from rough or a hazard.',
  },
  {
    title: 'Scoring Policy',
    body: 'Bogey is your friend — max +1 (bogey) per hole, no matter how the hole actually goes. Keep pace with the group in front of you.',
  },
  { title: 'Conduct', body: 'No mulligans. No breakfast balls.' },
]

// Hole-by-hole numbers, index 0 = hole 1 ... index 17 = hole 18.
export const HOLES = [
  { hole: 1, par: 5, yardage: 518, menHcp: 1, womenHcp: 3 },
  { hole: 2, par: 4, yardage: 332, menHcp: 13, womenHcp: 13 },
  { hole: 3, par: 4, yardage: 313, menHcp: 11, womenHcp: 9 },
  { hole: 4, par: 3, yardage: 155, menHcp: 17, womenHcp: 15 },
  { hole: 5, par: 4, yardage: 323, menHcp: 9, womenHcp: 11 },
  { hole: 6, par: 3, yardage: 158, menHcp: 15, womenHcp: 17 },
  { hole: 7, par: 5, yardage: 503, menHcp: 3, womenHcp: 1 },
  { hole: 8, par: 4, yardage: 373, menHcp: 7, womenHcp: 5 },
  { hole: 9, par: 4, yardage: 368, menHcp: 5, womenHcp: 7 },
  { hole: 10, par: 5, yardage: 541, menHcp: 4, womenHcp: 2 },
  { hole: 11, par: 4, yardage: 358, menHcp: 2, womenHcp: 6 },
  { hole: 12, par: 3, yardage: 155, menHcp: 16, womenHcp: 16 },
  { hole: 13, par: 4, yardage: 304, menHcp: 12, womenHcp: 8 },
  { hole: 14, par: 3, yardage: 158, menHcp: 18, womenHcp: 18 },
  { hole: 15, par: 5, yardage: 474, menHcp: 6, womenHcp: 4 },
  { hole: 16, par: 4, yardage: 391, menHcp: 10, womenHcp: 12 },
  { hole: 17, par: 3, yardage: 174, menHcp: 14, womenHcp: 14 },
  { hole: 18, par: 4, yardage: 388, menHcp: 8, womenHcp: 10 },
]

export const FRONT_9 = HOLES.slice(0, 9)
export const BACK_9 = HOLES.slice(9, 18)
export const OUT_PAR = FRONT_9.reduce((s, h) => s + h.par, 0)
export const IN_PAR = BACK_9.reduce((s, h) => s + h.par, 0)
export const TOTAL_PAR = OUT_PAR + IN_PAR // 71

// Bogey is the max recorded score on any hole per tournament rules.
export function maxScore(par) {
  return par + 1
}

// Seed data for the 7 tee-time groups. This is written to Firestore once by
// the admin (Reset / Seed Tournament Data button) and from then on the live
// documents in Firestore are the source of truth.
export const GROUPS = [
  { id: 'group-1', group: 1, teeTime: '10:03 AM', players: ['Alex Samuelson', 'Nathan Guthrie', 'Brian Euston', 'Brendan McCann'], ghinAvg: 15, strokeAdvantage: 0 },
  { id: 'group-2', group: 2, teeTime: '10:12 AM', players: ['Jake Vance', 'Patrick Delaney', 'Nick Vance', 'Will Arnold'], ghinAvg: 17, strokeAdvantage: 0 },
  { id: 'group-3', group: 3, teeTime: '10:21 AM', players: ['Ryan Banes', 'Reed Frizell', 'Dan Zima', 'Greg Connell'], ghinAvg: 16, strokeAdvantage: 0 },
  { id: 'group-4', group: 4, teeTime: '10:30 AM', players: ['Nick Kupets', 'Zach Wagner', 'Max Brown', 'Joe Gould'], ghinAvg: 13, strokeAdvantage: 0 },
  { id: 'group-5', group: 5, teeTime: '10:39 AM', players: ['Drake Robertson', 'Chad Thomas', 'Caleb Kjergaard', 'Jared Davis'], ghinAvg: 12, strokeAdvantage: 0 },
  { id: 'group-6', group: 6, teeTime: '10:48 AM', players: ['Zach Webb', 'Thad Blevins', 'Peter Mavec', 'Martin Higgins'], ghinAvg: 28, strokeAdvantage: 3 },
  { id: 'group-7', group: 7, teeTime: '10:57 AM', players: ['Jacob Ferris', 'Cole Baber', 'John Sears', 'Connor DeWitt'], ghinAvg: 18, strokeAdvantage: 0 },
]

export const ADMIN_EMAIL = 'mccann79@gmail.com'
