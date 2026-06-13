const { head } = require('@vercel/blob');

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;

function normalizeStoreId(value) {
  return String(value || '').trim().replace(/^store_/, '').toLowerCase();
}

module.exports = async function handler(req, res) {
  const slug = req.query.slug;

  if (!slug) return res.status(400).send('<h1>Missing deck slug</h1>');
  if (!SLUG_RE.test(slug)) return res.status(400).send('<h1>Invalid deck slug</h1>');

  try {
    const pathname = `decks/${slug}.html`;
    let blobUrl;

    if (process.env.BLOB_STORE_ID) {
      const storeId = normalizeStoreId(process.env.BLOB_STORE_ID);
      blobUrl = `https://${storeId}.public.blob.vercel-storage.com/${pathname}`;
    } else if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Legacy fallback for older deployments.
      const blob = await head(pathname, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      blobUrl = blob.url;
    } else {
      return res.status(500).send('<h1>Blob storage not configured</h1>');
    }

    // Fetch the HTML from the public blob URL and proxy it
    const htmlRes = await fetch(blobUrl);
    if (!htmlRes.ok) return res.status(404).send('<h1>Deck not found</h1>');

    const html = await htmlRes.text();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return res.send(html);
  } catch (err) {
    if (err.message?.includes('not found') || err.status === 404) {
      return res.status(404).send('<h1>Deck not found</h1>');
    }
    console.error('deck serve error:', err);
    return res.status(500).send('<h1>Error loading deck</h1>');
  }
};
