const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, slug, title } = req.body || {};

  if (!html || !slug) {
    return res.status(400).json({ error: 'Missing html or slug' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'Blob storage not configured. Add BLOB_READ_WRITE_TOKEN in Vercel dashboard.' });
  }

  try {
    // Upload the viewer HTML to Vercel Blob, keyed by slug (overwrites on republish)
    await put(`decks/${slug}.html`, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const deckPath = `/deck/${slug}`;
    const origin   = req.headers.origin || 'https://studio-marge.vercel.app';
    const deckUrl  = `${origin}${deckPath}`;

    return res.status(200).json({ url: deckUrl, slug, title });
  } catch (err) {
    console.error('publish error:', err);
    return res.status(500).json({ error: err.message || 'Failed to publish deck' });
  }
};
