/**
 * One-off: rewrite titles/meta/excerpts for search CTR, and convert British
 * spellings to American.
 *
 * Google truncates title links around 60 characters and meta descriptions
 * around 160. 21 titles were over 70 — four of them over 100, inherited from
 * the old Groq generator, using a "Stuns / Breaks Internet" pattern that both
 * truncates badly and reads as spam in a results page.
 *
 * Rewrites target under ~60 chars, keyword front-loaded, with a concrete
 * payoff rather than vague hype. Slugs are deliberately unchanged — those URLs
 * are already indexed and some already rank.
 *
 * Run once: node scripts/fix-titles-meta.js
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data', 'articles');

/* ── Title / meta / excerpt rewrites ─────────────────────────── */
const FIX = {
  'kangana-ranaut-calls-journalist-weirdo-after-vir-das-dismisses-kissing-scene-rumor': {
    title: "Kangana Ranaut Calls Journalist a 'Weirdo' — What Happened",
    metaDescription: "Kangana Ranaut hit back at a journalist over a kissing scene rumour Vir Das had already dismissed. Here's what was actually said.",
    excerpt: "Kangana Ranaut hit back at a journalist over a rumour Vir Das had already dismissed. What was actually said, and why it spread.",
  },
  'top-10-romantic-netflix-series-2026': {
    title: '10 Most Romantic Netflix Series to Watch in 2026',
    metaDescription: 'The 10 most romantic series on Netflix in 2026 — from Bridgerton to Outlander, with where to start and what each one does best.',
    excerpt: 'The 10 most romantic series on Netflix right now, from Bridgerton to Outlander — and which one to start with tonight.',
  },
  'box-office-obsession-surpasses-400-million-globally': {
    title: "'Obsession' Crosses $400 Million at the Global Box Office",
    metaDescription: "'Obsession' has passed $400 million worldwide. What drove the run, which markets carried it, and what it signals for the year.",
    excerpt: "'Obsession' has passed $400 million worldwide. What drove the run, and what it signals for the rest of the year.",
  },
  'madonna-returns-with-confessions-ii': {
    title: 'Madonna Returns With Confessions II — Her Boldest Album Yet',
    metaDescription: 'Madonna is back with Confessions II, a sequel to her 2005 dance record. The sound, the reaction, and why the timing matters.',
    excerpt: 'Madonna returns with Confessions II — a sequel to her 2005 dance record. The sound, the reaction, and why now.',
  },
  'princess-kate-summer-style-2026': {
    title: "Princess Kate's Summer Style 2026 — Her Best Looks Decoded",
    metaDescription: "Princess Kate's summer 2026 style — the designers she returns to, what each look signals, and the rules she quietly follows.",
    excerpt: "Princess Kate's summer 2026 wardrobe decoded — the designers she trusts and what each look is actually saying.",
  },
  'jennifer-lopez-ben-affleck-divorce-timeline': {
    title: 'Jennifer Lopez & Ben Affleck — The Full Divorce Timeline',
    metaDescription: 'The complete Jennifer Lopez and Ben Affleck timeline — the 2002 engagement, the 2021 reunion, the wedding and the split.',
  },
  'biggest-bollywood-movies-2026': {
    title: 'Biggest Bollywood Movies of 2026 — Every Major Release',
    metaDescription: 'Every major Bollywood release of 2026 — the biggest films, the star vehicles, and which ones are actually worth your money.',
  },
  'dua-lipa-fashion-style-2026': {
    title: "Dua Lipa's 2026 Fashion — How She Became a Style Icon",
  },
  'selena-gomez-net-worth-2026': {
    title: 'Selena Gomez Net Worth 2026 — How She Built $1.3 Billion',
  },
  'fantastic-four-first-steps-cast-explained-2026': {
    title: 'The Fantastic 4: First Steps — Cast, Galactus and Doomsday',
  },
  'spider-man-movies-in-order-watch-guide-2026': {
    title: 'How to Watch Every Spider-Man Movie in Order (2026)',
    metaDescription: 'Every Spider-Man movie in order — all three eras, where each one streams, and the shortcut list before Brand New Day.',
    excerpt: 'Every Spider-Man film in order across all three eras, where to stream each one, and the shortcut before Brand New Day.',
  },
  'avengers-doomsday-cast-release-date-2026': {
    title: 'Avengers: Doomsday — Full Cast and Release Date Confirmed',
    metaDescription: 'Avengers: Doomsday lands December 18, 2026. Robert Downey Jr. returns as Doctor Doom — full cast and everything confirmed.',
    excerpt: 'Avengers: Doomsday arrives December 18, 2026 — with the Russo Brothers back and Robert Downey Jr. returning as Doctor Doom.',
  },
  'taylor-swift-india-tour-2026': {
    title: 'Taylor Swift Eras Tour India — Mumbai & Delhi Dates',
  },
  'best-shows-to-stream-this-weekend-july-2026': {
    title: '5 Best Shows to Stream Right Now — Netflix, Max & Prime',
  },
  'billie-eilish-2026': {
    title: 'Billie Eilish in 2026 — How She Rewrote the Rules of Pop',
    excerpt: 'Billie Eilish changed what a pop star is allowed to sound like. Where she stands in 2026, and what comes next.',
  },
  'spider-man-brand-new-day-everything-we-know-2026': {
    title: 'Spider-Man: Brand New Day — Everything We Know So Far',
  },
  'taylor-swift-travis-kelce-relationship-milestone': {
    title: 'Taylor Swift & Travis Kelce Just Hit a Major Milestone',
  },
  'timothee-chalamet-career-2026': {
    title: "Timothée Chalamet — How He Became Hollywood's Most Wanted",
  },
  'dune-part-three-everything-we-know-2026': {
    title: "Dune: Part Three — Everything We Know About Paul's Fate",
  },
  'line-of-succession-british-throne-explained-2026': {
    title: 'Who Is Next in Line to the British Throne? Explained',
  },
  'sydney-sweeney-career-2026': {
    title: "How Sydney Sweeney Became Hollywood's Busiest Actress",
  },
  'zendaya-tom-holland-relationship-2026': {
    metaDescription: 'The full Zendaya and Tom Holland timeline — how Spider-Man brought them together and why they keep it almost entirely private.',
  },
  'sabrina-carpenter-secret-romance-exposed': {
    excerpt: "Sabrina Carpenter's rumoured romance set the internet off. What has actually been confirmed, and what is still just speculation.",
  },
  'prince-harry-and-meghan-markle-make-shocking-royal-exit': {
    title: 'Prince Harry & Meghan Markle — The Royal Exit Explained',
    metaDescription: 'Why Prince Harry and Meghan Markle stepped back from royal duties, what they gave up, and where they sit in the line of succession.',
    excerpt: 'Why Harry and Meghan stepped back from royal duties, what they actually gave up, and where they stand now.',
  },
};

