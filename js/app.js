'use strict';

const PDFJS_CDN    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const BLOB_API_URL = 'https://vercel.com/api/blob';

let imageUrls = [];

// Assets loaded from js/assets.js
const logoB64       = typeof ASSET_LOGO           !== 'undefined' ? ASSET_LOGO           : '';
const logoLightB64  = typeof ASSET_LOGO_LIGHT     !== 'undefined' ? ASSET_LOGO_LIGHT     : '';
const headshotB64   = typeof ASSET_HEADSHOT       !== 'undefined' ? ASSET_HEADSHOT       : '';
const fontBoldonse  = typeof ASSET_FONT_BOLDONSE  !== 'undefined' ? ASSET_FONT_BOLDONSE  : '';

function blobToDataUrl(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = e => res(e.target.result);
    r.onerror = () => rej(new Error('FileReader failed'));
    r.readAsDataURL(blob);
  });
}

// ── Slug ──────────────────────────────────────────────────────────────────────
function genSlug() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

let slug = genSlug();

// ── DOM refs ──────────────────────────────────────────────────────────────────
const dropZone  = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fname     = document.getElementById('fname');
const exportBtn = document.getElementById('export-btn');
const prevFrame = document.getElementById('prev-frame');
const prevEmpty = document.getElementById('prev-empty');
const pdfProg   = document.getElementById('pdf-prog');
const progFill  = document.getElementById('prog-fill');
const progTxt   = document.getElementById('prog-txt');
const prevHint  = document.getElementById('prev-hint');
const toast     = document.getElementById('toast');
const titleIn   = document.getElementById('title-in');
const eyebrowIn = document.getElementById('eyebrow-in');
const clientIn  = document.getElementById('client-in');
const dateIn    = document.getElementById('date-in');
const noteIn    = document.getElementById('note-in');
const slugVal      = document.getElementById('slug-val');
const slugRegen    = document.getElementById('slug-regen');
const slugHint     = document.getElementById('slug-hint');
const publishBtn   = document.getElementById('publish-btn');
const pubResult    = document.getElementById('pub-result');
const pubResultUrl = document.getElementById('pub-result-url');
const pubCopyBtn   = document.getElementById('pub-copy-btn');

// ── Slug helpers ──────────────────────────────────────────────────────────────
function sanitizeSlug(raw) {
  return raw.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')   // non-alphanum → hyphen
    .replace(/^-+|-+$/g, '');       // strip leading/trailing hyphens
}

function hasValidSlug() {
  return Boolean(sanitizeSlug(slugVal.value));
}

function updateActionButtons() {
  exportBtn.disabled = !imageUrls.length;
  publishBtn.disabled = !imageUrls.length || !hasValidSlug();
}

function setSlug(value) {
  slug = sanitizeSlug(value);
  slugVal.value = value;
  updateSlugHint();
  updateActionButtons();
  if (imageUrls.length) refreshPreview();
}

function updateSlugHint() {
  const s = slugVal.value.trim();
  if (!s) {
    slugHint.textContent = 'Enter a slug before publishing.';
    slugHint.className = 'slug-hint error';
    return;
  }
  const clean = sanitizeSlug(s);
  if (clean !== s) {
    slugHint.textContent = `Will become: deck/${clean}`;
    slugHint.className = 'slug-hint';
  } else {
    slugHint.textContent = `studio-marge.vercel.app/deck/${clean}`;
    slugHint.className = 'slug-hint';
  }
}

// Seed initial random slug
slugVal.value = slug;
updateSlugHint();

// User types a custom slug
slugVal.addEventListener('input', () => {
  slug = sanitizeSlug(slugVal.value);
  updateSlugHint();
  updateActionButtons();
  if (imageUrls.length) refreshPreview();
});

// Commit sanitized value on blur
slugVal.addEventListener('blur', () => {
  const clean = sanitizeSlug(slugVal.value);
  if (clean) setSlug(clean);
  else updateActionButtons();
});

// Random regen
slugRegen.addEventListener('click', () => setSlug(genSlug()));

// ── Live preview on metadata change ──────────────────────────────────────────
[titleIn, eyebrowIn, clientIn, dateIn, noteIn].forEach(el =>
  el.addEventListener('input', () => { if (imageUrls.length) refreshPreview(); })
);

