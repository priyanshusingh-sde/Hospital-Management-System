// defensive wrapper for Netlify functions — lazy-require backend and return 500 with error message if init fails
const path = require('path');

module.exports.handler = async function(event, context) {
  try {
    // require serverless within handler to avoid top-level crashes
    const serverless = require('serverless-http');

    // Lazy-require the app. If backend/app.js throws (e.g. DB connect), catch below.
    let app;
    try {
      app = require(path.join(__dirname, '../../backend/app'));
    } catch (initErr) {
      console.error('App init error:', initErr && initErr.stack ? initErr.stack : initErr);
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: 'App initialization failed', message: initErr.message || String(initErr) }),
      };
    }

    // Use serverless to handle the event
    const handler = serverless(app);
    return await handler(event, context);
  } catch (err) {
    console.error('Function wrapper error:', err && err.stack ? err.stack : err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Function runtime error', message: err.message || String(err) }),
    };
  }
};