/* ── British → American spelling ─────────────────────────────── */
/* Explicit word list, not substring replace: "criticism" and "analysis" are
   identical in both spellings and must not be touched. */
const SPELLING = {
  favourite: 'favorite', favourites: 'favorites',
  colour: 'color', colours: 'colors', coloured: 'colored', colourful: 'colorful',
  organisation: 'organization', organisations: 'organizations',
  recognise: 'recognize', recognised: 'recognized', recognises: 'recognizes', recognising: 'recognizing',
  realise: 'realize', realised: 'realized', realises: 'realizes', realising: 'realizing',
  sceptical: 'skeptical', sceptic: 'skeptic', sceptics: 'skeptics', scepticism: 'skepticism',
  programme: 'program', programmes: 'programs',
  defence: 'defense',
  theatre: 'theater', theatres: 'theaters', theatrical: 'theatrical',
  centre: 'center', centres: 'centers', centred: 'centered',
  behaviour: 'behavior', behaviours: 'behaviors',
  honour: 'honor', honoured: 'honored',
  apologise: 'apologize', apologised: 'apologized',
  analyse: 'analyze', analysed: 'analyzed', analysing: 'analyzing',
  criticise: 'criticize', criticised: 'criticized', criticising: 'criticizing',
  rumour: 'rumor', rumours: 'rumors', rumoured: 'rumored',
  licence: 'license', practise: 'practice',
  travelled: 'traveled', travelling: 'traveling',
  cancelled: 'canceled', cancelling: 'canceling',
  labelled: 'labeled', modelling: 'modeling',
  towards: 'toward',
};

const matchCase = (src, out) =>
  src[0] === src[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out;

function americanise(text) {
  let n = 0;
  Object.entries(SPELLING).forEach(([uk, us]) => {
    const re = new RegExp(`\\b${uk}\\b`, 'gi');
    text = text.replace(re, (m) => { n++; return matchCase(m, us); });
  });
  return { text, n };
}

/* ── Apply ───────────────────────────────────────────────────── */
let rewritten = 0, spellFixed = 0, filesTouched = 0;

fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).forEach((f) => {
  const fp = path.join(DIR, f);
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let touched = false;

  const fix = FIX[d.slug];
  if (fix) {
    Object.entries(fix).forEach(([k, v]) => { if (d[k] !== v) { d[k] = v; touched = true; } });
    if (touched) { rewritten++; console.log(`rewrote  ${d.slug}  (title ${d.title.length}c)`); }
  }

  ['title', 'excerpt', 'metaDescription', 'imageAlt', 'content'].forEach((k) => {
    if (typeof d[k] !== 'string') return;
    const { text, n } = americanise(d[k]);
    if (n) { d[k] = text; spellFixed += n; touched = true; }
  });

  if (touched) { fs.writeFileSync(fp, JSON.stringify(d, null, 2), 'utf8'); filesTouched++; }
});

console.log(`\n${rewritten} articles rewritten · ${spellFixed} spellings americanised · ${filesTouched} files written`);
