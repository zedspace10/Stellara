import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import path from 'path';
import https from 'https';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = 'https://intuitive-reflection-production.up.railway.app';
const PUBLIC = path.join(__dirname, 'dist/public');

// Send everything compressed. The site's code shrinks to about a third of its size on the way.
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// Manual proxy for /api routes
app.all('/api/*', (req, res) => {
  const targetPath = req.path;
  const targetUrl = new URL(targetPath, API_URL);

  const options = {
    hostname: targetUrl.hostname,
    path: targetUrl.pathname,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  });

  if (req.body && Object.keys(req.body).length > 0) {
    proxyReq.write(JSON.stringify(req.body));
  }

  proxyReq.end();
});

// NASA's exoplanet archive, fetched by our own server and kept for a day. Browsers cannot read
// the archive directly, so without this every visitor would depend on a public relay.
const EXO_COLS = [
  'pl_name', 'hostname', 'discoverymethod', 'disc_year',
  'pl_orbper', 'pl_rade', 'pl_bmasse', 'pl_eqt',
  'sy_dist', 'sy_pnum', 'sy_snum', 'st_spectype', 'ra', 'dec',
].join(',');
const EXO_URL =
  'https://exoplanetarchive.ipac.caltech.edu/TAP/sync' +
  `?QUERY=${encodeURIComponent(`select ${EXO_COLS} from pscomppars where pl_controv_flag=0`)}` +
  '&FORMAT=json';
const DAY = 24 * 60 * 60 * 1000;
let exo = { body: null, at: 0, pending: null };

async function loadExoplanets() {
  const res = await fetch(EXO_URL, { signal: AbortSignal.timeout(45000) });
  if (!res.ok) throw new Error(`Archive answered ${res.status}`);
  const body = await res.text();
  const rows = JSON.parse(body);
  if (!Array.isArray(rows) || rows.length < 1000) throw new Error('Archive returned too few planets');
  exo = { body, at: Date.now(), pending: null };
  return body;
}

app.get('/data/exoplanets', async (req, res) => {
  try {
    let body = exo.body;
    if (!body || Date.now() - exo.at > DAY) {
      // Only one request to NASA at a time; everyone else waits for the same answer.
      exo.pending = exo.pending || loadExoplanets().finally(() => { exo.pending = null; });
      try {
        body = await exo.pending;
      } catch (err) {
        // If NASA cannot be reached, yesterday's copy is still far better than nothing.
        if (!exo.body) throw err;
        console.error('Exoplanet refresh failed, serving the saved copy:', err.message);
        body = exo.body;
      }
    }
    res.set('Cache-Control', 'public, max-age=3600');
    res.type('application/json').send(body);
  } catch (err) {
    console.error('Exoplanet archive error:', err.message);
    res.status(502).json({ error: 'The exoplanet archive could not be reached' });
  }
});

// The newest weekly picture, read by the PALE app. Any app or page may read it, and it is
// checked again within the hour so a new week arrives promptly.
app.get('/this-week.json', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(PUBLIC, 'this-week.json'));
});

// Each page's own title, line and picture, written into the page for apps that make link
// previews (they do not run the site's code). page-meta.json is made by the build.
let shell = '';
let meta = { site: null, pages: {} };
try {
  shell = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');
  meta = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'page-meta.json'), 'utf8'));
} catch (err) {
  console.error('Page previews unavailable:', err.message);
}

// The address previews point at, whichever host name a request came in on.
const ORIGIN = process.env.SITE_ORIGIN || 'https://stellaraspace.com';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function pageFor(req) {
  const p = req.path.replace(/\/+$/, '') || '/';
  const page = meta.pages[p] || meta.site;
  if (!shell || !page) return shell;
  const image = page.image || `${ORIGIN}/opengraph.jpg`;
  const set = (html, attr, name, value) =>
    html.replace(new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`), `$1${esc(value)}$2`);
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  html = set(html, 'name', 'description', page.description);
  html = set(html, 'property', 'og:title', page.title);
  html = set(html, 'property', 'og:description', page.description);
  html = set(html, 'property', 'og:image', image);
  html = set(html, 'property', 'og:image:alt', page.imageAlt || 'PALE. A single pale blue dot among the stars.');
  html = set(html, 'name', 'twitter:title', page.title);
  html = set(html, 'name', 'twitter:description', page.description);
  html = set(html, 'name', 'twitter:image', image);
  if (page.image) {
    // A weekly picture has its own size, so leave the size hints out rather than give wrong ones.
    html = html.replace(/\s*<meta property="og:image:(width|height)" content="[^"]*" \/>/g, '');
  }
  return html.replace('</head>', `  <meta property="og:url" content="${esc(ORIGIN + (p === '/' ? '/' : p))}" />\n  </head>`);
}

// Files with a fingerprint in their name never change, so browsers can keep them for a year.
// Everything else, including the page itself, is checked each time so updates arrive at once.
app.use('/assets', express.static(path.join(PUBLIC, 'assets'), { maxAge: '365d', immutable: true }));
app.use(express.static(PUBLIC, { maxAge: 0, index: false }));

// Every page is the same app, with that page's preview written in.
app.get('*', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  const html = pageFor(req);
  if (html) res.type('html').send(html);
  else res.sendFile(path.join(PUBLIC, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
