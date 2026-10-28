import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import path from 'path';
import https from 'https';

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

// Files with a fingerprint in their name never change, so browsers can keep them for a year.
// Everything else, including the page itself, is checked each time so updates arrive at once.
app.use('/assets', express.static(path.join(PUBLIC, 'assets'), { maxAge: '365d', immutable: true }));
app.use(express.static(PUBLIC, { maxAge: 0 }));

// SPA fallback
app.get('*', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(PUBLIC, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
