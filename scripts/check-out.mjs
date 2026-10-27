/**
 * 빌드 결과 out/ 를 배포 **전에** 검사한다. `npm run build` 끝에 자동으로 돈다.
 *
 * 여기서 보는 것은 전부 **화면에는 아무 표시가 없어서** 눈으로는 못 잡는 것들이다.
 *   · 언어판 HTML 이 out/<언어>.html 로 있는가 (끝 슬래시 설정이 틀어지면 <언어>/index.html 이 된다)
 *   · <html lang> 이 그 언어인가
 *   · canonical 이 자기 자신의 전체 주소인가 (basePath 가 빠지면 허브 /ko 를 가리킨다)
 *   · hreflang 이 모든 언어판에서 같은 전체 목록 + x-default(영어)인가
 *   · .pages.dev / .workers.dev 가 어디에도 없는가
 *   · 404.html 이 있고 noindex · canonical 없음인가
 *   · sitemap.xml 에 언어판이 전부 있고 통로(/<도구>)는 없는가
 *   · worker 의 LANGS 가 config.ts 의 LOCALES 와 같은가
 *   · locales/*.json 에 채우지 않은 __자리__ 가 없는가
 */
import { existsSync, readFileSync } from 'node:fs';

const config = readFileSync('src/i18n/config.ts', 'utf8');
const BASE = config.match(/export const BASE = '([^']+)'/)[1];
const LOCALES = [...config.match(/export const LOCALES = \[([^\]]+)\]/)[1].matchAll(/'([a-z-]+)'/g)].map((m) => m[1]);
const XDEFAULT = config.match(/export const XDEFAULT_LOCALE: Locale = '([^']+)'/)[1];
const SITE = 'https://prelaps.com';

const errors = [];
const fail = (msg) => errors.push(msg);
const url = (lang) => `${SITE}${BASE}/${lang}`;

/** <link rel=alternate hreflang=…> 를 { hreflang: href } 로. 속성 순서는 Next 가 정한다. */
function alternates(html) {
  const out = {};
  for (const tag of html.match(/<link[^>]+hrefLang=[^>]*>|<link[^>]+hreflang=[^>]*>/gi) ?? []) {
    const lang = tag.match(/hreflang="([^"]+)"/i)?.[1];
    const href = tag.match(/href="([^"]+)"/)?.[1];
    if (lang && href) out[lang] = href;
  }
  return out;
}

const expected = Object.fromEntries([...LOCALES.map((l) => [l, url(l)]), ['x-default', url(XDEFAULT)]]);

for (const lang of LOCALES) {
  const file = `out/${lang}.html`;
  if (!existsSync(file)) {
    fail(`${file} 가 없다 — next.config 의 trailingSlash 가 false 인지 본다`);
    continue;
  }
  const html = readFileSync(file, 'utf8');

  if (!new RegExp(`<html[^>]* lang="${lang}"`).test(html)) fail(`${file}: <html lang="${lang}"> 가 아니다`);

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== url(lang)) fail(`${file}: canonical 이 ${canonical} — ${url(lang)} 이어야 한다`);

  const og = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  if (og !== url(lang)) fail(`${file}: og:url 이 ${og} — ${url(lang)} 이어야 한다`);

  const got = alternates(html);
  if (JSON.stringify(got, Object.keys(expected).sort()) !== JSON.stringify(expected, Object.keys(expected).sort())) {
    fail(`${file}: hreflang 목록이 다르다\n    있음 ${JSON.stringify(got)}\n    기대 ${JSON.stringify(expected)}`);
  }
}

// 채우지 않은 __자리__ 는 HTML 이 아니라 원본에서 찾는다 — Next 의 RSC 데이터에 __PAGE__ 같은 내부 토큰이 있다.
for (const file of ['src/i18n/main.ts', 'package.json']) {
  const left = readFileSync(file, 'utf8').match(/__[A-Z0-9_]+__/g);
  if (left) fail(`${file}: 채우지 않은 자리가 남아 있다 — ${[...new Set(left)].join(' ')}`);
}

for (const file of [...LOCALES.map((l) => `out/${l}.html`), 'out/404.html', 'out/sitemap.xml']) {
  if (existsSync(file) && /\.(pages|workers)\.dev/.test(readFileSync(file, 'utf8'))) fail(`${file}: .pages.dev / .workers.dev 를 가리킨다`);
}

if (!existsSync('out/404.html')) {
  fail('out/404.html 이 없다 — 없는 주소가 전부 soft 404 가 된다 (app/global-not-found.tsx)');
} else {
  const html = readFileSync('out/404.html', 'utf8');
  if (!/<meta name="robots" content="noindex/.test(html)) fail('out/404.html: noindex 가 없다');
  if (/rel="canonical"/.test(html)) fail('out/404.html: canonical 이 있으면 안 된다');
}

// 뷰어(/imageviewer/editor)는 설명 글이 없는 앱 화면이다. 색인하지 않고 canonical 도 달지 않는다.
// 공유 링크(?u=…)가 주소마다 다른 페이지로 색인되면 얇은 페이지가 무더기로 생긴다.
if (!existsSync('out/editor.html')) {
  fail('out/editor.html 이 없다');
} else {
  const html = readFileSync('out/editor.html', 'utf8');
  if (!/<meta name="robots" content="noindex/.test(html)) fail('out/editor.html: noindex 가 없다');
  if (/rel="canonical"/.test(html)) fail('out/editor.html: canonical 이 있으면 안 된다');
}

if (!existsSync('out/sitemap.xml')) {
  fail('out/sitemap.xml 이 없다');
} else {
  const xml = readFileSync('out/sitemap.xml', 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const lang of LOCALES) if (!locs.includes(url(lang))) fail(`sitemap.xml: ${url(lang)} 이 없다`);
  if (locs.some((l) => l === SITE + BASE || l === SITE + BASE + '/')) fail('sitemap.xml: 통로 주소(언어 없는 루트)가 들어 있다');
  if (locs.some((l) => l.includes('/editor'))) fail('sitemap.xml: 뷰어(noindex)가 들어 있다');
}

const worker = readFileSync('worker/index.js', 'utf8');
const workerPrefix = worker.match(/const PREFIX = '([^']+)'/)?.[1];
if (workerPrefix !== BASE) fail(`worker PREFIX(${workerPrefix}) 가 config BASE(${BASE}) 와 다르다`);
const workerLangs = [...(worker.match(/const LANGS = \[([^\]]+)\]/)?.[1] ?? '').matchAll(/'([a-z-]+)'/g)].map((m) => m[1]);
if (workerLangs.join() !== LOCALES.join()) fail(`worker LANGS(${workerLangs}) 가 config LOCALES(${LOCALES}) 와 다르다`);

if (errors.length) {
  console.error(`\n✗ out/ 검사 실패 ${errors.length}건\n`);
  for (const e of errors) console.error('  · ' + e);
  process.exit(1);
}
console.log(`✓ out/ 검사 통과 — ${LOCALES.join(' · ')} · 404 · sitemap · worker`);
