/**
 * One-off: repair the internal link graph.
 *
 * Two problems, one cause. Newer articles link back to older ones, but nothing
 * ever linked forward — so 13 recent articles had zero inbound links, and 13
 * legacy articles had zero outbound links. Google discovers and ranks orphans
 * worst, and one-directional linking wastes the authority a cluster is meant
 * to concentrate.
 *
 * Appends a natural "related" paragraph to each link-less article, pointing at
 * topically adjacent orphans. Run once: node scripts/fix-internal-links.js
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data', 'articles');

const A = (slug, text) => `<a href="/article/${slug}">${text}</a>`;

const ADDITIONS = {
  'biggest-bollywood-movies-2026':
    `<p>For more from Indian entertainment, see our ${A('shah-rukh-khan-career-2026', 'Shah Rukh Khan career breakdown')} and ${A('deepika-padukone-career-2026', 'Deepika Padukone profile')}. On the streaming side, ${A('scam-1992-web-series-why-it-works-2026', 'Scam 1992')} is the highest-rated Indian web series ever made.</p>`,

  'box-office-obsession-surpasses-400-million-globally':
    `<p>For what else is arriving this year, see our roundup of ${A('biggest-movies-still-coming-2026', 'every big movie still coming in 2026')} — including Dune: Part Three, Avengers: Doomsday and The Batman Part II.</p>`,

  'jennifer-lopez-ben-affleck-divorce-timeline':
    `<p>For more celebrity relationship coverage, see our ${A('kylie-jenner-timothee-chalamet-relationship-2026', 'Kylie Jenner and Timothée Chalamet timeline')} and our ${A('rihanna-asap-rocky-relationship-timeline-2026', 'Rihanna and A$AP Rocky breakdown')} — two couples who handle public attention very differently.</p>`,

  'kangana-ranaut-calls-journalist-weirdo-after-vir-das-dismisses-kissing-scene-rumor':
    `<p>For more from the Indian film industry, see our ${A('deepika-padukone-career-2026', 'Deepika Padukone career breakdown')}, our ${A('shah-rukh-khan-career-2026', 'Shah Rukh Khan profile')}, and ${A('biggest-bollywood-movies-2026', 'the biggest Bollywood movies of 2026')}.</p>`,

  'madonna-returns-with-confessions-ii':
    `<p>For more on artists reinventing themselves across decades, see our ${A('ariana-grande-career-2026', 'Ariana Grande career breakdown')} and our ${A('arijit-singh-career-2026', 'Arijit Singh profile')}.</p>`,

  'prince-harry-and-meghan-markle-make-shocking-royal-exit':
    `<p>Wondering where the Sussexes sit in the order now? Our ${A('line-of-succession-british-throne-explained-2026', 'line of succession explainer')} covers exactly that — and why stepping back does not remove anyone from it. For the working side of the monarchy, see ${A('prince-william-prince-of-wales-role-2026', 'what Prince William actually does as Prince of Wales')}.</p>`,

  'sabrina-carpenter-secret-romance-exposed':
    `<p>For more music coverage, see our ${A('olivia-rodrigo-third-album-2026', 'Olivia Rodrigo third album breakdown')}, our ${A('ariana-grande-career-2026', 'Ariana Grande career profile')}, and ${A('madonna-returns-with-confessions-ii', "Madonna's return")}.</p>`,

  'selena-gomez-net-worth-2026':
    `<p>For more on performers who converted early fame into business ownership, see our ${A('ariana-grande-career-2026', 'Ariana Grande breakdown')} — an almost identical starting point — and our ${A('sydney-sweeney-career-2026', 'Sydney Sweeney profile')}.</p>`,

  'stranger-things-season-5-everything-we-know':
    `<p>For more television worth your time, see our ${A('the-last-of-us-season-3-everything-we-know-2026', 'The Last of Us Season 3 guide')} and our ${A('severance-season-3-everything-we-know-2026', 'Severance Season 3 breakdown')}. Confused by how Severance ended? Our ${A('severance-season-1-ending-explained', 'Season 1 ending explained')} covers it scene by scene.</p>`,

  'taylor-swift-india-tour-2026':
    `<p>For more on Swift, see our ${A('taylor-swift-travis-kelce-relationship-milestone', 'Travis Kelce relationship breakdown')}. And for the artist who actually dominates Indian streaming, read our ${A('arijit-singh-career-2026', 'Arijit Singh profile')}.</p>`,

  'taylor-swift-travis-kelce-relationship-milestone':
    `<p>For more celebrity couples, see our ${A('kylie-jenner-timothee-chalamet-relationship-2026', 'Kylie Jenner and Timothée Chalamet timeline')} and our ${A('rihanna-asap-rocky-relationship-timeline-2026', 'Rihanna and A$AP Rocky breakdown')}.</p>`,

  'top-10-romantic-netflix-series-2026':
    `<p>For more streaming picks, see our ${A('best-shows-to-stream-this-weekend-july-2026', 'five best shows streaming right now')} and our ${A('the-last-of-us-season-3-everything-we-know-2026', 'The Last of Us Season 3 guide')}. For the animated hit that became a global phenomenon, read our ${A('kpop-demon-hunters-phenomenon-explained-2026', 'KPop Demon Hunters breakdown')}.</p>`,

  'zendaya-tom-holland-relationship-2026':
    `<p>Beyond the relationship, Zendaya is one of the most influential figures in fashion — our ${A('zendaya-fashion-method-dressing-2026', 'method dressing breakdown')} explains how she changed the red carpet. For another couple navigating enormous public attention, see our ${A('kylie-jenner-timothee-chalamet-relationship-2026', 'Kylie Jenner and Timothée Chalamet timeline')}.</p>`,
};

let changed = 0;
Object.entries(ADDITIONS).forEach(([slug, html]) => {
  const fp = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(fp)) { console.log('MISSING', slug); return; }
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  if (d.content.includes(html)) { console.log('already applied:', slug); return; }
  d.content = d.content.trimEnd() + '\n' + html;
  fs.writeFileSync(fp, JSON.stringify(d, null, 2), 'utf8');
  changed++;
  console.log('linked:', slug);
});
console.log(`\n${changed} articles updated`);
