/* Generates the standalone client-facing viewer HTML */

/* Phosphor icon SVG paths (inline, no CDN dependency) */
const PH = {
  arrowSquareOut: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M224,104a8,8,0,0,1-16,0V59.32l-82.34,82.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"/></svg>`,
  link:           `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140.4A40,40,0,0,1,117.33,142,8,8,0,1,0,106.69,154a56,56,0,0,0,76.81-2.26l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z"/></svg>`,
  moon:           `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23Z"/></svg>`,
  sun:            `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"/></svg>`,
  check:          `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>`,
};

function esc(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildViewer(imgs, title, eyebrow, slug, client, date, pres, note, logoB64, headshotB64) {
  const pages = imgs.length;
  const PORTFOLIO = 'https://margehagan.framer.website/?utm_source=ig&utm_medium=social&utm_content=link_in_bio';

  const imgsHTML = imgs.map((src, i) =>
    `<div class="page-wrap">
        <span class="page-num">${i + 1} / ${pages}</span>
        <img src="${src}" alt="${esc(title)} — page ${i + 1}" loading="lazy" />
      </div>`
  ).join('\n      ');

  const briefSection = client
    ? `  <section class="brief-strip">
    <div class="brief-inner">
      <div>
        <p class="brief-for">Prepared for</p>
        <h2 class="brief-client">${esc(client)}</h2>
      </div>
      <div class="brief-meta">
        ${date ? `<span class="brief-date">${esc(date)}</span>` : ''}
        ${pres ? `<span class="brief-pres">${esc(pres)}</span>` : ''}
      </div>
      ${note ? `<p class="brief-note">${esc(note)}</p>` : ''}
    </div>
  </section>` : '';

  const logoTag = logoB64
    ? `<img class="t-logo" src="${logoB64}" alt="Lady-Marge" /><span class="t-div"></span>` : '';

  const heroLogoTag = logoB64
    ? `<div class="hero-logo"><img src="${logoB64}" alt="Lady-Marge" /></div>` : '';

  const headshotTag = headshotB64
    ? `<img class="f-photo" src="${headshotB64}" alt="Marge Hagan" />` : '';

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} — Lady-Marge</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--mag:#A71F5A;--mag-dark:#7d1644;--mag-pale:rgba(167,31,90,0.06);--mag-dim:rgba(167,31,90,0.14);}
    [data-theme="light"]{
      --bg:#FAF0F5;--surface:#fff;--card:#fff;--body:#1A0A12;--sub:#6b3352;
      --vbg:#F2E4EC;--bar:#fff;--bar-t:#1A0A12;--border:rgba(167,31,90,0.12);
    }
    [data-theme="dark"]{
      --bg:#1A0010;--surface:#250018;--card:#1f0014;--body:#F5D7D7;
      --sub:rgba(245,215,215,0.7);--vbg:#160010;--bar:#0d0008;--bar-t:#F5D7D7;
      --border:rgba(255,255,255,0.07);
    }
    html{scroll-behavior:smooth;}
    body{font-family:"Montserrat",sans-serif;background:var(--bg);color:var(--body);min-height:100vh;transition:background .3s,color .3s;-webkit-font-smoothing:antialiased;}

    /* ── Topbar ── */
    .topbar{position:sticky;top:0;z-index:100;height:58px;background:var(--bar);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 28px;box-shadow:0 1px 0 var(--border),0 4px 20px rgba(167,31,90,0.07);}
    .t-left{display:flex;align-items:center;gap:10px;text-decoration:none;}
    .t-logo{height:30px;width:auto;}
    .t-div{width:1px;height:20px;background:var(--border);}
    .t-name{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--bar-t);}
    .t-right{display:flex;align-items:center;gap:6px;}

    /* Shared button base */
    .btn{display:inline-flex;align-items:center;gap:6px;font-family:"Montserrat",sans-serif;font-size:11px;font-weight:600;padding:6px 13px;border-radius:20px;cursor:pointer;letter-spacing:.03em;text-decoration:none;transition:all .18s;white-space:nowrap;}
    /* Ghost */
    .btn-ghost{background:transparent;border:1px solid var(--border);color:var(--sub);}
    .btn-ghost:hover{border-color:var(--mag);color:var(--mag);background:var(--mag-pale);}
    /* Icon-only ghost */
    .btn-icon{background:transparent;border:1px solid var(--border);color:var(--sub);padding:6px 9px;border-radius:20px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .18s;}
    .btn-icon:hover{border-color:var(--mag);color:var(--mag);background:var(--mag-pale);}
    /* Solid */
    .btn-solid{background:var(--mag);border:1px solid var(--mag);color:#fff;}
    .btn-solid:hover{background:var(--mag-dark);border-color:var(--mag-dark);}

    .copied-toast{font-size:10px;font-weight:700;color:var(--mag);opacity:0;transition:opacity .25s;pointer-events:none;display:flex;align-items:center;gap:4px;}
    .copied-toast.on{opacity:1;}

    /* ── Hero ── */
    .hero{padding:56px 24px 44px;text-align:center;border-bottom:1px solid var(--border);}
    .hero-eye{font-size:10px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--mag);margin-bottom:18px;}
    .hero-logo{margin:0 auto 22px;}
    .hero-logo img{height:62px;width:auto;}
    .hero-title{font-size:clamp(24px,4vw,42px);font-weight:700;color:var(--body);line-height:1.1;margin-bottom:10px;}
    .hero-sub{font-size:12px;color:var(--sub);font-weight:500;}

    /* ── Brief strip ── */
    .brief-strip{background:var(--surface);border-bottom:3px solid var(--mag);}
    .brief-inner{max-width:960px;margin:0 auto;padding:40px 28px;display:grid;grid-template-columns:1fr auto;gap:20px 48px;align-items:start;}
    @media(max-width:640px){.brief-inner{grid-template-columns:1fr;}}
    .brief-for{font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--mag);margin-bottom:8px;}
    .brief-client{font-size:clamp(28px,4vw,44px);font-weight:700;color:var(--body);line-height:1.05;}
    .brief-meta{display:flex;flex-direction:column;gap:8px;text-align:right;}
    @media(max-width:640px){.brief-meta{text-align:left;}}
    .brief-date{font-size:13px;font-weight:700;color:var(--body);}
    .brief-pres{font-size:11px;font-weight:500;color:var(--sub);letter-spacing:.04em;}
    .brief-note{grid-column:1/-1;font-size:12px;color:var(--sub);font-style:italic;border-top:1px solid var(--border);padding-top:16px;margin-top:4px;}

    /* ── Deck ── */
    .shell{max-width:960px;margin:0 auto;padding:40px 20px 80px;}
    .card{background:var(--card);border-radius:16px;box-shadow:0 1px 0 rgba(167,31,90,0.12),0 12px 48px rgba(167,31,90,0.07);overflow:hidden;}
    .card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;background:var(--surface);border-bottom:1px solid var(--border);}
    .card-lbl{font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--mag);}
    .card-pages{font-size:11px;color:var(--sub);font-weight:500;}
    .deck-view{width:100%;background:var(--vbg);display:flex;flex-direction:column;align-items:center;gap:24px;padding:32px 24px 40px;scroll-behavior:smooth;}
    .page-wrap{position:relative;width:100%;max-width:860px;}
    .page-wrap img{width:100%;height:auto;display:block;border-radius:10px;box-shadow:0 4px 32px rgba(0,0,0,0.1),0 1px 4px rgba(0,0,0,0.05);}
    .page-num{position:absolute;top:14px;right:14px;font-size:9px;font-weight:700;letter-spacing:.1em;background:rgba(0,0,0,0.32);color:#fff;padding:3px 9px;border-radius:12px;backdrop-filter:blur(6px);}

    /* ── Footer ── */
    .footer{background:var(--mag);color:#F5D7D7;overflow:hidden;position:relative;}
    .f-top{max-width:920px;margin:0 auto;padding:60px 28px 48px;display:grid;grid-template-columns:1fr 1fr;gap:40px 60px;}
    @media(max-width:600px){.f-top{grid-template-columns:1fr;gap:32px;padding:48px 24px 36px;}}
    .f-lbl{font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#e8b4c8;margin-bottom:12px;display:block;}
    .f-contact p{font-size:13px;color:#F5D7D7;margin-bottom:4px;font-weight:600;}
    .f-contact a{color:#F5D7D7;text-decoration:none;font-size:12px;display:block;margin-bottom:4px;opacity:.85;font-weight:500;}
    .f-contact a:hover{opacity:1;text-decoration:underline;}
    .f-socials{display:flex;flex-direction:column;gap:8px;}
    .s-link{display:flex;align-items:center;gap:10px;color:#F5D7D7;text-decoration:none;font-size:12px;opacity:.85;font-weight:500;transition:opacity .15s;}
    .s-link:hover{opacity:1;}
    .s-dot{width:5px;height:5px;border-radius:50%;background:#e8b4c8;flex-shrink:0;}
    /* Hero footer band */
    .f-bottom{position:relative;min-height:600px;overflow:hidden;border-top:1px solid rgba(255,255,255,0.1);}
    .f-content{position:relative;z-index:2;padding:56px 28px 56px;max-width:52%;min-width:300px;}
    @media(max-width:700px){.f-content{max-width:100%;}}
    .f-big-head{font-size:clamp(38px,6vw,70px);font-weight:900;line-height:1.0;color:#F5D7D7;text-transform:uppercase;letter-spacing:-.01em;margin-bottom:20px;}
    .f-big-head em{color:#fff;font-style:normal;}
    .f-subtitle{font-size:14px;color:rgba(245,215,215,.82);font-weight:500;line-height:1.6;max-width:380px;margin-bottom:32px;}
    .f-links{display:flex;flex-direction:column;gap:11px;border-left:3px solid rgba(245,215,215,.25);padding-left:18px;margin-bottom:36px;}
    .f-link{display:flex;align-items:baseline;gap:14px;font-size:13px;}
    .f-link-label{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,215,215,.45);flex-shrink:0;min-width:80px;}
    .f-link a{color:#F5D7D7;text-decoration:none;font-weight:500;opacity:.9;transition:opacity .15s;}
    .f-link a:hover{opacity:1;text-decoration:underline;}
    .f-legal{font-size:10px;font-weight:600;color:rgba(255,255,255,.25);letter-spacing:.06em;}
    .f-photo-wrap{position:absolute;right:0;bottom:0;width:55%;max-width:620px;z-index:1;line-height:0;pointer-events:none;}
    .f-photo{width:100%;height:auto;display:block;object-fit:cover;object-position:top center;}
    @media(max-width:700px){.f-photo-wrap{position:static;width:100%;max-width:100%;}}
  </style>
</head>
<body>

  <header class="topbar">
    <a class="t-left" href="${PORTFOLIO}" target="_blank" rel="noopener">
      ${logoTag}
      <span class="t-name">Lady-Marge</span>
    </a>
    <nav class="t-right">
      <span class="copied-toast" id="copied">${PH.check} Copied!</span>
      <button class="btn-icon" id="theme-btn" title="Toggle dark mode">${PH.moon}</button>
      <button class="btn btn-ghost" id="copy-btn">${PH.link} Copy link</button>
      <a class="btn btn-solid" href="${PORTFOLIO}" target="_blank" rel="noopener">
        Portfolio ${PH.arrowSquareOut}
      </a>
    </nav>
  </header>

  <section class="hero">
    <p class="hero-eye">${esc(eyebrow)}</p>
    ${heroLogoTag}
    <h1 class="hero-title">${esc(title)}</h1>
    <p class="hero-sub">Scroll through the deck below.</p>
  </section>

${briefSection}

  <main class="shell">
    <div class="card">
      <div class="card-head">
        <span class="card-lbl">Client Deck</span>
        <span class="card-pages">${pages} page${pages !== 1 ? 's' : ''}</span>
      </div>
      <div class="deck-view">
        ${imgsHTML}
      </div>
    </div>
  </main>

  <footer class="footer">
    <div class="f-top">
      <div class="f-contact">
        <span class="f-lbl">Get in touch</span>
        <p>Marge Hagan</p>
        <a href="mailto:ladymarge11@gmail.com">ladymarge11@gmail.com</a>
      </div>
      <div class="f-socials">
        <span class="f-lbl">Follow</span>
        <a class="s-link" href="https://instagram.com/margehagan" target="_blank" rel="noopener">
          <span class="s-dot"></span>@margehagan
        </a>
        <a class="s-link" href="${PORTFOLIO}" target="_blank" rel="noopener">
          <span class="s-dot"></span>margehagan.framer.website
        </a>
      </div>
    </div>

    <div class="f-bottom">
      <div class="f-content">
        <h2 class="f-big-head">Let's work<br>together<br><em>again.</em></h2>
        <p class="f-subtitle">These assets are the foundation. What comes next is the story we bring to life together.</p>
        <div class="f-links">
          <div class="f-link"><span class="f-link-label">Portfolio</span><a href="${PORTFOLIO}" target="_blank" rel="noopener">margehagan.framer.website</a></div>
          <div class="f-link"><span class="f-link-label">Email</span><a href="mailto:ladymarge11@gmail.com">ladymarge11@gmail.com</a></div>
          <div class="f-link"><span class="f-link-label">Instagram</span><a href="https://instagram.com/margehagan" target="_blank" rel="noopener">@margehagan</a></div>
        </div>
        <span class="f-legal">© Lady-Marge · All rights reserved</span>
      </div>
      <div class="f-photo-wrap">
        ${headshotTag}
      </div>
    </div>
  </footer>

  <script>
    (function() {
      const themeBtn = document.getElementById("theme-btn");
      const copyBtn  = document.getElementById("copy-btn");
      const copied   = document.getElementById("copied");
      const MOON = \`${PH.moon}\`;
      const SUN  = \`${PH.sun}\`;

      themeBtn.addEventListener("click", () => {
        const h = document.documentElement;
        const isDark = h.dataset.theme === "dark";
        h.dataset.theme = isDark ? "light" : "dark";
        themeBtn.innerHTML = isDark ? MOON : SUN;
      });

      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          copied.classList.add("on");
          setTimeout(() => copied.classList.remove("on"), 1800);
        });
      });
    })();
  <\/script>
</body>
</html>`;
}