// ── Drop / file input ─────────────────────────────────────────────────────────
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) handleFile(f);
});
fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

// ── File handling ─────────────────────────────────────────────────────────────
function showError(msg) {
  fname.textContent = msg;
  dropZone.classList.remove('has-file');
  pdfProg.classList.remove('on');
  updateActionButtons();
}

async function handleFile(file) {
  fname.textContent = file.name;
  dropZone.classList.add('has-file');
  imageUrls = [];
  updateActionButtons();

  try {
    if (file.type === 'application/pdf') {
      await renderPDF(file);
    } else if (file.type.startsWith('image/')) {
      pdfProg.classList.add('on');
      progTxt.textContent = 'Reading image…';
      progFill.style.width = '50%';
      imageUrls = [await blobToDataUrl(file)];
      progFill.style.width = '100%';
      pdfProg.classList.remove('on');
      refreshPreview();
      updateActionButtons();
    } else {
      showError('Unsupported format — use PNG, JPG, or PDF');
    }
  } catch (err) {
    console.error('handleFile:', err);
    showError('Error: ' + (err.message || 'Could not process file'));
  }
}

// ── PDF rendering ─────────────────────────────────────────────────────────────
function loadPdfJs() {
  return new Promise((res, rej) => {
    if (window.pdfjsLib) { res(); return; }
    const s = document.createElement('script');
    s.src = PDFJS_CDN;
    s.crossOrigin = 'anonymous';
    s.onload = () => {
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        res();
      } catch (e) { rej(e); }
    };
    s.onerror = () => rej(new Error('Could not load PDF library. Check your internet connection.'));
    document.head.appendChild(s);
  });
}

async function renderPDF(file) {
  pdfProg.classList.add('on');
  progFill.style.width = '0%';
  progTxt.textContent = 'Loading PDF library…';

  await loadPdfJs();

  progTxt.textContent = 'Opening PDF…';
  progFill.style.width = '5%';

  const url = URL.createObjectURL(file);
  let pdf;
  try {
    pdf = await window.pdfjsLib.getDocument({ url, disableAutoFetch: true }).promise;
  } catch (e) {
    URL.revokeObjectURL(url);
    throw new Error('Could not open PDF: ' + (e.message || 'unknown error'));
  }

  const total = pdf.numPages;
  const urls  = [];

  for (let i = 1; i <= total; i++) {
    progTxt.textContent = `Rendering page ${i} of ${total}…`;
    progFill.style.width = Math.round((i / (total + 1)) * 95 + 5) + '%';

    const page = await pdf.getPage(i);
    // Scale 2.5 for sharper output on high-DPI screens
    const vp = page.getViewport({ scale: 2.5 });
    const canvas = document.createElement('canvas');
    canvas.width  = vp.width;
    canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    urls.push(canvas.toDataURL('image/jpeg', 0.93));
  }

  URL.revokeObjectURL(url);
  progFill.style.width = '100%';
  progTxt.textContent = `Done — ${total} page${total !== 1 ? 's' : ''} rendered.`;
  setTimeout(() => pdfProg.classList.remove('on'), 900);

  imageUrls = urls;
  refreshPreview();
  updateActionButtons();
}

// ── Preview ───────────────────────────────────────────────────────────────────
function refreshPreview() {
  const html = buildViewer(
    imageUrls,
    titleIn.value, eyebrowIn.value, slug,
    clientIn.value, dateIn.value, eyebrowIn.value, noteIn.value,
    logoB64, logoLightB64, headshotB64, fontBoldonse
  );
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);

  if (prevFrame._prev) URL.revokeObjectURL(prevFrame._prev);
  prevFrame._prev = url;
  prevFrame.src = url;
  prevFrame.style.display = 'block';
  prevEmpty.style.display = 'none';
  prevHint.textContent = '← your client sees exactly this';
}

