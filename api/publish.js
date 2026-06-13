const { issueSignedToken, presignUrl } = require('@vercel/blob');

const DECK_PATH_RE = /^decks\/[a-z0-9][a-z0-9-]{0,62}\.html$/;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// Returns a ready-to-fetch presigned PUT URL for the requested deck pathname.
// The browser uploads the deck HTML directly to Blob storage with this URL —
// no further signing or query-param assembly is needed on the client.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let body;
  try { body = await readBody(req); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  const pathname = body?.pathname;
  if (!pathname || !DECK_PATH_RE.test(pathname)) {
    return res.status(400).json({ error: 'Invalid deck pathname' });
  }

  try {
    const token = await issueSignedToken({
      pathname,
      operations: ['put'],
      allowedContentTypes: ['text/html'],
      maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB — no deck will exceed this
      validUntil: Date.now() + 60 * 60 * 1000,
    });

    const { presignedUrl } = await presignUrl(token, {
      operation: 'put',
      pathname,
      access: 'public',
      allowedContentTypes: ['text/html'],
      maximumSizeInBytes: 200 * 1024 * 1024,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 300,
    });

    return res.json({ presignedUrl });
  } catch (err) {
    console.error('publish error:', err);
    return res.status(400).json({ error: err.message });
  }
};