/* Generates the 3 language versions (de-CH root, /hu, /en) from index.html
   Preserves the entire body, inline fonts, favicon, images and design.
   Only the <head> SEO block and the JS default-language logic are changed. */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'index.html');
const today = '2026-06-01';
let html = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');

/* ---------- 1. Per-language head metadata ---------- */
const L = {
  de: {
    htmlLang: 'de-CH',
    pageLang: 'de',
    ogLocale: 'de_CH',
    url: 'https://cesarcleaning.ch/',
    title: 'Cesar Cleaning – Andrea Páll | Reinigung Winterthur',
    desc: 'Cesar Cleaning – Andrea Páll bietet professionelle Reinigung in Winterthur: Standardreinigung, Umzugsreinigung und Dampfreinigung. Zuverlässig & gründlich.',
    keywords: 'Reinigung Winterthur, Reinigungsfirma Winterthur, Putzfrau Winterthur, Standardreinigung, Umzugsreinigung, Dampfreinigung, Büroreinigung, Haushaltsreinigung, Fensterreinigung, Reinigungsservice Winterthur, chemiefreie Reinigung, Kärcher Dampfreiniger, Cesar Cleaning, Andrea Páll',
  },
  hu: {
    htmlLang: 'hu',
    pageLang: 'hu',
    ogLocale: 'hu_HU',
    url: 'https://cesarcleaning.ch/hu/',
    title: 'Cesar Cleaning – Andrea Páll | Takarítás Winterthur',
    desc: 'Cesar Cleaning – Andrea Páll professzionális takarítás Winterthurban: általános takarítás, költözés utáni takarítás és gőztisztítás. Megbízható és alapos.',
    keywords: 'takarítás Winterthur, takarítócég Winterthur, általános takarítás, költözés utáni takarítás, gőztisztítás, irodatakarítás, lakástakarítás, ablaktisztítás, takarítás Svájc, bejárónő Winterthur, vegyszermentes takarítás, Kärcher gőztisztító, Cesar Cleaning, Andrea Páll',
  },
  en: {
    htmlLang: 'en',
    pageLang: 'en',
    ogLocale: 'en_US',
    url: 'https://cesarcleaning.ch/en/',
    title: 'Cesar Cleaning – Andrea Páll | Cleaning Winterthur',
    desc: 'Cesar Cleaning – Andrea Páll offers professional cleaning in Winterthur: standard cleaning, move-out cleaning and steam cleaning. Reliable and thorough.',
    keywords: 'cleaning Winterthur, cleaning company Winterthur, cleaning service Winterthur, standard cleaning, move-out cleaning, steam cleaning, office cleaning, household cleaning, window cleaning, house cleaning Switzerland, chemical-free cleaning, Kärcher steam cleaner, Cesar Cleaning, Andrea Páll',
  },
};

/* Shared hreflang block (identical in every file) */
const hreflang =
`<link rel="alternate" hreflang="de-CH" href="https://cesarcleaning.ch/">
<link rel="alternate" hreflang="hu" href="https://cesarcleaning.ch/hu/">
<link rel="alternate" hreflang="en" href="https://cesarcleaning.ch/en/">
<link rel="alternate" hreflang="x-default" href="https://cesarcleaning.ch/">`;

function headBlock(d) {
  const jsonld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CleaningService",
    "name": "Cesar Cleaning – Andrea Páll",
    "image": "https://cesarcleaning.ch/og-image.jpg",
    "url": d.url,
    "telephone": "+41774141421",
    "founder": { "@type": "Person", "name": "Andrea Páll" },
    "priceRange": "$$",
    "areaServed": { "@type": "City", "name": "Winterthur" },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Winterthur",
      "addressRegion": "ZH",
      "addressCountry": "CH"
    },
    "description": d.desc,
    "inLanguage": d.pageLang
  });
  return (
`<meta name="keywords" content="${d.keywords}">
<meta name="author" content="Andrea Páll · Cesar Cleaning">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${d.url}">
${hreflang}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Cesar Cleaning – Andrea Páll">
<meta property="og:title" content="${d.title}">
<meta property="og:description" content="${d.desc}">
<meta property="og:url" content="${d.url}">
<meta property="og:locale" content="${d.ogLocale}">
<meta property="og:locale:alternate" content="de_CH">
<meta property="og:locale:alternate" content="hu_HU">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:image" content="https://cesarcleaning.ch/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${d.title}">
<meta name="twitter:description" content="${d.desc}">
<meta name="twitter:image" content="https://cesarcleaning.ch/og-image.jpg">
<script type="application/ld+json">${jsonld}</script>`
  );
}

