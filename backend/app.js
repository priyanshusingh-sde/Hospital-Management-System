// backend/app.js
// An Express app that exports pp (do NOT call app.listen here).
// It attempts to load ./config (database) and auto-register route modules from ./routes.

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env in local dev only (Netlify will provide ENV in production)
try {
  require('dotenv').config();
} catch (e) { /* ignore if dotenv missing */ }

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Optional: require your DB config if it sets up a connection
try {
  const dbPath = path.join(__dirname, 'config', 'database.js');
  if (fs.existsSync(dbPath)) {
    require(dbPath);
    console.log('Loaded database config from', dbPath);
  }
} catch (e) {
  console.warn('Could not load database config:', e.message);
}

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Auto-register route files from backend/routes (expects each to export an express.Router)
const routesDir = path.join(__dirname, 'routes');
if (fs.existsSync(routesDir)) {
  fs.readdirSync(routesDir).forEach(file => {
    const full = path.join(routesDir, file);
    if (fs.statSync(full).isFile() && full.endsWith('.js')) {
      try {
        const router = require(full);
        // Derive mount path from filename, e.g., patients.js -> /api/patients
        const name = path.basename(file, '.js');
        const mountPath = name === 'index' ? '/api' : '/api/' + name;
        if (typeof router === 'function' || typeof router === 'object') {
          app.use(mountPath, router);
          console.log('Mounted', full, 'at', mountPath);
        } else {
          console.warn('Route file did not export a router:', full);
        }
      } catch (e) {
        console.error('Failed to register route', full, e.message);
      }
    }
  });
} else {
  console.warn('No routes directory found at', routesDir);
}

// Export app for server and serverless wrappers
module.exports = app;
