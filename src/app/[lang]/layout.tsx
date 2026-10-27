/**
 * 소개 화면의 루트 레이아웃 — <html lang> · 머리(허브 링크 · 언어 · 테마) · 바닥(허브 정책).
 *
 * **app/layout.tsx 가 아니라 [lang] 안에 있다** — <html lang> 이 언어마다 정적으로 박혀야 해서다.
 * 뷰어(/editor)는 다른 루트 레이아웃((pages)/(Nolayouts)/editor/layout.tsx)을 쓴다.
 * 그 대가로 일반 not-found 는 둘 곳이 없다. 404 는 app/global-not-found.tsx 가 맡는다.
 *
 * 디자인은 템플릿 얼굴이 아니라 이 도구의 것이다(main.css 머리말 — 2026-10-27 사용자 결정).
 * 색은 뷰어와 같은 변수(app/globals.css)라 테마 버튼도 뷰어와 같은 값을 쓴다.
 */
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '@/app/globals.css';
import './main.css';
import ThemeToggle from '@/app/(Component)/ThemeToggle';
import { THEME_KEY } from '@/app/(Tools)/theme';
import { LOCALES, LOCALE_LABELS, SITE, isLocale } from '@/i18n/config';
import { localizePath } from '@/i18n/paths';
import { getDictionary } from '@/i18n/main';

/** 첫 그림 전에 고른 테마를 붙인다(뷰어 layout 과 같은 줄). */
const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

/** 목록에 없는 언어는 빌드하지 않는다. */
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function LangLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  // suppressHydrationWarning — 테마 스크립트가 React 보다 먼저 data-theme 을 붙인다. <html> 한 단계에만 걸린다.
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <div className="MAINLAYOUT">
          <header className="MAINLAYOUT-header">
            {/* 허브(prelaps.com/<lang>)로 가는 링크. basePath 밖이라 <a> 로 접두사 없이 쓴다.
                도구가 prelaps 안에 있다는 표시이자 검색엔진에게 어디 속한 페이지인지 알리는 내부 링크다. */}
            <a href={`/${lang}`} className="MAINLAYOUT-brand">
              <span className="MAINLAYOUT-name">prelaps</span>
            </a>
            <nav className="MAINLAYOUT-langs" aria-label={t.langLabel}>
              {LOCALES.map((l) => (
                <a key={l} href={localizePath(l)} hrefLang={l} lang={l} aria-current={l === lang ? 'page' : undefined}>
                  {LOCALE_LABELS[l]}
                </a>
              ))}
              <ThemeToggle className="MAINLAYOUT-theme" labels={{ toLight: t.toLight, toDark: t.toDark }} />
            </nav>
          </header>

          <main className="MAINLAYOUT-main">{children}</main>

          {/* 정책은 허브에 하나씩(헌법 §8). #imageviewer 는 허브 privacy 의 서비스별 블록 id 다. */}
          <footer className="MAINLAYOUT-footer">
            <a href={`/${lang}`}>{t.footer.home}</a>{' · '}
            <a href={`/${lang}/privacy#imageviewer`}>{t.footer.privacy}</a>{' · '}
            <a href={`/${lang}/terms`}>{t.footer.terms}</a>{' · '}
            <a href={`/${lang}/contact`}>{t.footer.contact}</a>
          </footer>
        </div>
        <noscript><p style={{ color: 'var(--danger)', textAlign: 'center' }}>{t.noscript}</p></noscript>
      </body>
    </html>
  );
}