/* ---------- 2. Original strings to replace (must match exactly) ---------- */
const ORIG_HTML   = '<html lang="de"><head>';
const ORIG_TITLE  = '<title>Cesar Cleaning – Andrea Páll | Winterthur</title>';
const ORIG_DESC   = '<meta name="description" content="Cesar Cleaning – Andrea Páll. Professionelle Reinigung in Winterthur und Umgebung. Standardreinigung, Umzugsreinigung, Dampfreinigung.">';
const ANCHOR      = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">';
const ORIG_LANGV  = "let LANG = 'de';";
const ORIG_DOCLANG = 'document.documentElement.lang = lang;';
const ORIG_INIT_BODY =
`  applyLang('de',false); // render immediately, don't persist auto-detection

  const tzIsHu=()=>{try{return (Intl.DateTimeFormat().resolvedOptions().timeZone)==='Europe/Budapest';}catch(e){return false;}};
  let settled=false;
  const decide=fn=>{if(settled||hasManual())return;settled=true;fn();};

  const timer=setTimeout(()=>decide(()=>{if(tzIsHu())applyLang('hu',false);}),2500);

  fetch('https://get.geojs.io/v1/ip/country.json')
    .then(r=>r.ok?r.json():Promise.reject())
    .then(d=>{clearTimeout(timer);decide(()=>{if((d&&d.country||'').toUpperCase()==='HU')applyLang('hu',false);});})
    .catch(()=>{clearTimeout(timer);decide(()=>{if(tzIsHu())applyLang('hu',false);});});`;

function assertHas(s, label){ if(!html.includes(s)) throw new Error('NOT FOUND: '+label); }
[ [ORIG_HTML,'html tag'],[ORIG_TITLE,'title'],[ORIG_DESC,'description'],
  [ANCHOR,'preconnect anchor'],[ORIG_LANGV,'LANG var'],[ORIG_DOCLANG,'doc lang'],
  [ORIG_INIT_BODY,'init body'] ].forEach(([s,l])=>assertHas(s,l));

function build(key){
  const d = L[key];
  let out = html;
  out = out.replace(ORIG_HTML, `<html lang="${d.htmlLang}"><head>`);
  out = out.replace(ORIG_TITLE, `<title>${d.title}</title>`);
  out = out.replace(ORIG_DESC, `<meta name="description" content="${d.desc}">`);
  out = out.replace(ANCHOR, () => ANCHOR + '\n' + headBlock(d)); // fn form: avoid $$ special-pattern
  // keep <html lang> consistent (de -> de-CH) when JS re-applies
  out = out.replace(ORIG_DOCLANG, "document.documentElement.lang = (lang==='de'?'de-CH':lang);");
  out = out.replace(ORIG_LANGV, `const PAGE_LANG = '${d.pageLang}';\nlet LANG = '${d.pageLang}';`);
  out = out.replace(ORIG_INIT_BODY, `  applyLang(PAGE_LANG,false); // dedicated URL per language -> render this page's own language`);
  return out;
}

/* ---------- 3. Write files ---------- */
fs.mkdirSync(path.join(__dirname, 'hu'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'en'), { recursive: true });

fs.writeFileSync(path.join(__dirname, 'index.html'), build('de'));
fs.writeFileSync(path.join(__dirname, 'hu', 'index.html'), build('hu'));
fs.writeFileSync(path.join(__dirname, 'en', 'index.html'), build('en'));

/* ---------- 4. robots.txt ---------- */
fs.writeFileSync(path.join(__dirname, 'robots.txt'),
`User-agent: *
Allow: /

Sitemap: https://cesarcleaning.ch/sitemap.xml
Sitemap: https://cesarcleaning.ch/hu/sitemap.xml
Sitemap: https://cesarcleaning.ch/en/sitemap.xml
`);

/* ---------- 5. Sitemaps ---------- */
function sitemap(loc){
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="de-CH" href="https://cesarcleaning.ch/"/>
    <xhtml:link rel="alternate" hreflang="hu" href="https://cesarcleaning.ch/hu/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://cesarcleaning.ch/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://cesarcleaning.ch/"/>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap('https://cesarcleaning.ch/'));
fs.writeFileSync(path.join(__dirname, 'hu', 'sitemap.xml'), sitemap('https://cesarcleaning.ch/hu/'));
fs.writeFileSync(path.join(__dirname, 'en', 'sitemap.xml'), sitemap('https://cesarcleaning.ch/en/'));

/* report */
const tlen = s => Buffer.byteLength(s,'utf8');
for (const k of ['de','hu','en']) {
  console.log(k.toUpperCase(),
    '| title chars:', [...L[k].title].length,
    '| desc chars:', [...L[k].desc].length);
}
console.log('DONE');
