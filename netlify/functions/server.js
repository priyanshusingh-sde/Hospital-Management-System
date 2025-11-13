// netlify/functions/server.js
// Wrapper that adapts the exported Express app into a Netlify Function.
const serverless = require('serverless-http');
const path = require('path');

let app;
try {
  // Adjust path if your backend app is located elsewhere
  app = require(path.join(__dirname, '../../backend/app'));
} catch (err) {
  console.error('Failed to require backend/app.js. Ensure backend/app.js exports an Express app.');
  throw err;
}

module.exports.handler = serverless(app);
