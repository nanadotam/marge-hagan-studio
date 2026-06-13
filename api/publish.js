const { handleUpload } = require('@vercel/blob');

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

// Handles two things on the same endpoint:
//  1. Browser asks for a client upload token  → type: blob.generate-client-token
//  2. Vercel Blob confirms upload completed   → type: blob.upload-completed
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let body;
  try { body = await readBody(req); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  try {
    const response = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ['text/html'],
        maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB — no deck will exceed this
        addRandomSuffix: false,
        cacheControlMaxAge: 300,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('Deck live:', blob.url);
      },
    });
    return res.json(response);
  } catch (err) {
    console.error('publish error:', err);
    return res.status(400).json({ error: err.message });
  }
};