// ── Export ────────────────────────────────────────────────────────────────────
exportBtn.addEventListener('click', () => {
  if (!imageUrls.length) return;

  const html = buildViewer(
    imageUrls,
    titleIn.value, eyebrowIn.value, slug,
    clientIn.value, dateIn.value, eyebrowIn.value, noteIn.value,
    logoB64, logoLightB64, headshotB64, fontBoldonse
  );
  const blob = new Blob([html], { type: 'text/html' });
  const a    = document.createElement('a');
  const safe = (titleIn.value || 'lady-marge')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  a.href     = URL.createObjectURL(blob);
  a.download = `${safe}-${slug}.html`;
  a.click();

  toast.classList.add('on');
  setTimeout(() => toast.classList.remove('on'), 5000);
});

// ── Publish Live ──────────────────────────────────────────────────────────────
const PUBLISH_ICON = `<svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L204.69,112H128a88.1,88.1,0,0,0-88,88,8,8,0,0,1-16,0A104.11,104.11,0,0,1,128,96h76.69L170.34,62.34A8,8,0,0,1,181.66,51l48,48A8,8,0,0,1,229.66,109.66Z"/></svg>`;

function setPublishBtn(label, loading = false) {
  publishBtn.innerHTML = PUBLISH_ICON + ' ' + label;
  publishBtn.classList.toggle('loading', loading);
}

function getBlobStoreId(clientToken) {
  const parts = clientToken.split('_');
  if (parts.length < 5 || parts[0] !== 'vercel' || parts[1] !== 'blob' || parts[2] !== 'client') {
    throw new Error('Invalid client upload token');
  }
  return parts[3];
}

publishBtn.addEventListener('click', async () => {
  if (!imageUrls.length) return;
  const cleanSlug = sanitizeSlug(slugVal.value);
  if (!cleanSlug) {
    updateSlugHint();
    updateActionButtons();
    return;
  }
  if (cleanSlug !== slugVal.value.trim()) setSlug(cleanSlug);

  const html = buildViewer(
    imageUrls,
    titleIn.value, eyebrowIn.value, cleanSlug,
    clientIn.value, dateIn.value, eyebrowIn.value, noteIn.value,
    logoB64, logoLightB64, headshotB64, fontBoldonse
  );

  setPublishBtn('Requesting token…', true);
  pubResult.style.display = 'none';

  try {
    const pathname = `decks/${cleanSlug}.html`;

    // Step 1 — get a short-lived client upload token from our server (tiny request, no body limit issue)
    const tokenRes = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'blob.generate-client-token',
        payload: { pathname, multipart: false, clientPayload: '' },
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}));
      throw new Error(err.error || `Token error ${tokenRes.status}`);
    }
    const { clientToken } = await tokenRes.json();

    // Step 2 — upload HTML directly from the browser to Vercel Blob (bypasses 4.5 MB function limit entirely)
    setPublishBtn('Uploading…', true);
    const params = new URLSearchParams({ pathname });
    const storeId = getBlobStoreId(clientToken);
    const uploadRes = await fetch(`${BLOB_API_URL}/?${params.toString()}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${clientToken}`,
        'x-api-blob-request-id': `${storeId}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
        'x-api-version': '12',
        'x-content-type': 'text/html; charset=utf-8',
        'x-vercel-blob-access': 'public',
        'x-vercel-blob-store-id': storeId,
        'x-vercel-blob-source': 'browser-upload',
      },
      body: html,
    });

    if (!uploadRes.ok) {
      const txt = await uploadRes.text().catch(() => uploadRes.statusText);
      throw new Error(`Upload failed (${uploadRes.status}): ${txt.slice(0, 200)}`);
    }

    const deckUrl = `${window.location.origin}/deck/${cleanSlug}`;

    pubResultUrl.href        = deckUrl;
    pubResultUrl.textContent = deckUrl.replace(/^https?:\/\//, '');
    pubResult.style.display  = 'flex';

    pubCopyBtn.onclick = () => {
      navigator.clipboard.writeText(deckUrl).then(() => {
        pubCopyBtn.style.background = '#D4F3E3';
        setTimeout(() => { pubCopyBtn.style.background = ''; }, 1200);
      });
    };
  } catch (err) {
    alert('Could not publish: ' + err.message);
  } finally {
    setPublishBtn('Publish Live', false);
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
// (assets loaded synchronously from js/assets.js)
