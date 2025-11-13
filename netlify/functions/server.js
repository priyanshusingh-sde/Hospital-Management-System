// netlify/functions/server.js
// Wrapper for Express app (backend/app.js) using serverless-http
const serverless = require('serverless-http');
const path = require('path');

let app;
try {
  app = require(path.join(__dirname, '../../backend/app'));
} catch (err) {
  console.error('Failed to require backend/app.js. Ensure backend/app.js exists and exports an Express app.');
  throw err;
}

module.exports.handler = serverless(app);
