import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'https://intuitive-reflection-production.up.railway.app';

// Proxy /api requests to api-server
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.path = '/api' + proxyReq.path;
    }
  }
}));
// Serve static files
app.use(express.static(path.join(__dirname, 'dist/public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
